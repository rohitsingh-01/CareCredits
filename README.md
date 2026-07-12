# CareCredits — On-Chain Caregiver Funding & Compliance on Stellar

CareCredits is a healthcare-focused Web3 platform where families can collectively fund caregiver expenses and send direct care credit payments through the Stellar network.

This repository holds the code, smart contracts, and documentation for the **Stellar Journey to Mastery** belt submissions.

🌐 **Live Vercel Site:** [https://care-credits.vercel.app](https://care-credits.vercel.app)  
💻 **GitHub Repository:** [https://github.com/rohitsingh-01/CareCredits](https://github.com/rohitsingh-01/CareCredits)  
📄 **Smart Contract Entry Point:** [lib.rs](./lib.rs) and [src/lib.rs](./src/lib.rs) (exposing the Soroban smart contract logic at the root)

---

## ⛓ Deployed Smart Contract Details (Stellar Testnet)

*   **CareRegistry Contract ID (Compliance/Admin Layer):** `CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7`
*   **CareFundPool Contract ID (V2 Funding Layer):** `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`
*   **CareFundPool Contract ID (V1 Funding Layer):** `CDX2BJAFJ63Q4Q5ZWEIBIVDZXNE6ND236LAP2BL4NRYLU3TUTY2JBGFQ`
*   **Asset Token ID (Native XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
*   **Initial Setup/Admin Key:** `GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV`
*   **Verifiable Pool Initialization Transaction Hash:** `cdfbc06cc5a27d5e2e844b898248b71ec7144e628deb7d983b4e116fa9d3b168`
    *   *Link:* [StellarExpert Explorer](https://stellar.expert/explorer/testnet/tx/cdfbc06cc5a27d5e2e844b898248b71ec7144e628deb7d983b4e116fa9d3b168)
*   **Cross-Contract Withdrawal Tx Hash (CareFundPool → CareRegistry):** `adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e`
    *   *Link:* [StellarExpert Explorer](https://stellar.expert/explorer/testnet/tx/adcebc4c34a2e2dbebcabdfd04ac8b48f5a65342a1ec0ea597f7ab18c9cfdd9e)

---

## 🟡 Level 2 (Yellow Belt) Submission Overview

### Covered Level 2 Requirements
1.  **StellarWalletsKit Multi-Wallet Selector**:
    *   The **Connect Wallet** button launches a premium multi-wallet selector supporting Freighter, xBull, and browser extensions using `@creit.tech/stellar-wallets-kit`.
2.  **Soroban Smart Contract Operations**:
    *   Calls read-only functions (`total_raised`, `goal`, `caregiver`) via RPC server simulations to display on-chain pool progress.
    *   Submits prepared write transactions to call `contribute` and `withdraw` operations.
3.  **Real-Time Event Synchronisation**:
    *   Polls the Soroban RPC ledger events every 5 seconds for the `CareFundPool` contract to auto-refresh the raised values, progress indicators, and dynamic activity feed.
4.  **Robust Error Handling**:
    *   Catches and shows friendly errors for `WALLET_NOT_FOUND`, `USER_REJECTED`, and performs proactive balance checks to trigger `INSUFFICIENT_BALANCE` alerts.

### Level 2 Screenshots Reference
| State / Step | Screenshot |
|---|---|
| **StellarWalletsKit Modal Options** | ![Wallet Options Modal](Level%202/screenshots/wallet-options.png) |
| **Wallet Connected** | ![Wallet Connected](Level%202/screenshots/pool-connected.png) |
| **Funding Pool Details Loaded** | ![Pool Details Loaded](Level%202/screenshots/pool-loaded.png) |
| **Contribution Success & Feed Event** | ![Contribution Success](Level%202/screenshots/contribute-success.png) |
| **Caregiver Mode Active (Withdraw visible)** | ![Caregiver Mode Loaded](Level%202/screenshots/withdraw-loaded.png) |
| **Withdrawal Success & Transfer** | ![Withdrawal Success](Level%202/screenshots/withdraw-success.png) |

---

## ⚪ Level 1 (White Belt) Submission Overview

### Covered Level 1 Requirements
1.  **Freighter Wallet Setup**: Detects installation, locks to Stellar Testnet, and requests account connection.
2.  **Balance Fetching**: Uses Horizon API to retrieve the XLM balance in real-time, handling unfunded accounts gracefully.
3.  **Direct payment flow**: Allows building, signing, and submitting native XLM payments with transaction memo capabilities.
4.  **Transaction status visibility**: Provides pending indicators, success banners, and links to StellarExpert.

### Level 1 Screenshots Reference
| State / Screen | Screenshot |
|---|---|
| **Freighter Wallet Connected** | ![Wallet Connected](Level%202/screenshots/wallet-connected.png) |
| **XLM Balance Loaded** | ![Balance Displayed](Level%202/screenshots/balance-displayed.png) |
| **Payment Success State** | ![Payment Success](Level%202/screenshots/transaction-success.png) |
| **Transaction Audit Result** | ![Audit Trail](Level%202/screenshots/transaction-result.png) |

---

## 🟠 Level 3 (Orange Belt) Submission Overview

### Covered Level 3 Requirements
1.  **Cross-Contract Gating Compliance**:
    *   On withdrawal, `CareFundPool` invokes the `CareRegistry` check (`is_verified` and `is_paused`) before releasing funds, preventing unauthorized claims and securing the pool.
2.  **CI/CD Pipeline**:
    *   GitHub Actions workflow (`ci.yml`) runs formatting, clippy lints, Rust unit tests, and Node.js frontend tests on every commit/PR.
3.  **Deployment Scripts Orchestration**:
    *   Deployment scripts (`deploy-all.sh`, `deploy.ps1`) handle compiling, deploying, and initializing the contracts sequentially.
4.  **Mobile Responsive UI & Accessibility**:
    *   Clean layout down to 375px viewports, 44px touch targets, and high contrast active focus states.
5.  **Demo Presentation**:
    *   **Demo Video Walkthrough (1–2 minutes):** [Watch the Level 3 Demo Video (Loom/YouTube placeholder)]() *(Replace this link with your uploaded video URL)*

### Level 3 Screenshots Reference
| Requirement | Screenshot |
|---|---|
| **Mobile responsive UI** | ![Mobile Responsive](Level%202/screenshots/mobile-responsive.png) |
| **CI/CD pipeline running** | ![CI Green](Level%202/screenshots/ci-green.png) |
| **Test output with 3+ passing tests** | ![Test Results](Level%202/screenshots/test-results.png) |

---

## 📁 Repository Structure
```
CareCredits/
├── Cargo.toml          # Workspace Cargo configuration (root)
├── lib.rs              # Smart Contract Source (root copy)
├── src/
│   └── lib.rs          # Smart Contract Source (root copy)
├── Level 2/            # Frontend Web App Folder
│   ├── index.html      # Landing Page + Caregiver Directory
│   ├── wallet.html     # Wallet direct payment page
│   ├── pool.html       # Family Fund Pool page
│   ├── pool.js         # Multi-wallet & Soroban Contract integrations
│   ├── app.js          # Direct payment Freighter integration
│   ├── utils.js        # Math and helper functions
│   ├── style.css       # Premium visual theme and styles
│   ├── screenshots/    # UI screenshots
│   └── tests/          # Node.js frontend unit tests
├── contracts/          # Soroban smart contract source code (Rust)
│   ├── Cargo.toml      # Workspaces Cargo configuration
│   ├── fund_pool/      # CareFundPool Contract crate
│   │   └── src/lib.rs  # Rust implementation of the funding logic
│   └── registry/       # CareRegistry Contract crate
│       └── src/lib.rs  # Rust implementation of the registry logic
├── scripts/            # Orchestrated bash & powershell deployment scripts
└── docs/               # System architecture and specifications
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
    npx serve "Level 2"
    ```
3.  Open `http://localhost:3000/pool.html` in your browser.
    *   *Tip:* Append `?testmode=true` to run offline E2E checks with mocked wallet connections.
