# Yellow Belt (Level 2) Documentation — Family Fund Pool

This document details the features, smart contracts, integrations, and compliance evidence for the **Yellow Belt (Level 2)** submission of the CareCredits platform.

---

## 📋 Level 2 Project Overview

The Yellow Belt submission moves beyond simple direct payments to introduce shared community pool funding. It features the deployment and integration of a Soroban smart contract (`CareFundPool`) that aggregates public contributions and gates withdrawals until goals are met, accompanied by multi-wallet support and real-time ledger event streaming.

---

## ⛓️ 1. Smart Contract Details (Stellar Testnet)

The `CareFundPool` contract manages contributions and withdrawal assertions directly on the Stellar Testnet ledger.

*   **CareFundPool Contract ID (V2):** `CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`
    *   *Link:* [StellarExpert Contract Explorer](https://stellar.expert/explorer/testnet/contract/CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO)
*   **Asset Token ID (Native XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
    *   *Link:* [StellarExpert Token Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
*   **Initialization Transaction Hash:** `cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679`
    *   *Link:* [StellarExpert Transaction](https://stellar.expert/explorer/testnet/tx/cb729fb3e895be941910adcebe241315b633bf07e6005dd959bc2c4765d79679)

---

## 🔌 2. StellarWalletsKit Multi-Wallet Integration

We integrate `@creit.tech/stellar-wallets-kit` to allow users to connect with multiple wallet providers seamlessly:
*   **Supported Modules:** Configured with `allowAllModules()` to support Freighter, xBull, Albedo, and other extension wallets.
*   **Modal Selector:** Clicking **Connect Wallet** launches a unified modal for selection.
*   **Integration Wrapper:** Implements `invokeContractViaKit` to bridge user-signed envelopes with Soroban's transaction simulation and preparation pipelines.

---

## 🔄 3. Contract Interactions (Read / Write)

*   **Read-Only Operations:** The client calls `simulateTransaction` on the Soroban RPC server to fetch critical pool metrics without gas fees:
    -   `total_raised`: The accumulated contributions.
    -   `goal`: The funding target.
    -   `caregiver`: The designated withdrawer.
*   **Write Operations:** Invokes write transactions to execute operations on the contract:
    -   `contribute(contributor, amount)`: Allows any user to send XLM to the contract.
    -   `withdraw(caregiver)`: Allows only the designated, verified caregiver to withdraw the total pooled funds.

---

## 📡 4. Real-Time Event Polling & UI Sync

The application implements a 5-second polling loop using `rpcServer.getEvents`:
*   **Event Capture:** Listens for `contrib` and `withdraw` events emitted by the `CareFundPool` contract.
*   **UI Updates:** Automatically updates the SVG circular progress ring, recalculates percentages, and adds entries to the live activity feed.

---

## 🛠️ 5. Error Classification & UX Gating

We implement robust error classification inside `Level 2/utils.js`:
*   `WALLET_NOT_FOUND`: Directs the user to download a supported wallet extension.
*   `USER_REJECTED`: Handles connection or signing cancels gracefully without freezing loading indicators.
*   `INSUFFICIENT_BALANCE`: Proactively compares the user's balance with the target amount and transaction fee reserves.

---

## 🖼️ 6. Yellow Belt Screenshots Reference

All E2E states of the pool interaction flow can be verified on the live site:

| State / Step | File Path | Screenshot Description |
|---|---|---|
| **StellarWalletsKit Modal Options** | `Level 2/screenshots/wallet-options.png` | Displays multi-wallet connection modal overlay. |
| **Wallet Connected** | `Level 2/screenshots/pool-connected.png` | Displays connected account and active caregiver interface. |
| **Funding Pool Details Loaded** | `Level 2/screenshots/pool-loaded.png` | Renders goal, raised amounts, and the SVG circular progress ring. |
| **Contribution Success & Feed Event** | `Level 2/screenshots/contribute-success.png` | Displays the success confetti explosion and live event feed item. |
| **Caregiver Mode Active** | `Level 2/screenshots/withdraw-loaded.png` | Renders the caregiver-specific "Withdraw Funds" action button. |
| **Withdrawal Success & Transfer** | `Level 2/screenshots/withdraw-success.png` | Displays transaction success confirmation for the withdrawal. |

---

## 🧪 7. Local Testing

We write comprehensive unit tests to verify the math and utility functions supporting the Yellow Belt UI:
*   **Frontend Tests:** Located in `Level 2/tests/utils.test.js`.
*   **Execution:** Run `node --test "Level 2/tests/**/*.test.js"` to run the 6 unit test blocks (verifying stroop conversions, error classification, and percentage bounds).
