# CareCredits — Family Fund Pool
### Stellar Journey to Mastery — Level 2 (Yellow Belt) & Level 3 (Orange Belt) Submission

🌐 **Live Vercel Site:** [https://care-credits.vercel.app](https://care-credits.vercel.app) (Direct Fund Pool Link: [https://care-credits.vercel.app/pool](https://care-credits.vercel.app/pool))
💻 **GitHub Repository:** [https://github.com/rohitsingh-01/CareCredits](https://github.com/rohitsingh-01/CareCredits)

---

## ⛓ Deployed Smart Contract Details (Stellar Testnet)

*   **Deployed Contract ID (Testnet Address):** `CDX2BJAFJ63Q4Q5ZWEIBIVDZXNE6ND236LAP2BL4NRYLU3TUTY2JBGFQ`
*   **Asset Token ID (XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
*   **Initial Setup/Admin Key:** `GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV`
*   **Verifiable Transaction Hash of a Contract Call (Initialization):** `7d25e0b82f1b8001d2d3e414c5520979ebc9ff2456341ca8847fbddfc6964ed`
    *   *Link:* [StellarExpert Explorer](https://stellar.expert/explorer/testnet/tx/7d25e0b82f1b8001d2d3e414c5520979ebc9ff2456341ca8847fbddfc6964ed)

---

## ✅ Covered Level 2 (Yellow Belt) Requirements

1.  **StellarWalletsKit Multi-Wallet Integration**:
    *   The **Connect Wallet** button on the Fund Pool page triggers a clean, user-friendly multi-wallet selector modal supporting Freighter, xBull, and browser extensions using `@creit.tech/stellar-wallets-kit`.
2.  **3 Error Types Handled**:
    *   `WALLET_NOT_FOUND` — Friendly message if the extension is missing.
    *   `USER_REJECTED` — Gracefully catches when signature requests are rejected in the browser extension.
    *   `INSUFFICIENT_BALANCE` — Proactively verifies user's native XLM balance (plus reserves/fees) before building transactions to prevent blind contract failures.
3.  **Deployed Soroban Smart Contract**:
    *   The `care_fund_pool` smart contract is fully deployed on Testnet. It tracks contributions, processes caregiver withdrawals on-chain, and restricts unauthorized claims.
4.  **Calling Contract Functions**:
    *   The frontend uses `SorobanRpc.Server` to call read-only (`total_raised`, `goal`, `caregiver`) and write operations (`contribute`, `withdraw`).
5.  **Transaction Status Visibility**:
    *   Users see clear status changes (**Pending → Success/Failure**) with a fullscreen loading overlay and live transaction confirmations linking to StellarExpert.
6.  **Real-Time Event Synchronisation**:
    *   The app polls the ledger every 5 seconds for contract events, dynamically updating the raised progress bar and activity feed on-chain.

---

## 📁 Repository Structure

```
CareCredits/
├── Level 2/            # Frontend Web App Folder (Vercel Root)
│   ├── index.html      # Landing Page + Caregiver Directory
│   ├── wallet.html     # Wallet direct payment page
│   ├── pool.html       # Family Fund Pool page
│   ├── pool.js         # Multi-wallet & Soroban Contract integrations
│   ├── app.js          # Direct payment Freighter integration
│   ├── utils.js        # Math and helper functions
│   └── style.css       # Responsive design system
├── contracts/          # Soroban smart contract source code (Rust)
│   ├── Cargo.toml      # Workspaces Cargo configuration
│   └── fund_pool/      # CareFundPool Contract crate
│       └── src/lib.rs  # Rust implementation of the funding logic
└── README.md           # This Level 2 Submission documentation
```

---

## 🟡 Level 2 (Yellow Belt) — Smart Contract Submission

- **Contract:** `CareFundPool` (Soroban / Rust)
- **Source:** `contracts/fund_pool/src/lib.rs`
- **Deployed Contract ID (Testnet Address):** `CDX2BJAFJ63Q4Q5ZWEIBIVDZXNE6ND236LAP2BL4NRYLU3TUTY2JBGFQ`
- **Asset Token ID (XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Verifiable Transaction Hash of a Contract Call (Initialization):** `7d25e0b82f1b8001d2d3e414c5520979ebc9ff2456341ca8847fbddfc6964ed`
  → https://stellar.expert/explorer/testnet/tx/7d25e0b82f1b8001d2d3e414c5520979ebc9ff2456341ca8847fbddfc6964ed
- **Frontend that calls this contract:** `Level 2/pool.js` and `Level 2/pool.html` (formerly `Level 1/pool.js` and `Level 1/pool.html` — multi-wallet connect via StellarWalletsKit, contribute/withdraw calls, live event polling)
- **Wallet connect for this level:** `Level 2/pool.html` + `Level 2/pool.js` — StellarWalletsKit modal (Freighter, xBull, etc.)
- 📄 [View CareFundPool contract source](contracts/fund_pool/src/lib.rs)

---

## 🟠 Level 3 (Orange Belt) — Advanced Smart Contract System

Two-contract compliance architecture built on top of the Level 2 CareFundPool:

- **`CareRegistry` Contract** (compliance/admin layer)
  - **Contract ID (Testnet Address):** `CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7`
  - **Source:** [contracts/registry/src/lib.rs](contracts/registry/src/lib.rs)
  - **Purpose:** admin-governed verified/paused status per caregiver

- **`CareFundPool` Contract (V2)** (funding + inter-contract compliance check)
  - **Contract ID (Testnet Address):** `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`
  - **Source:** [contracts/fund_pool/src/lib.rs](contracts/fund_pool/src/lib.rs)
  - **Purpose:** on withdrawal, calls `CareRegistry::is_verified` / `is_paused` before releasing funds (inter-contract communication requirement)

- **Verifiable Transaction Hashes (Stellar Expert):**
  - **Registry Verification Call (Admin pre-verifying a caregiver):** `73be04f4a3de07b629b359df30ee1d62eb7851240c5dd6a2cb187a718c5e6fb4`
    → [StellarExpert Link](https://stellar.expert/explorer/testnet/tx/73be04f4a3de07b629b359df30ee1d62eb7851240c5dd6a2cb187a718c5e6fb4)
  - **Pool Initialization (Registering native asset + target caregiver):** `cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679`
    → [StellarExpert Link](https://stellar.expert/explorer/testnet/tx/cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679)
  - **Successful Cross-Contract Withdrawal (Verified & Active caregiver):** `adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e`
    → [StellarExpert Link](https://stellar.expert/explorer/testnet/tx/adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e)
  - **Blocked Withdrawal Attempt (Caregiver paused on Registry):** `dfca635cbf43eef1b053cf5c2a1adcebcbf43a2bd7f8e811ac47fbdbfb6c0ac4` (contribution hash preceding simulation blockage)
    → [StellarExpert Link](https://stellar.expert/explorer/testnet/tx/dfca635cbf43eef1b053cf5c2a1adcebcbf43a2bd7f8e811ac47fbdbfb6c0ac4)

- **Demo Video Walkthrough:** [Demo Video Link] *(Placeholder to be filled after recording)*

### Level 3 Screenshots Reference

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
3.  Open `http://localhost:3000` in your browser.
    *   *Tip:* Append `?testmode=true` to run offline E2E checks with mocked wallet connections.

---

## 🖼 Level 2 Screenshots Reference

All required E2E states are documented below and can be verified on the live site:

| State / Step | Screenshot |
|---|---|
| **StellarWalletsKit Modal Options** | ![Wallet Options Modal](Level%202/screenshots/wallet-options.png) |
| **Contributor Wallet Connected** | ![Contributor Wallet Connected](Level%202/screenshots/pool-connected.png) |
| **Funding Pool Details Loaded** | ![Pool Details Loaded](Level%202/screenshots/pool-loaded.png) |
| **Contribution Success (Raised Updates & Feed Event)** | ![Contribution Success](Level%202/screenshots/contribute-success.png) |
| **Caregiver Mode Loaded (Withdraw Section Active)** | ![Caregiver Mode Loaded](Level%202/screenshots/withdraw-loaded.png) |
| **Withdrawal Success (Raised Reset & Feed Event)** | ![Withdrawal Success](Level%202/screenshots/withdraw-success.png) |
