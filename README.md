# CareCredits — On-Chain Caregiver Funding

CareCredits is a healthcare-focused Web3 platform where families can collectively fund caregiver expenses and send direct care credit payments through the Stellar network.

This repository holds the code and documentation for the **Stellar Journey to Mastery** belt submissions.

---

## 📖 Submissions Documentation

We have divided the detailed documentation, feature sets, technical specifications, and verification screenshots into level-specific READMEs:

### 🟡 [Level 1 (White Belt) Submission — Direct Care Transfer](./README_LEVEL1.md)
*   **Focus**: peer-to-peer direct transfers, Freighter wallet connection, and native XLM balance checks.
*   **Key Files**: `app.js`, `wallet.html`, `utils.js`, `caregivers.js`.
*   [Read Level 1 README & Screenshots](./README_LEVEL1.md)

### 🟠 [Level 2 (Yellow Belt) & Level 3 (Orange Belt) Submission — Family Fund Pool](./README_LEVEL2.md)
*   **Focus**: Soroban Smart Contracts (`CareFundPool` and compliance-layer `CareRegistry`), multi-wallet selection selector modal, event syncing feed, circular SVG progress ring, and cross-contract gating checks.
*   **Key Files**: `pool.js`, `pool.html`, `directory.js`, `contracts/`.
*   [Read Level 2 & 3 Smart Contract README & Screenshots](./README_LEVEL2.md)

---

## 🛠 Local Setup & Running Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/rohitsingh-01/CareCredits.git
   cd CareCredits
   ```
2. Start the local server serving the web application:
   ```bash
   npx serve "Level 2"
   ```
3. Open the browser:
   - Homepage: `http://localhost:3000`
   - Wallet Page: `http://localhost:3000/wallet.html`
   - Fund Pool Page: `http://localhost:3000/pool.html`
   - *Test Mode*: Append `?testmode=true` to any URL to run with simulated mockup wallets.
