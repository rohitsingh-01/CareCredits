# CareCredits — Level 3 (Orange Belt) Architecture

This document describes the architectural flow, component relationships, and trade-offs of the two-contract system implemented for Level 3.

---

## 1. System Overview & Data Flow

The CareCredits system consists of a multi-wallet frontend connected to two distinct smart contracts deployed on the Stellar Testnet:

1. **`CareRegistry` Contract:** Acts as the shared registry that verifies caregiver credentials and allows admins to pause payments in case of security or compliance issues.
2. **`CareFundPool` Contract:** Handles contributions, aggregates raised XLM, and processes withdrawals. It makes a dynamic, on-chain cross-contract call to the `CareRegistry` before releasing any caregiver withdrawal.

### Sequence & Data Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Contributor
    actor Admin
    actor Caregiver
    participant Frontend as Frontend (pool.js / directory.js)
    participant Kit as StellarWalletsKit
    participant Pool as CareFundPool Contract
    participant Registry as CareRegistry Contract

    Note over Frontend, Kit: 1. Wallet Connection Flow
    Contributor->>Frontend: Click "Connect Wallet"
    Frontend->>Kit: openModal()
    Kit->>Contributor: Wallet Selection Modal (Freighter / Albedo)
    Contributor-->>Frontend: Wallet Connected Address

    Note over Frontend, Registry: 2. Initial State Loading & Badges
    Frontend->>Registry: simulateReadOnly (is_verified / is_paused)
    Registry-->>Frontend: Return Caregiver Status (Verified/Paused badges)
    Frontend->>Pool: simulateReadOnly (total_raised / goal / caregiver)
    Pool-->>Frontend: Return Pool Status

    Note over Contributor, Pool: 3. Contribution Flow
    Contributor->>Frontend: Input Amount & Click "Contribute"
    Frontend->>Pool: invokeContractViaKit (contribute)
    Pool-->>Frontend: Return transaction hash & raised sum
    Pool->>Pool: Emit event ("contrib", contributor, amount)

    Note over Caregiver, Registry: 4. Gated Withdrawal Flow
    Caregiver->>Frontend: Click "Withdraw"
    Frontend->>Pool: invokeContractViaKit (withdraw)
    activate Pool
    Note over Pool, Registry: Real-Time Cross-Contract Call (Dynamic)
    Pool->>Registry: invoke_contract("is_verified", caregiver)
    Registry-->>Pool: Return bool (must be true)
    Pool->>Registry: invoke_contract("is_paused", caregiver)
    Registry-->>Pool: Return bool (must be false)
    
    alt Verification fails or Paused is true
        Pool-->>Frontend: Transaction Fails (Aborts on-chain)
    else Verification succeeds and Not Paused
        Pool->>Pool: Transfer XLM to Caregiver Account
        Pool->>Pool: Emit event ("withdraw", caregiver, amount)
        Pool-->>Frontend: Transaction Confirmed (Success)
    end
    deactivate Pool

    Note over Admin, Registry: 5. Compliance & Gating Updates
    Admin->>Registry: invokeContract (set_verified / set_paused)
    Registry->>Registry: Emit event ("verified" / "paused")
    
    Note over Frontend, Pool: 6. Real-Time Sync Polling (Every 5s)
    loop Every 5 seconds
        Frontend->>Pool: getEvents() [CareFundPool Events]
        Frontend->>Registry: getEvents() [CareRegistry Events]
        Frontend->>Registry: simulateReadOnly (refresh statuses)
        Frontend-->>Frontend: Update badges & gate withdraw button dynamically
    end
```

---

## 2. Dynamic Cross-Contract Call Trade-off

Inside `CareFundPool::withdraw`, the inter-contract communication is executed dynamically using:

```rust
let is_verified: bool = env.invoke_contract(
    &registry_address,
    &Symbol::new(&env, "is_verified"),
    vec![&env, caregiver.clone().into_val(&env)],
);
```

### Trade-offs:

1. **Compilation Decoupling (Pro):** By using `env.invoke_contract` (dynamic method invoking using symbol name and address parameters) rather than compiling with `soroban_sdk::contractimport!`, the two crates (`care_registry` and `care_fund_pool`) are compiled completely independently. There is no build-order coupling, which allows the registry to be updated or refactored without breaking the pool contract compilation path.
2. **Loss of Type Safety (Con):** Dynamic invocation bypasses Rust's compile-time type checking. If the registry's method signature changes (e.g. changing the name to `check_verified` or modifying parameters), the compiler will not warn us. Any mismatches will result in runtime transaction failures on-chain.
3. **Audit Readiness:** Code comments have been added inside `contracts/fund_pool/src/lib.rs` to explicitly document this design choice to security auditors.

---

## 3. Real-Time Event Synchronization

The polling loop inside `pool.js` polls the Soroban RPC every 5 seconds for new events matching **both** the pool contract and the registry contract. 
- If an admin verfies/pauses a caregiver, the `verified` or `paused` events from `CareRegistry` are captured live by the polling loop, updating the badges on the UI and disabling or enabling the "Withdraw" button in real-time, even if the caregiver remains on the page.
