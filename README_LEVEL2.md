# CareCredits — Family Fund Pool
### Stellar Journey to Mastery — Level 2 (Yellow Belt) & Level 3 (Orange Belt) Submission

CareCredits is a healthcare-focused Web3 platform where families can collectively fund caregiver expenses through a transparent, on-chain smart contract on the Stellar Testnet. 

---

## ⛓ Deployed Smart Contract Details (Stellar Testnet)

*   **CareRegistry Contract ID (Compliance/Admin Layer):** `CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7`
*   **CareFundPool Contract ID (V2 Funding Layer):** `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`
*   **Asset Token ID (Native XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
*   **Initialization Tx Hash:** `cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679`
*   **Cross-Contract Withdrawal Tx Hash:** `adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e`

---

## ✅ Covered Level 2 & Level 3 Requirements

1.  **StellarWalletsKit Multi-Wallet Selector**:
    - The **Connect Wallet** button launches a premium multi-wallet selector supporting Freighter, xBull, and browser extensions using `@creit.tech/stellar-wallets-kit`.
2.  **Soroban Smart Contract Operations**:
    - Calls read-only functions (`total_raised`, `goal`, `caregiver`) via RPC server simulations to display on-chain pool progress.
    - Submits prepared write transactions to call `contribute` and `withdraw` operations.
3.  **Real-Time Event Synchronisation**:
    - Polls the Soroban RPC ledger events every 5 seconds for both `CareFundPool` and `CareRegistry` contracts to auto-refresh the raised values, progress indicators, and dynamic activity feed.
4.  **Robust Error Handling**:
    - Catches and shows friendly errors for `WALLET_NOT_FOUND`, `USER_REJECTED`, and performs proactive balance checks to trigger `INSUFFICIENT_BALANCE` alerts.
5.  **Level 3 Cross-Contract Gating Compliance**:
    - On withdrawal, `CareFundPool` invokes the `CareRegistry` check (`is_verified` and `is_paused`) before releasing funds, preventing unauthorized claims and securing the pool.

---

## 🎨 Premium Visual Redesign & Visual Mechanics

- **SVG Progress Ring**: Displays the pool funding completion percentage in a smooth circular gauge that animates upon state updates.
- **Success Canvas-Confetti**: Triggers a particle explosion upon successful contract contributions.
- **Responsive Mobile Navbar**: Transitions smoothly into an opaque background on page scroll, with touch-friendly spacing and responsive typography.

---

## 🖼 Level 2 & 3 Screenshots Reference

All required compliance and platform states are documented below and can be verified:

| State / Step | Screenshot |
|---|---|
| **StellarWalletsKit Modal Options** | ![Wallet Options Modal](Level%202/screenshots/wallet-options.png) |
| **Wallet Connected** | ![Wallet Connected](Level%202/screenshots/pool-connected.png) |
| **Funding Pool Details Loaded** | ![Pool Details Loaded](Level%202/screenshots/pool-loaded.png) |
| **Contribution Success & Feed Event** | ![Contribution Success](Level%202/screenshots/contribute-success.png) |
| **Caregiver Mode Active (Withdraw visible)** | ![Caregiver Mode Loaded](Level%202/screenshots/withdraw-loaded.png) |
| **Withdrawal Success & Transfer** | ![Withdrawal Success](Level%202/screenshots/withdraw-success.png) |
| **Mobile responsive UI** | ![Mobile Responsive](Level%202/screenshots/mobile-responsive.png) |
| **CI/CD pipeline running** | ![CI Green](Level%202/screenshots/ci-green.png) |
| **Test output (3+ passing tests)** | ![Test Results](Level%202/screenshots/test-results.png) |

---

## 🛠 Local Setup Instructions

### Prerequisites
*   [Freighter wallet browser extension](https://www.freighter.app/) set to **Testnet**.
*   A modern Node.js environment.

### Steps to Run Locally
1.  Clone the repository:
    ```bash
    git clone https://github.com/rohitsingh-01/CareCredits.git
    cd CareCredits
    ```
2.  Start the static local development server:
    ```bash
    npx serve "Level 2"
    ```
3.  Open `http://localhost:3000/pool.html` in your browser.
    - *Tip:* Append `?testmode=true` to test the wallet connect and contribute/withdraw flows offline.
