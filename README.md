# CareCredits — Care Funding Portal on Stellar

Welcome to **CareCredits**! This repository hosts the full implementation of the Stellar Journey to Mastery challenge, up to **Level 3 (Orange Belt)**.

🌐 **Live Vercel Site:** [https://care-credits.vercel.app](https://care-credits.vercel.app)

---

## 📁 Repository Organization

- **`Level 1/`**: The complete frontend application (HTML, CSS, JS) serving as the main portal:
  - **Landing Page (`index.html`)**: Lists example caregivers, each showing live Verified/Paused credentials retrieved from the blockchain registry.
  - **Wallet Page (`wallet.html`)**: Freighter wallet integration (connect, disconnect, balance fetch, XLM send payments).
  - **Fund Pool Page (`pool.html`)**: StellarWalletsKit multi-wallet integration, real-time funding progress trackers, contribution form, and activity feed streaming.
  - **Helpers & Tests (`utils.js`, `tests/`)**: 100% test-covered math, addresses, and error classifiers.
- **`contracts/`**: Soroban Smart Contracts (Rust):
  - **`registry/`**: CareRegistry compliance contract (defines who is verified/paused).
  - **`fund_pool/`**: CareFundPool compliance-gated smart contract.
- **`scripts/`**: Orchestrated deployment and setup scripts (`deploy-all.sh`, `deploy-all.ps1`).
- **`docs/`**: Architecture and data flow diagrams ([architecture.md](docs/architecture.md)).

---

## ⛓ Active Level 3 Testnet Contracts

- **`CareRegistry` Contract ID:** `CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7`
- **`CareFundPool` Contract ID:** `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`
- **Verifiable Registry Set-Verified Transaction Hash:** `ceebf9f01c8b7ed7a7f7c48f53e757c3ec08df6ae5c3c92f93a56418d985d65c` (Link: [StellarExpert](https://stellar.expert/explorer/testnet/tx/ceebf9f01c8b7ed7a7f7c48f53e757c3ec08df6ae5c3c92f93a56418d985d65c))

---

## 🛠 Local Setup & Running Tests

### 1. Smart Contracts
Ensure Rust (wasm32-none target) and Stellar CLI are installed:
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
# Serve the directory
npx serve .
```
And navigate to `http://localhost:3000` (or the printed port).
