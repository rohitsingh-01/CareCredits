# 🥋 Level 1 (White Belt) — Submission Documentation & Wallet Integration

> **Judged File Path:** This directory (`Level 1/`) AND the repository root (`/`) contain complete, self-contained, fully-functional White Belt wallet integration files.

---

## 📁 Level 1 File Map

- **Wallet Interface:** [`Level 1/wallet.html`](wallet.html) (or root [`wallet.html`](../wallet.html))
- **Wallet Connection & Payment Logic:** [`Level 1/app.js`](app.js) (or root [`app.js`](../app.js))
- **Landing Page & Directory:** [`Level 1/index.html`](index.html) (or root [`index.html`](../index.html))
- **Caregiver Profiles:** [`Level 1/caregivers.js`](caregivers.js)
- **Directory Renderer:** [`Level 1/directory.js`](directory.js)
- **Helper Utilities:** [`Level 1/utils.js`](utils.js)
- **Styling:** [`Level 1/style.css`](style.css)

---

## ⚙️ White Belt Requirement Verification

### 1. Wallet Setup (`@stellar/freighter-api`)
- Integrated in `app.js` via `import freighterApi from "https://esm.sh/@stellar/freighter-api";`
- Checks extension presence via `freighterApi.isConnected()`
- Validates active network via `freighterApi.getNetwork()` (ensures **TESTNET** is selected)

### 2. Wallet Connection Management
- `connectWallet()`: Prompts user via `freighterApi.requestAccess()` and retrieves active public key with `freighterApi.getAddress()`.
- `disconnectWallet()`: Clears active address, resets UI session states, and resets balance displays.

### 3. Horizon Account Balance Fetching
- Queries Stellar Horizon Testnet API (`https://horizon-testnet.stellar.org`) via `server.loadAccount(connectedAddress)`.
- Renders native XLM balance formatted to 4 decimal places.
- Gracefully handles unfunded 404 testnet accounts with helpful Friendbot funding guidance.

### 4. Transaction Building, Signing & Testnet Submission
- Formulates native payment operation using `StellarSdk.Operation.payment`.
- Supports optional text memo up to 28 characters.
- Pre-fills caregiver address when arriving via `?care=<id>` directory links.
- Requests user signature via `freighterApi.signTransaction(xdr)`.
- Submits signed transaction envelope to Stellar Testnet and renders confirmation details + clickable [StellarExpert](https://stellar.expert) transaction audit links.

---

## 📄 Complete Requirement Writeup
For the complete step-by-step audit, transaction proofs, and screenshot evidence, see [`docs/README_WHITE_BELT.md`](../docs/README_WHITE_BELT.md).
