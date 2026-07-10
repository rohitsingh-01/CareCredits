# CareCredits — Family Fund Pool
### Stellar Journey to Mastery — Level 2 (Yellow Belt) Submission

🌐 **Live Vercel Site:** [https://care-credits.vercel.app](https://care-credits.vercel.app)
💻 **GitHub Repository:** [https://github.com/rohitsingh-01/CareCredits](https://github.com/rohitsingh-01/CareCredits)

---

## ⛓ Deployed Smart Contract Details (Stellar Testnet)

*   **Deployed Contract ID:** `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`
*   **Asset Token ID (XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
*   **Initial Setup/Admin Key:** `GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV`
*   **Verifiable Pool Initialization Transaction Hash:** `cdfbc06cc5a27d5e2e844b898248b71ec7144e628deb7d983b4e116fa9d3b168`
    *   *Link:* [StellarExpert Explorer](https://stellar.expert/explorer/testnet/tx/cdfbc06cc5a27d5e2e844b898248b71ec7144e628deb7d983b4e116fa9d3b168)

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
├── Level 1/            # Frontend Web App Folder (Vercel Root)
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
    npx serve "Level 1"
    ```
3.  Open `http://localhost:3000` in your browser.
    *   *Tip:* Append `?testmode=true` to run offline E2E checks with mocked wallet connections.

---

## 🖼 Level 2 Screenshots Reference

All required E2E states are documented below and can be verified on the live site:

| State / Step | Screenshot |
|---|---|
| **StellarWalletsKit Modal Options** | ![Wallet Options Modal](Level%201/screenshots/wallet-options.png) |
| **Contributor Wallet Connected** | ![Contributor Wallet Connected](Level%201/screenshots/pool-connected.png) |
| **Funding Pool Details Loaded** | ![Pool Details Loaded](Level%201/screenshots/pool-loaded.png) |
| **Contribution Success (Raised Updates & Feed Event)** | ![Contribution Success](Level%201/screenshots/contribute-success.png) |
| **Caregiver Mode Loaded (Withdraw Section Active)** | ![Caregiver Mode Loaded](Level%201/screenshots/withdraw-loaded.png) |
| **Withdrawal Success (Raised Reset & Feed Event)** | ![Withdrawal Success](Level%201/screenshots/withdraw-success.png) |
