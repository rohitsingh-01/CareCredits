# CareCredits — Advanced Smart Contracts & Compliance
### Stellar Journey to Mastery — Level 3 (Orange Belt) Submission

CareCredits Level 3 builds a production-ready compliance architecture consisting of a two-contract gating system, comprehensive automated testing, an integrated CI/CD pipeline, and a mobile-responsive interface.

---

## ⛓ Deployed Smart Contract Details (Stellar Testnet)

*   **CareRegistry Contract ID (Compliance/Admin Layer):** `CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7`
    *   *Source:* [contracts/registry/src/lib.rs](contracts/registry/src/lib.rs)
*   **CareFundPool Contract ID (V2 Funding Layer):** `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`
    *   *Source:* [contracts/fund_pool/src/lib.rs](contracts/fund_pool/src/lib.rs)
*   **Asset Token ID (Native XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

---

## ✅ Covered Level 3 Requirements

1.  **Cross-Contract Gating Compliance**:
    *   On withdrawal, `CareFundPool` invokes the `CareRegistry` contract checks (`is_verified` and `is_paused`) before releasing funds, protecting the pool and verifying caregiver credentials on-chain.
2.  **CI/CD Pipeline**:
    *   GitHub Actions workflow (`ci.yml`) runs cargo formatting, clippy lints, Rust unit tests, and Node.js frontend tests on every commit/PR.
3.  **Deployment Scripts Orchestration**:
    *   Deployment scripts (`deploy-all.sh`, `deploy.ps1`) handle compiling, deploying, and initializing the contracts sequentially.
4.  **Mobile Responsive UI & Accessibility**:
    *   Clean layout down to 375px viewports, 44px touch targets, and high contrast active focus states.
5.  **Demo Presentation**:
    *   **Demo Video Walkthrough (1–2 minutes):** [Watch the Level 3 Demo Video (Loom/YouTube placeholder)]() *(Replace this link with your uploaded video URL)*

---

## 🔒 Verification & Compliance Proofs (Stellar Expert)

We deployed a new test instance and ran dynamic operations to demonstrate the on-chain cross-contract gate in action:

1. **Registry Verification Call (Pre-verifying caregiver):** `73be04f4a3de07b629b359df30ee1d62eb7851240c5dd6a2cb187a718c5e6fb4`
   * *Link:* [StellarExpert](https://stellar.expert/explorer/testnet/tx/73be04f4a3de07b629b359df30ee1d62eb7851240c5dd6a2cb187a718c5e6fb4)
2. **Pool Initialization (V2):** `cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679`
   * *Link:* [StellarExpert](https://stellar.expert/explorer/testnet/tx/cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679)
3. **Successful Cross-Contract Withdrawal (Compliance checks passed):** `adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e`
   * *Link:* [StellarExpert](https://stellar.expert/explorer/testnet/tx/adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e)
4. **Blocked Withdrawal Attempt (Caregiver paused on Registry):** `dfca635cbf43eef1b053cf5c2a1adcebcbf43a2bd7f8e811ac47fbdbfb6c0ac4` (preceding contribution)
   * *Link:* [StellarExpert](https://stellar.expert/explorer/testnet/tx/dfca635cbf43eef1b053cf5c2a1adcebcbf43a2bd7f8e811ac47fbdbfb6c0ac4)
   * *Result:* Transaction failed on-chain with the custom assertion message: `"caregiver is paused in the CareRegistry"`

---

## 🖼 Level 3 Screenshots Reference

All required compliance and platform states are documented below and can be verified:

| Requirement | Screenshot |
|---|---|
| **Mobile responsive UI** | ![Mobile Responsive](Level%202/screenshots/mobile-responsive.png) |
| **CI/CD pipeline running** | ![CI Green](Level%202/screenshots/ci-green.png) |
| **Test output with 3+ passing tests** | ![Test Results](Level%202/screenshots/test-results.png) |

---

## 🛠 Setup & Local Verification Instructions

### Prerequisites
*   [Freighter wallet browser extension](https://www.freighter.app/) set to **Testnet**.
*   A clean modern Node.js environment.

### Steps to Run Locally
1.  Clone the repository and enter the directory:
    ```bash
    git clone https://github.com/rohitsingh-01/CareCredits.git
    cd CareCredits
    ```
2.  Start the static local development server:
    ```bash
    npx serve "Level 2"
    ```
3.  Open `http://localhost:3000/pool.html` in your browser.
    *   *Tip:* Append `?testmode=true` to run offline E2E checks with mocked wallet connections.
