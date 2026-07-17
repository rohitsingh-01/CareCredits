# White Belt (Level 1) Documentation — Direct Care Transfer

This document details the features, setup, and compliance evidence for the **White Belt (Level 1)** submission of the CareCredits platform.

---

## 📋 Level 1 Project Overview

The White Belt submission focuses on establishing a direct peer-to-peer Care Credit transfer utilizing the official Freighter Wallet extension. This allows families to send direct, immediate native XLM payments with descriptive memos directly to caregivers, establishing a public, verifiable transaction on the Stellar Testnet ledger.

---

## ⚙️ 1. Wallet Setup & Integration

The application integrates the official `@stellar/freighter-api` package to securely communicate with the Freighter browser extension without exposing or handling user private keys.

### Prerequisites
*   Install the [Freighter Wallet Browser Extension](https://www.freighter.app/).
*   Open Freighter, navigate to Network settings, and ensure the active network is set to **Testnet**.
*   Utilize the Stellar Friendbot to fund your test account with test XLM.

---

## 🔌 2. Connection Management (Connect / Disconnect)

*   **Connect Wallet:** Clicking **Connect Freighter Wallet** triggers a request to the browser extension:
    -   Calls `window.freighterApi.requestAccess()` to gain user permission.
    -   Calls `window.freighterApi.getAddress()` to fetch the active account address.
*   **Wallet Display:** Once authorized, the UI displays the full public key and a shortened version (truncated for premium visual layout).
*   **Disconnect Wallet:** Clicking **Disconnect** clears all local user data, stops active session listeners, and resets the UI to the initial landing state.

---

## 📊 3. Horizon Balance Fetching & Display

*   **Horizon Query:** The application utilizes the native `StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org")` client to query connected accounts.
*   **Balance Rendering:** The account's native XLM balance is formatted to exactly four decimal places for premium visual consistency.
*   **Edge Case Handling:**
    -   *Unfunded Accounts:* If the connected account does not exist on Testnet (HTTP 404), the UI handles the error gracefully and displays a link to fund the account via the Testnet Friendbot.
    -   *No Extension:* If the Freighter extension is missing, the application disables connection targets and alerts the user to install the wallet.

---

## 💸 4. Send XLM & Transaction Flow

*   **Transaction Formulation:** Users enter a caregiver's public address and the amount of XLM to send.
*   **Directory Prefills:** If the URL query parameter `?care=sarah-jenkins` is present, the app automatically pre-populates Sarah's verified public key in the address input field.
*   **Memo Integration:** Supports attaching an optional text memo of up to 28 characters to describe the care transaction.
*   **Submission Sequence:**
    1.  Builds a native Stellar payment operation.
    2.  Requests signature via `window.freighterApi.signTransaction(xdr)`.
    3.  Submits the signed envelope to the Horizon Testnet network.
*   **Status Indicators:** Updates the UI through a complete state transition:
    `Idle -> Preparing -> Waiting for Signature -> Submitting -> Confirmed (Success) / Failed`

---

## 🖼️ 5. White Belt Screenshots Reference

All E2E states of the direct transfer flow can be verified on the live site:

| State / Screen | Screenshot | Screenshot Description |
|---|---|---|
| **Freighter Wallet Connected** | ![Wallet Connected](../Level%203/screenshots/wallet-connected.png) | Displays connected account public address and UI layout. |
| **XLM Balance Loaded** | ![Balance Displayed](../Level%203/screenshots/balance-displayed.png) | Displays formatted native XLM balance. |
| **Payment Success State** | ![Payment Success](../Level%203/screenshots/transaction-success.png) | Displays green success notification and feedback panel. |
| **Transaction Audit Result** | ![Audit Trail](../Level%203/screenshots/transaction-result.png) | Renders the transaction hash and a clickable link to StellarExpert. |

---

## 🔒 6. Verification Checklist & Transaction Proofs

### Stellar Expert Verification Hash
Below is a verified on-chain direct payment transaction hash on the Stellar Testnet:
*   **Payment Hash:** `5e5fa276e036e4f3a67d9834162e08df6ae5c3c92f93a56418d985d65cfedbc0`
*   **Link:** [StellarExpert Transaction](https://stellar.expert/explorer/testnet/tx/5e5fa276e036e4f3a67d9834162e08df6ae5c3c92f93a56418d985d65cfedbc0)

### Compliance Checklist
*   [x] Freighter wallet presence checks on load.
*   [x] Active testnet network check.
*   [x] Safe connect/disconnect session state controls.
*   [x] Graceful 404 unfunded balance checks.
*   [x] Interactive transaction panels showing pending, success, and error outcomes.
*   [x] Clickable StellarExpert audit trails.
