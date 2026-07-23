# ⚙️ CareCredits Administrator Console Operator Manual

**CareCredits Level 4 — Admin Guide**

---

## 🧭 Overview

The CareCredits Admin Console (`admin.html`) provides operational visibility into platform analytics, user experience feedback, caregiver registry statuses, funding pool metrics, and real-time infrastructure system health.

---

## 🔑 1. Logging In

1. Open `/admin.html` in your web browser.
2. In the authentication modal, enter:
   - **Username:** `admin` (or configured `ADMIN_USERNAME`)
   - **Password:** `carecredits2026` (or configured `ADMIN_PASSWORD`)
3. Click **Login to Admin Console →**.
4. Upon successful validation, a session bearer token is stored securely in `localStorage` (`carecredits_admin_token`).
5. **Inactivity Safety:** Sessions automatically expire after 15 minutes of inactivity.

---

## 📊 2. Dashboard Tabs Overview

### 1. 📊 Overview
Displays top-level operational KPIs:
- **Total XLM Volume:** Total XLM deposited across all funding pools.
- **Total Transactions:** On-chain Soroban contract invocations.
- **Connected Wallets:** Unique Freighter wallet keys interacted with platform.
- **Average Feedback Rating:** 5-star feedback rating average.
- **Active Pools:** Total registered funding pools.

### 2. 📈 Time-Series Analytics
Visualizes daily contribution volume and wallet connection trends across active pools.

### 3. 💬 Feedback Submissions
Provides search and filter capabilities for user experience feedback:
- Filter entries by Minimum Star Rating (1-5 ★).
- Search feedback comments by keyword.

### 4. 👩‍⚕️ Caregiver Directory
Lists authorized caregivers registered in the `CareRegistry` smart contract and their assigned funding pool IDs.

### 5. 🏊 Funding Pools
Lists active family funding pools on Stellar Testnet, contract addresses, target goals, and raised balances.

### 6. 🖥️ System Monitoring & Health Diagnostics
Monitors infrastructure health telemetry in real-time (auto-refreshed every 10s):
- PostgreSQL Connection Status & Latency (ms).
- Express Process Server Uptime & Memory Heap Usage (MB).
- Node.js Runtime Version & Environment mode.
- System Health Score (100 / 100).
