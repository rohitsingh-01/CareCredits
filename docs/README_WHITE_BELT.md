# White Belt (Level 1) Submission - Direct XLM Payment dApp

## Resubmission Fix

The earlier review rejected the submission because the judged files did not expose a frontend wallet app and because the project used invalid belt folders/static HTML pages. The current submission fixes that:

- The app is a single root Vite project.
- There is no `/Level 1/` folder and no `/Level 3/` folder.
- There is no standalone `wallet.html`; `/wallet` is a Vite route.
- The wallet code is in judged source files under `src/`.
- `@stellar/freighter-api` and `@stellar/stellar-sdk` are npm dependencies.

## Project Description

CareCredits White Belt is a simple Stellar Testnet payment dApp. A user connects Freighter, verifies the wallet is on Testnet, sees their XLM balance, enters a recipient and amount, signs the transaction in Freighter, and receives success/failure feedback with a transaction hash.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/wallet
```

For UI-only local testing:

```text
http://localhost:5173/wallet?testmode=true
```

## Judged Source Files

| Purpose | File |
|---|---|
| Wallet UI and flow | [`src/pages/wallet.js`](../src/pages/wallet.js) |
| Freighter connect/disconnect/signing | [`src/lib/freighterWallet.js`](../src/lib/freighterWallet.js) |
| Horizon Testnet, balance, payment transaction | [`src/lib/stellar.js`](../src/lib/stellar.js) |
| Error helpers | [`src/lib/utils.js`](../src/lib/utils.js) |
| Responsive styling | [`src/styles/style.css`](../src/styles/style.css) |
| Vite app bootstrap | [`src/main.js`](../src/main.js) and [`src/router.js`](../src/router.js) |

## Requirement Checklist

| White Belt Requirement | Implementation |
|---|---|
| Set up Freighter wallet | `src/lib/freighterWallet.js` imports `isConnected`, `requestAccess`, `getAddress`, `getNetwork`, and `signTransaction` from `@stellar/freighter-api`. |
| Use Stellar Testnet | `src/lib/stellar.js` sets `NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET` and Horizon URL `https://horizon-testnet.stellar.org`. |
| Connect wallet | `connectFreighterWallet()` requests access and returns the public key; `/wallet` has a **Connect Freighter Wallet** button. |
| Disconnect wallet | `disconnectFreighterWallet()` clears local wallet state; `/wallet` has a **Disconnect** button. |
| Fetch XLM balance | `fetchNativeBalance()` calls Horizon `loadAccount(address)`. |
| Display balance clearly | `/wallet` renders a Wallet Balance panel showing the XLM value. |
| Send XLM transaction | `buildNativePaymentTransaction()` creates a native payment operation. |
| Sign transaction | `signWithFreighter()` sends the transaction XDR to Freighter for user approval. |
| Submit on Testnet | `submitClassicTransaction()` submits the signed envelope to Horizon Testnet. |
| Show success/failure | `/wallet` updates status text for building, signing, submitting, success, and failure. |
| Show transaction hash | Success panel prints the hash and links to StellarExpert Testnet. |
| Error handling | Missing wallet, wrong network, invalid address, unfunded account, rejected signing, and failed submit are handled in UI states. |

## Screenshots Required By Checklist

| Checklist Item | Screenshot |
|---|---|
| Wallet connected state | ![Wallet Connected](../screenshots/wallet-connected.png) |
| Balance displayed | ![Balance Displayed](../screenshots/balance-displayed.png) |
| Successful Testnet transaction | ![Transaction Success](../screenshots/transaction-success.png) |
| Transaction result shown to user | ![Transaction Result](../screenshots/transaction-result.png) |

## Verified Testnet Payment

- Transaction hash: `5e5fa276e036e4f3a67d9834162e08df6ae5c3c92f93a56418d985d65cfedbc0`
- Explorer: [StellarExpert Testnet transaction](https://stellar.expert/explorer/testnet/tx/5e5fa276e036e4f3a67d9834162e08df6ae5c3c92f93a56418d985d65cfedbc0)

## Verification Commands

```bash
npm run build
npm run test:frontend
npm test
```
