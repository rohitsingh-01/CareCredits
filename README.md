# CareCredits — Care Funding & Compliance on Stellar

Welcome to **CareCredits**! This repository hosts the full implementation of the CareCredits portal, extending from White Belt (Level 1) to Orange Belt (Level 3) requirements under the Stellar Journey to Mastery challenge.

🌐 **Live Vercel Site:** [https://care-credits.vercel.app](https://care-credits.vercel.app)

---

## 📖 Project Description
CareCredits is an on-chain caregiver support and donation portal. It consists of a multi-wallet frontend connected to a two-contract compliance system on the Stellar Testnet:
1. **`CareRegistry` Contract**: Deployed at `CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7`. Handles administrative verification and pausing of caregiver addresses.
2. **`CareFundPool` Contract**: Deployed at `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`. Handles contribution pooling, goal tracking, and withdrawal logic, making cross-contract calls to verify caregivers before releasing funds.

---

## 🟡 Level-by-Level Feature Summary

### White Belt (Level 1) — Wallet Basics
- **Freighter wallet setup**: Connect/Disconnect Freighter, checking network lock (locks to Testnet).
- **Balance fetching**: Displays connected wallet's XLM balance (fetched from Horizon).
- **Direct XLM payment**: Builds, signs, and submits standard XLM payments to caregivers directly.
- **Transaction feedback**: Showcases transaction hash with a link to StellarExpert.

### Yellow Belt (Level 2) — Funding Pools & Soroban
- **Multi-Wallet Support**: Uses `StellarWalletsKit` supporting Freighter, xBull, LOBSTR, etc.
- **Soroban Integration**: Interfaces with a deployed smart contract (`CareFundPool`) to contribute to and track a caregiver's fundraising goal.
- **Ledger Event Polling**: Polls the RPC every 5s for `contrib` and `withdraw` events to stream real-time updates to the activity feed and progress bar.
- **Client-Side Balance Validation**: Warns users proactively if their balance is insufficient before transaction signing.

### Orange Belt (Level 3) — Two-Contract Compliance System
- **Cross-Contract Compliance**: `CareFundPool` invokes the `CareRegistry` contract (via typed `CareRegistryClient`) inside `withdraw()` to verify that the caregiver is verified and not paused.
- **Event Streaming & Real-Time Sync**: Polls both contracts, dynamically updating Verified/Paused status badges in real-time.
- **CI/CD Pipeline**: `.github/workflows/ci.yml` runs cargo checks (format, clippy block-on-error, tests) and Node.js frontend tests.
- **Deployment Script Orchestration**: Deployment scripts (`deploy-all.sh`, `deploy-all.ps1`) handle compiling, deploying, and initializing the contracts sequentially.
- **Mobile Responsive UI**: Fully responsive styles with breakpoints down to 375px and touch targets optimized for mobile use.

---

## 📁 Repository Structure
```
carecredits/
├── Level 1/            # Frontend Web Application
│   ├── index.html      # Landing Page & Caregiver Directory
│   ├── wallet.html     # White Belt Wallet Page
│   ├── pool.html       # Yellow/Orange Belt Fund Pool Page
│   ├── app.js          # Wallet page script (mock-mode protected)
│   ├── pool.js         # Fund pool page script (mock-mode protected)
│   ├── caregivers.js   # Shared caregiver data
│   ├── utils.js        # Helper functions (tested)
│   ├── style.css       # Responsive styling (accessibility focus ring active)
│   ├── screenshots/    # UI screenshots
│   └── tests/          # Node.js frontend unit tests
├── contracts/          # Rust Soroban Smart Contracts
│   ├── registry/       # CareRegistry contract crate
│   ├── fund_pool/      # CareFundPool contract crate
│   └── target/         # Compiled WASM build targets
├── scripts/            # Orchestrated deployment scripts (Bash & PowerShell)
├── docs/               # System architecture & sequence diagrams
├── LICENSE             # MIT License
└── CONTRIBUTING.md     # Contribution guidelines
```

---

## 🛠 Setup & Running Tests Locally

### 1. Smart Contracts
Ensure Rust (`wasm32-unknown-unknown` target) and Stellar CLI are installed:
```bash
cd contracts
stellar contract build
cargo test --workspace
```

### 2. Frontend & Unit Tests
Run the standalone frontend unit tests using Node's test runner:
```bash
cd "Level 1"
node --test "tests/**/*.test.js"
```

To run the web server locally:
```bash
# Serve the Level 1 directory
npx serve .
```
And navigate to `http://localhost:3000` (or the printed port). Append `?testmode=1` to the URL to enable local mock testing.

---

## 🎞 Demo Video & Screenshots

### Demo Video Walkthrough
[Click here to watch the CareCredits Demo Video (Loom/YouTube link placeholder)]()

### Screenshots

| State | Screenshot |
|---|---|
| **StellarWalletsKit Modal** | ![Wallet Options Modal](Level%201/screenshots/wallet-options.png) |
| **Connected Wallet** | ![Wallet Connected](Level%201/screenshots/wallet-connected.png) |
| **Balance Displayed** | ![Balance Displayed](Level%201/screenshots/balance-displayed.png) |
| **Funding Pool Details** | ![Pool Details Loaded](Level%201/screenshots/pool-loaded.png) |
| **Successful Contribution** | ![Contribution Success](Level%201/screenshots/contribute-success.png) |
| **Withdrawal Success** | ![Withdrawal Success](Level%201/screenshots/withdraw-success.png) |
| **Mobile Responsive Layout** | ![Mobile Responsive View](Level%201/screenshots/mobile-responsive.png) |
| **CI/CD Build Passing** | ![GitHub Actions Green Build](Level%201/screenshots/ci-green.png) |
| **Passing Test Suite** | ![Local Unit Tests Passed](Level%201/screenshots/test-results.png) |

---

## 🚀 Future Improvements

1. **Governance & Multi-Admin**: Migrate `CareRegistry` admin control to a multisig contract or a DAO-like voting mechanism to prevent single-point-of-failure issues.
2. **Contract Upgradability**: Implement Soroban's `update_current_contract_wasm` interface to allow upgrading smart contract business logic without losing historical state.
3. **Partial Withdrawal Support**: Upgrade `CareFundPool` to allow caregivers to perform partial withdrawals rather than forcing a full withdrawal of the pool balance.
4. **Backend/Indexer Layer**: Add an indexer layer (e.g. Mercury, Hubble, or a custom indexer) to cache contract read states instead of querying public Stellar RPC simulation servers on every page load.
