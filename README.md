# CareCredits — On-Chain Caregiver Funding & Compliance on Stellar

CareCredits is a healthcare-focused Web3 platform where families can collectively fund caregiver expenses and send direct care credit payments through the Stellar network.

This repository holds the implementation, smart contracts, and documentation for the **Stellar Journey to Mastery** belt submissions.

🌐 **Live Vercel Site:** [https://care-credits.vercel.app](https://care-credits.vercel.app)  
💻 **GitHub Repository:** [https://github.com/rohitsingh-01/CareCredits](https://github.com/rohitsingh-01/CareCredits)  
📄 **Smart Contract Entry Point:** [lib.rs](./lib.rs) and [src/lib.rs](./src/lib.rs) (exposing the Soroban smart contract logic at the root)

---

## 💡 The Core Idea

In healthcare and family caregiver systems, transparency, compliance, and ease of funding are critical. CareCredits addresses this by leveraging the Stellar network to build a trustless payment and compliance gateway:

1.  **Direct Transfers**: Families can send immediate native XLM payments with descriptive memos directly to caregivers.
2.  **Shared Family Fund Pools**: Communities can pool money together on-chain to cover ongoing caregiver services, releasing funds only when specific milestones/goals are met.
3.  **On-Chain Compliance Gating**: Funding pools check caregiver credentials dynamically against a central verified registry before executing withdrawals.

---

## 🥋 Submission Portals (Belt READMEs)

For detailed evidence, screenshots, deployment transaction hashes, and requirements met for each level, please visit the respective submission documents:

*   ⚪ **[Level 1 (White Belt) README](./README_LEVEL1.md)** — Core Freighter wallet connection, balance fetching, and direct payment flow.
*   🟡 **[Level 2 (Yellow Belt) README](./README_LEVEL2.md)** — Shared CareFundPool contract, StellarWalletsKit multi-wallet modal, and real-time RPC event polling.
*   🟠 **[Level 3 (Orange Belt) README](./README_LEVEL3.md)** — Two-contract gating compliance (`CareRegistry` $\rightarrow$ `CareFundPool` V2), automated test suite, and CI/CD pipeline integration.

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
3.  Open `http://localhost:3000/index.html` in your browser.
    - *Tip:* Append `?testmode=true` to any page to test Freighter and wallet connections offline.
