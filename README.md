# CareCredits — On-Chain Caregiver Funding & Compliance on Stellar

[![CI Pipeline](https://github.com/rohitsingh-01/CareCredits/actions/workflows/ci.yml/badge.svg)](https://github.com/rohitsingh-01/CareCredits/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/deployment-vercel-blue)](https://care-credits.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Belt Claimed: Orange](https://img.shields.io/badge/Belt%20Claimed-Orange%20(Level%203)-orange)](#-submission-portals-journey-to-mastery)

CareCredits is an open-source, healthcare-focused Web3 platform where families can collectively fund caregiver expenses and send direct care credit payments through the Stellar network with on-chain compliance controls.

---

## 🌐 Live Resources & Portals

*   **Live Application:** [https://care-credits.vercel.app](https://care-credits.vercel.app)
*   **GitHub Repository:** [https://github.com/rohitsingh-01/CareCredits](https://github.com/rohitsingh-01/CareCredits)

---

## 🥋 Submission Portals (Journey to Mastery)

For detailed evidence, step-by-step requirements, screenshots, and transaction proofs for each belt level, please visit the dedicated documentation pages:

*   ⚪ **[White Belt (Level 1) — Direct P2P Care Transfer](docs/README_WHITE_BELT.md)**
    - *Features:* Freighter wallet connection, Horizon balance fetching, direct payment flows, and audit panels.
*   🟡 **[Yellow Belt (Level 2) — CareFundPool Contract](docs/README_YELLOW_BELT.md)**
    - *Features:* Multi-wallet support (StellarWalletsKit), Soroban RPC calls (read/write), error classifications, and real-time event polling.
*   🟠 **[Orange Belt (Level 3) — Decoupled Compliance Gating](docs/README_ORANGE_BELT.md)**
    - *Features:* Two-contract compliance model (`CareRegistry` $\rightarrow$ `CareFundPool`), type-safe cross-contract calls, automated CI/CD pipeline, and mobile responsiveness.

---

## 📖 Main Documentation Index

To explore the architecture, deployment, and security of the system, navigate through the specialized documents below:

| Page | Description |
|---|---|
| 🏛️ **[System Architecture](docs/ARCHITECTURE.md)** | Technical data flows, Mermaid sequence diagrams, and design trade-offs. |
| 🛠️ **[Deployment Guide](docs/DEPLOYMENT.md)** | Local compiling, deployer setups, shell scripts, and Vercel hosting. |
| 🛡️ **[Security Specification](docs/SECURITY.md)** | `require_auth` models, cross-contract verification gates, input audits, and storage rent (TTL). |
| 🤝 **[Contributing Guidelines](docs/CONTRIBUTING.md)** | Development environment setup, workflow rules, and Git commit conventions. |
| 📄 **[MIT License](LICENSE)** | Open-source terms and permissions. |

---

## 💡 System Architecture Summary

The CareCredits system consists of a static web frontend integrated with two smart contracts on the Stellar Testnet:
1.  **`CareRegistry` Contract:** Stores administrator-managed verification and pause states for caregivers.
2.  **`CareFundPool` Contract:** Processes contributions and gates withdrawals by dynamically querying `CareRegistry` credentials on-chain during the withdrawal sequence.

For a complete data flow layout, see the [Architecture Document](docs/ARCHITECTURE.md).

---

## 🛠️ Technology Stack

*   **Smart Contracts:** Rust, [Soroban Smart Contract SDK](https://soroban.stellar.org/) (Protocol 21/27 compatible).
*   **Web Frontend:** HTML5, Vanilla JavaScript, CSS3 (Glassmorphism, custom breakpoints).
*   **Wallet Integration:** `@stellar/freighter-api`, `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo).
*   **Ledger Services:** Stellar Horizon API, Soroban RPC Server.
*   **CI/CD:** GitHub Actions (Cargo fmt, Clippy lints, Rust workspace tests, Node.js unit tests).

---

## 🚀 Quick Start (Run Locally)

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/rohitsingh-01/CareCredits.git
    cd CareCredits
    ```
2.  **Launch a Dev Server:**
    ```bash
    npx serve "Level 2"
    ```
3.  **Access the App:**
    - Navigate to `http://localhost:3000/index.html` (Caregiver Directory).
    - Navigate to `http://localhost:3000/pool.html` (Fund Pool page).
    - Navigate to `http://localhost:3000/wallet.html` (Direct Transfer page).
    - *Tip:* Append `?testmode=true` to test the wallet interfaces offline.

---

## 🧪 Testing Summary

We run automated tests across both backend and frontend layers:

*   **Rust Contract Workspace Tests:** 9 test cases asserting administrative controls, contributions, and negative scenarios (unverified/paused caregivers, unauthorized initialization):
    ```bash
    cargo test --workspace --manifest-path contracts/Cargo.toml
    ```
*   **Frontend Helper Tests:** 6 Node test blocks validating math conversions and error parsers:
    ```bash
    node --test "Level 2/tests/**/*.test.js"
    ```

---

## 🤖 CI/CD Build Summary

Our GitHub Actions workspace performs the following actions on every push or pull request to the `main` branch:
1.  Verify code formatting (`cargo fmt`).
2.  Run strict quality checks and lints (`cargo clippy -- -D warnings`).
3.  Execute all workspace contract tests (`cargo test`).
4.  Run all frontend Javascript tests (`node --test`).
