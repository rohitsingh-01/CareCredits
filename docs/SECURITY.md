# Security Specification

This document details the security model, authorization mechanisms, rent protection (TTL) strategies, and threat mitigation patterns implemented across the CareCredits smart contracts and frontend client.

---

## 🔒 1. Smart Contract Authorization Model

Both `CareRegistry` and `CareFundPool` enforce strict, role-based authorization to secure administrative configuration and caregiver withdrawals on-chain.

### Admin Gating via `require_auth()`
For any write operation affecting the configuration state of the contracts, the acting account's authority is validated immediately:

```rust
pub fn set_verified(env: Env, admin: Address, caregiver: Address, verified: bool) {
    admin.require_auth();
    let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    assert_eq!(admin, stored_admin, "only admin can set verified status");
    // ...
}
```

*   **Initialization Integrity:** The `initialize()` function on both contracts uses `admin.require_auth();` to ensure only the authorized deployer key can configure the parameters. Once initialized, subsequent initialization calls panic with `"already initialized"`.
*   **State Verification:** Any configuration adjustment (e.g. `set_verified` or `set_paused`) loads the initial admin address stored during initialization and asserts a match against the signing address.

---

## 🔑 2. Gated Caregiver Withdrawals & Compliance

The `CareFundPool` V2 implements a cross-contract compliance gate to prevent unauthorized or non-compliant withdrawals.

### Multi-Contract Withdrawal Verification Flow

```
+-------------------+           1. withdraw()           +------------------+
|   Caregiver EOA   | --------------------------------> |   CareFundPool   |
+-------------------+                                   +------------------+
                                                                 |
                                                                 | 2. is_verified()
                                                                 | 3. is_paused()
                                                                 v
                                                        +------------------+
                                                        |   CareRegistry   |
                                                        +------------------+
```

1.  **Caregiver Authenticated:** When `withdraw()` is invoked, the caregiver must sign the transaction envelope. The contract calls `caregiver.require_auth()` and matches it against the dedicated caregiver address registered for the pool at initialization.
2.  **Cross-Contract Verification:** The fund pool makes a type-safe cross-contract call using the `CareRegistryClient` to fetch:
    -   `is_verified(caregiver)`: Verifies if the caregiver has been verified by the system administrator.
    -   `is_paused(caregiver)`: Verifies if the caregiver's withdrawal capability is temporarily suspended.
3.  **Assertion Gating:** If verification is `false` or if paused is `true`, the contract panics on-chain, automatically rolling back the transaction:
    ```rust
    assert!(is_verified, "caregiver is not verified by the CareRegistry");
    assert!(!is_paused, "caregiver is paused in the CareRegistry");
    ```

---

## 📥 3. Input Validation & Verification Checks

Both contracts enforce runtime assertions to prevent arithmetic issues or invalid states:

*   **Positive Financial Amounts:** Financial methods like `contribute()` and `initialize()` assert that amounts and goals must be strictly greater than zero (`amount > 0` and `goal > 0`). This prevents negative contribution or zero-goal pool setups.
*   **Address Verification:** The contracts require proper `Address` types for all inputs. The frontend performs client-side public key structure audits using `StellarSdk.StrKey.isValidEd25519PublicKey(address)` to prevent transaction submissions to invalid addresses.
*   **Dynamic Balance Checks:** The frontend evaluates the contributor's native balance against the contribution amount and transaction fee reserves (`userBalance >= amount + reserve`) to fail fast client-side and save users network fees.

---

## ⏳ 4. Rent Protection & Storage TTL

Soroban contracts require rent fees to maintain data in ledger state. CareCredits manages storage lifetimes by explicitly extending the Time-To-Live (TTL) of storage entries.

*   **Instance Storage TTL Extension:** Key metadata (e.g. `Admin`, `Caregiver`, `Goal`, `Token`, `Registry`, `Raised`, `Withdrawn`) are stored as Instance entries. Every write or significant state transition (such as contributions or withdrawals) extends the instance TTL:
    ```rust
    env.storage().instance().extend_ttl(100, 518400); // extends to ~30 days (518,400 ledgers)
    ```
*   **Persistent Storage TTL Extension:** Custom mappings like caregiver verification status and pause states are stored in persistent storage. These entries are explicitly extended during state updates to ensure they do not become inaccessible:
    ```rust
    env.storage().persistent().extend_ttl(&DataKey::Verified(caregiver), 100, 518400);
    ```

---

## 💻 5. Frontend & Wallet Integration Security

*   **Secure Multi-Wallet Modal:** The frontend integrates `@creit.tech/stellar-wallets-kit`, allowing secure user authorization through native extensions (Freighter, xBull, Albedo). Private keys are never handled, stored, or transmitted by the application code.
*   **Browser Sandbox Audits:** Development mock checks (`?testmode=true`) are fully isolated from production ledger calls. Production code uses strict `isTestMode` routing to guarantee that live accounts only sign and submit genuine transactions on the Stellar Testnet.
