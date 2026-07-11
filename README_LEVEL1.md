# CareCredits — Direct Care Transfer
### Stellar Journey to Mastery — Level 1 (White Belt) Submission

CareCredits turns a simple XLM payment into a transparent, on-chain "care credit" — so families and communities can support caregivers directly, with a public, verifiable transaction every time.

Level 1 focuses on building the core Freighter wallet connection, account balance handling, and direct peer-to-peer payment flow on the Stellar Testnet.

---

## ⛓ Direct Transfer Features (Level 1 Requirements)

1. **Freighter Wallet Setup**:
   - Integrates the official `@stellar/freighter-api` to interact with the Freighter browser extension.
2. **Wallet Connection Management**:
   - Connect and disconnect buttons with live status changes, account public key truncation, and clean state resets.
3. **Horizon Balance Fetching**:
   - Uses `StellarSdk.Horizon.Server` to retrieve the connected public key's native XLM balance in real-time, with automatic fallback for unfunded testnet accounts.
4. **Direct Payment Flow**:
   - Builds native XLM payment operations with target recipient address, amount, and an optional 28-character text memo.
   - Signs the transaction securely via Freighter and submits it to the Stellar Testnet Horizon network.
5. **Transaction Status Visibility**:
   - Detailed status messages (**Pending → Success/Failure**) and a clean audit panel showing the finalized transaction hash with links to StellarExpert.
6. **Caregiver Directory Prefills**:
   - Automatically reads the caregiver ID from the URL search parameters (`?care=sarah-jenkins`) and pre-populates the recipient address and memo to simplify user flow.

---

## 🎨 Premium Visual Redesign

The UI has been overhauled to convey trust, safety, and modern healthcare:
- **Soft Color Palette**: Built on a clean soft white background (`#F8FAFC`), deep blue accents (`#2563EB`), and readable slate typography.
- **Glassmorphism**: Translucent cards with subtle blurs (`backdrop-filter`) and thin borders.
- **Micro-interactions**: Pill-shaped action buttons with scale transitions and shadow lifts on hover.
- **Dotted Interactive Canvas**: An active background dotted grid that reacts dynamically to mouse cursor positions.

---

## 🖼 Level 1 Screenshots Reference

All E2E states of the direct transfer flow can be verified on the live site:

| State / Screen | Screenshot |
|---|---|
| **Freighter Wallet Connected** | ![Wallet Connected](Level%202/screenshots/wallet-connected.png) |
| **XLM Balance Loaded** | ![Balance Displayed](Level%202/screenshots/balance-displayed.png) |
| **Payment Success State** | ![Payment Success](Level%202/screenshots/transaction-success.png) |
| **Transaction Audit Result** | ![Audit Trail](Level%202/screenshots/transaction-result.png) |

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
3.  Open `http://localhost:3000/wallet.html` in your browser.
    - *Tip:* Append `?testmode=true` to test Freighter connection mockups offline.
