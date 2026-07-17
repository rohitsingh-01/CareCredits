# Orange Belt (Level 3) Documentation — Advanced Smart Contract System

This document details the advanced smart contracts, compliance gating, CI/CD pipeline, and verification proofs for the **Orange Belt (Level 3)** submission of the CareCredits platform.

---

## 📋 Level 3 Project Overview

The Orange Belt submission elevates CareCredits to a production-ready architecture by implementing a decoupled, two-contract compliance system (`CareRegistry` $\rightarrow$ `CareFundPool`). Before a caregiver can withdraw funds from a pool, the fund pool contract makes an on-chain cross-contract query to the central registry to verify credentials and check for administrative pause flags.

---

## ⛓️ 1. Smart Contract Details (Stellar Testnet)

*   **CareRegistry Contract ID (Compliance/Admin Layer):** `CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7`
    *   *Source:* [contracts/registry/src/lib.rs](file:///c:/Users/rohit/Documents/New%20project/CareCredits/contracts/registry/src/lib.rs)
*   **CareFundPool Contract ID (V2 Funding Layer):** `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`
    *   *Source:* [contracts/fund_pool/src/lib.rs](file:///c:/Users/rohit/Documents/New%20project/CareCredits/contracts/fund_pool/src/lib.rs)
*   **Asset Token ID (Native XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

---

## 🔒 2. Verification & Compliance Proofs (Stellar Expert)

We deployed the active instances and ran dynamic operations to demonstrate the on-chain compliance gate in action:

1.  **Registry Verification Call (Pre-verifying caregiver):** `73be04f4a3de07b629b359df30ee1d62eb7851240c5dd6a2cb187a718c5e6fb4`
    *   *Link:* [StellarExpert Transaction](https://stellar.expert/explorer/testnet/tx/73be04f4a3de07b629b359df30ee1d62eb7851240c5dd6a2cb187a718c5e6fb4)
2.  **Pool Initialization (V2):** `cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679`
    *   *Link:* [StellarExpert Transaction](https://stellar.expert/explorer/testnet/tx/cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679)
3.  **Successful Cross-Contract Withdrawal (Compliance checks passed):** `adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e`
    *   *Link:* [StellarExpert Transaction](https://stellar.expert/explorer/testnet/tx/adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e)
4.  **Blocked Withdrawal Attempt (Caregiver paused on Registry):** `dfca635cbf43eef1b053cf5c2a1adcebcbf43a2bd7f8e811ac47fbdbfb6c0ac4`
    *   *Link:* [StellarExpert Transaction](https://stellar.expert/explorer/testnet/tx/dfca635cbf43eef1b053cf5c2a1adcebcbf43a2bd7f8e811ac47fbdbfb6c0ac4)
    *   *Result:* The transaction aborted on-chain with the custom assertion error: `"caregiver is paused in the CareRegistry"`.

---

## 🛠️ 3. CI/CD & Deployment Workflows

*   **CI Pipeline (`ci.yml`):** Runs formatting, Clippy code quality audits, and test suites on push or pull request to `main`.
*   **Deployment Scripts:** Automatically compiles smart contracts, generates keys, deploys to Testnet, and executes required initializations sequentially. See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.

---

## 🧪 4. Automated Testing

We enforce rigorous unit and integration tests across our contracts:
*   **Rust Workspace Tests:** Deploys a mock `CareRegistry` and `CareFundPool`, mints mock XLM SAC tokens, and asserts happy and negative paths.
*   **Test Scenarios Covered:** Happy path contributions, administrative verification, and panics for non-admin configuration, non-caregiver withdrawals, unverified caregivers, and paused caregivers.
*   **Execution:** Run `cargo test --workspace` inside the `contracts/` folder.

---

## 📱 5. Mobile Responsiveness

The styling system provides an optimized mobile interface:
*   **Adaptability:** Supports viewport configurations down to 320px with real breakpoints (760px, 700px, 400px).
*   **Touch Targets:** Ensures buttons and clickable interactive elements occupy a minimum size of 44x44px to satisfy mobile accessibility standards.

---

## 🛡️ 6. Security & Performance

*   **Security Gating:** The administration parameters enforce strict authentication checks. Withdrawals are gated by a type-safe cross-contract interface. See [SECURITY.md](SECURITY.md) for full details.
*   **Gas Optimization:** Type-safe trait clients are declared inline within `fund_pool/src/lib.rs` to avoid linking heavy dependency crates, resulting in smaller compile-time WASM targets.

---

## 🖼️ 7. Orange Belt Screenshots Reference

All required compliance and platform states are documented below:

| Requirement | Screenshot | Screenshot Description |
|---|---|---|
| **Mobile Responsive UI** | ![Mobile Responsive](../Level%202/screenshots/mobile-responsive.png) | Renders a clean interface layout on a narrow viewport width. |
| **CI/CD Pipeline Running** | ![CI Green](../Level%202/screenshots/ci-green.png) | Verifies a green, successful automated build pipeline run. |
| **Test Output (3+ Passing Tests)** | ![Test Results](../Level%202/screenshots/test-results.png) | Displays terminal test runner logs verifying all Rust contract tests pass. |

---

## 📽️ 8. Demo Video Walkthrough
*   **Demo Video Link:** [CareCredits Walkthrough (YouTube)](https://youtu.be/UgHnk698BJw?si=XiN6-4QFzVk9UR-i)

---

## 🚀 9. Future Roadmap
1.  **Multisig Governance:** Transition the `CareRegistry` administration controls from a single signature key (EOA) to a multisig setup (e.g. Gnosis Safe equivalent).
2.  **Upgradability:** Implement upgrade hooks via Soroban's `update_current_contract_wasm` interface to support code migrations.
3.  **Partial Withdrawals:** Support partial withdrawals for caregivers rather than releasing the full raised balance at once.
