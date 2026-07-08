# CareCredits — Care Funding on Stellar
### Stellar Journey to Mastery — Level 1 (White Belt) Submission

## 📖 Project Description
CareCredits lets anyone send a transparent, on-chain "care credit" — an XLM payment — directly to a caregiver, with a public directory to browse example caregivers and a dedicated wallet page to connect Freighter, check your balance, and send the payment on Stellar Testnet.

This version reorganizes the original single-page submission into two focused pages:
- **`index.html`** — a themed landing page explaining CareCredits and the Caregiver Directory (browse caregivers, select one to pre-fill their address).
- **`wallet.html`** — the dedicated wallet page: connect/disconnect, balance, send payment, transaction result. All the original wallet logic is unchanged from the first submission — only the visual design and page layout changed.

## ✅ Level 1 Requirements Covered
- **Wallet Setup** — Freighter, hard-locked to Stellar **Testnet** (warns if Freighter is on another network). See `wallet.html`.
- **Wallet Connection** — Connect + Disconnect, both implemented in `app.js`.
- **Balance Handling** — fetches live XLM balance from Horizon, displays it clearly, with a refresh button.
- **Transaction Flow** — builds a real Payment operation, signs via Freighter, submits to Testnet, shows a clear success/failure panel with the transaction hash and a StellarExpert link.
- **Development Standards** — logic split across `app.js` (wallet/tx), `directory.js` (caregiver list rendering), `caregivers.js` (shared data), `style.css` (shared theme); try/catch error handling around every network call.

## 🎨 What Changed From the First Version
| Before | Now |
|---|---|
| Single page, generic dark "crypto dashboard" look | Two focused pages, warm healthcare-fintech theme (cream background, teal + coral accents, Poppins/Inter type) |
| Caregiver directory mixed in with the wallet form | Caregiver directory lives on `index.html`; selecting a caregiver links to `wallet.html?care=<id>` which pre-fills the recipient + memo |
| — | Shared `caregivers.js` data file so the directory and the pre-fill logic never fall out of sync |

**Nothing about the wallet connect, balance fetch, or transaction logic changed** — same functions, same element IDs, same Freighter/Horizon calls as the original submission.

## 📁 Project Structure
```
carecredits-white-belt/
├── index.html         # Landing page + Caregiver Directory
├── wallet.html          # Wallet: connect, balance, send payment, tx result
├── style.css             # Shared theme for both pages
├── app.js                 # Wallet logic (unchanged functionality) + caregiver pre-fill
├── directory.js            # Renders caregiver cards on index.html
├── caregivers.js             # Shared caregiver data (single source of truth)
├── screenshots/
└── README.md
```

## ⚠️ Before You Record Screenshots
`caregivers.js` ships with **placeholder public keys** for the two example caregivers (Sarah Jenkins, David Miller). Replace `publicKey` in that file with real Stellar **Testnet** addresses (e.g. a second account you control in Freighter, funded via Friendbot) — a payment to the placeholder keys will fail since they aren't real funded accounts.

## 🛠 Setup Instructions (Run Locally)

### Prerequisites
- [Freighter wallet](https://www.freighter.app/) browser extension, set to **Testnet**
- Any static file server — no `npm install` or build step needed

### Steps
```bash
git clone <your-repo-url>
cd carecredits-white-belt
npx serve .
# or: python3 -m http.server 8080
```
Open the printed local URL — you'll land on the CareCredits home page.

### Using the App
1. On the home page, either click **Open Wallet** to go straight to the wallet page, or browse the **Caregiver Directory** and click **Select & Send Care Credit** on a caregiver card (this takes you to the wallet page with their address pre-filled).
2. On the wallet page, click **Connect Freighter Wallet** and approve in the popup.
3. If your account has no Testnet XLM yet, use **Fund via Friendbot** (or Freighter's built-in option).
4. Your **balance** displays automatically; use **Refresh Balance** any time.
5. Confirm/adjust the recipient, enter an amount, then click **Send Payment** and approve the signature request.
6. The **Transaction Result** panel shows success (with the tx hash + StellarExpert link) or a clear failure reason.
7. Click **Disconnect** to clear the session.

## 🖼 Screenshots
> Add your own screenshots here before submitting — the checklist requires all four:

| State | Screenshot |
|---|---|
| **Wallet connected** | ![Wallet Connected](screenshots/wallet-connected.png) |
| **Balance displayed** | ![Balance Displayed](screenshots/balance-displayed.png) |
| **Successful testnet transaction** | ![Successful Transaction](screenshots/transaction-success.png) |
| **Transaction result shown to user** | ![Transaction Result](screenshots/transaction-result.png) |

## ⚠️ Notes
- Runs on **Stellar Testnet only** — no real funds involved.
- `app.js` loads `@stellar/stellar-sdk` and `@stellar/freighter-api` from the `esm.sh` CDN so there's zero install step.
- Freighter doesn't expose a way for a site to programmatically revoke its own access — "Disconnect" clears this app's local session; full revocation happens inside the Freighter extension (Settings → Manage Connected Apps).
