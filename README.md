# CareCredits — On-Chain Caregiver Funding & Compliance on Stellar

[![CI Pipeline](https://github.com/rohitsingh-01/CareCredits/actions/workflows/ci.yml/badge.svg)](https://github.com/rohitsingh-01/CareCredits/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/deployment-vercel-blue)](https://care-credits.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Belt Claimed: Green](https://img.shields.io/badge/Belt%20Claimed-Green%20(Level%204)-emerald)](#-submission-portals-journey-to-mastery)

**Judged path for current submission: repository root (`/`).**

CareCredits is an open-source, healthcare-focused Web3 platform where families can collectively fund caregiver expenses and send direct care credit payments through the Stellar network with on-chain compliance controls.

## ⚪ Level 1 (White Belt) — Wallet Integration (Canonical Location: `/`)
* **[index.html](index.html):** Landing page and caregiver directory.
* **[wallet.html](wallet.html):** Primary user interface for peer-to-peer care credit direct transfers.
* **[app.js](app.js):** Production logic implementing Freighter wallet connection, account balance fetching, transaction building, and testnet submission.

## 🟢 Level 4 (Green Belt) — Complete Production Platform & Infrastructure
* **Milestone 1:** Soroban Smart Contract Security Audit & Testnet Redeployment (`initialize()` authorization fix).
* **Milestone 2:** Production Analytics Backend (Express + PostgreSQL `/api/analytics` telemetry).
* **Milestone 3:** Interactive User Onboarding System (`onboarding.js` 3-step modal & FSM).
* **Milestone 4:** User Experience Center & Feedback Collection (`feedback.js` 4-step modal & Express `/api/feedback`).
* **Milestone 5:** Admin Dashboard & Multi-Pool Support (`admin.html`, `admin.js`, `pools.js`, `/api/admin/*`).
* **Milestone 6:** Production Hardening, Helmet CSP, Graceful Shutdown, & System Monitoring.
* **Milestone 7:** Comprehensive Testing (58/58 tests passing), Architecture Documentation, & Release Readiness.

---

## 🌐 Live Resources & Portals

* **Live Application:** [https://care-credits.vercel.app](https://care-credits.vercel.app)
* **Demo Video Walkthrough:** [CareCredits Walkthrough (YouTube)](https://youtu.be/UgHnk698BJw?si=XiN6-4QFzVk9UR-i)
* **GitHub Repository:** [https://github.com/rohitsingh-01/CareCredits](https://github.com/rohitsingh-01/CareCredits)

---

## 🥋 Submission Portals & Documentation Index

| Documentation Guide | Description |
|---|---|
| **[`docs/README_LEVEL4_GREEN_BELT.md`](docs/README_LEVEL4_GREEN_BELT.md)** | **Official Rise In Level 4 Green Belt Submission Document** |
| **[`ARCHITECTURE.md`](ARCHITECTURE.md)** | Technical system architecture with Mermaid diagrams |
| **[`SECURITY.md`](SECURITY.md)** | Security architecture report & Helmet protections |
| **[`DEPLOYMENT.md`](DEPLOYMENT.md)** | Production deployment guide (Vercel, Railway, PostgreSQL) |
| **[`ENVIRONMENT.md`](ENVIRONMENT.md)** | Environment variable specification |
| **[`ADMIN_GUIDE.md`](ADMIN_GUIDE.md)** | Operator manual for platform administrators |
| **[`CONTRIBUTING.md`](CONTRIBUTING.md)** | Open-source contributor guidelines |
| **[`LICENSE`](LICENSE)** | Open-source MIT License |

---

## 💡 System Architecture Summary

The CareCredits system consists of a static web frontend integrated with two smart contracts on the Stellar Testnet:
1.  **`CareRegistry` Contract:** Stores administrator-managed verification and pause states for caregivers.
2.  **`CareFundPool` Contract:** Processes contributions and gates withdrawals by dynamically querying `CareRegistry` credentials on-chain during the withdrawal sequence.

For a complete data flow layout, see the [Architecture Document](docs/ARCHITECTURE.md).

---

## 🛠️ Technology Stack

*   **Smart Contracts:** Rust, [Soroban Smart Contract SDK](https://soroban.stellar.org/) (Protocol 21/27 compatible).
*   **Web Frontend:** HTML5, Vanilla JavaScript, CSS3 (Glassmorphism, custom breakpoints).
*   **Wallet Integration:** `@stellar/freighter-api`, `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo).
*   **Ledger Services:** Stellar Horizon API, Soroban RPC Server.
*   **CI/CD:** GitHub Actions (Cargo fmt, Clippy lints, Rust workspace tests, Node.js unit tests).

---

## 🚀 Quick Start (Run Locally)

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/rohitsingh-01/CareCredits.git
    cd CareCredits
    ```
2.  **Launch a Dev Server:**
    ```bash
    npx serve .
    ```
3.  **Access the App:**
    - Navigate to `http://localhost:3000/index.html` (Caregiver Directory).
    - Navigate to `http://localhost:3000/pool.html` (Fund Pool page).
    - Navigate to `http://localhost:3000/wallet.html` (Direct Transfer page).
    - *Tip:* Append `?testmode=true` to test the wallet interfaces offline.

---

## 🧪 Testing Summary

We run automated tests across both backend and frontend layers:

*   **Rust Contract Workspace Tests:** 9 test cases asserting administrative controls, contributions, and negative scenarios (unverified/paused caregivers, unauthorized initialization):
    ```bash
    cargo test --workspace --manifest-path contracts/Cargo.toml
    ```
*   **Frontend Helper Tests:** 6 Node test blocks validating math conversions and error parsers:
    ```bash
    node --test "tests/**/*.test.js"
    ```

---

## 🤖 CI/CD Build Summary

Our GitHub Actions workspace performs the following actions on every push or pull request to the `main` branch:
1.  Verify code formatting (`cargo fmt`).
2.  Run strict quality checks and lints (`cargo clippy -- -D warnings`).
3.  Execute all workspace contract tests (`cargo test`).
4.  Run all frontend Javascript tests (`node --test`).

---

## 📁 Project Repository Structure

```
CareCredits/
├── .github/workflows/          # CI/CD pipelines (ci.yml, deploy.yml)
├── contracts/                  # Rust Smart Contracts Workspace
│   ├── registry/               # CareRegistry crate
│   └── fund_pool/              # CareFundPool crate
├── docs/                       # Comprehensive documentation index
│   ├── ARCHITECTURE.md         # Architecture data flows & sequence diagrams
│   ├── DEPLOYMENT.md           # Local compiling and Vercel hosting guides
│   ├── README_ORANGE_BELT.md   # Orange Belt requirements evidence
│   ├── README_WHITE_BELT.md    # White Belt requirements evidence
│   ├── README_YELLOW_BELT.md   # Yellow Belt requirements evidence
│   └── SECURITY.md             # Gas, memory, and authorization specifications
├── index.html                  # Caregiver Directory (main page)
├── pool.html                   # Family Fund Pool page
├── wallet.html                 # Direct Transfer page
├── pool.js                     # Pool page logic & wallet kit
├── app.js                      # Direct transfer wallet logic
├── style.css                   # Custom global styles
├── utils.js                    # Math, format, and error helpers
├── caregivers.js               # In-memory caregiver profiles
├── screenshots/                # Verified E2E proof screenshots
├── tests/                      # Frontend unit tests
├── CONTRIBUTING.md             # Development workflow & git conventions
├── LICENSE                     # MIT Open Source License
└── README.md                   # Repository homepage & index
```

---

## ⛓️ Deployed Contract Addresses (Stellar Testnet)

*   **CareRegistry ID (Compliance/Admin Layer):** [`CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224`](https://stellar.expert/explorer/testnet/contract/CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224)
*   **CareFundPool ID (Funding Layer):** [`CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN`](https://stellar.expert/explorer/testnet/contract/CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN)

---

## 🔒 Verification & Compliance Proofs

We deployed the active instances and ran dynamic operations to demonstrate the on-chain compliance gate in action:

1.  **Registry Initialization (`admin.require_auth()` enforced):** [`8b30409d6a83700d7f036e7cd02ec77cfe4137cf5b35607b9c9ae73c8974ea0e`](https://stellar.expert/explorer/testnet/tx/8b30409d6a83700d7f036e7cd02ec77cfe4137cf5b35607b9c9ae73c8974ea0e)
2.  **Pool Initialization (`admin.require_auth()` enforced):** [`9b5ae056136987d1810cb41931c4957f709b964bd12ff6278cdadcd0bfeed2d1`](https://stellar.expert/explorer/testnet/tx/9b5ae056136987d1810cb41931c4957f709b964bd12ff6278cdadcd0bfeed2d1)
3.  **Registry Verification Call (Pre-verifying caregiver):** [`b6443f939d206b99b01c7152917cfbda4fe53cb9c56c16a3cec7567ef30eaf18`](https://stellar.expert/explorer/testnet/tx/b6443f939d206b99b01c7152917cfbda4fe53cb9c56c16a3cec7567ef30eaf18)

---

## 📊 Analytics & Interaction Tracking Backend (Level 4 - Milestone 2)

CareCredits includes a production-ready Express + PostgreSQL analytics service located in `/backend` to record wallet interactions, payments, pool contributions, withdrawals, and RPC errors non-blockingly.

### 📁 Backend Architecture & Folder Structure
```
backend/
├── config/
│   ├── db.js                   # PostgreSQL connection pool & health ping
│   └── env.js                  # Centralized environment variable validation
├── db/
│   └── migrations/
│       ├── 001_create_wallet_interactions.sql  # Database table & indexes
│       └── migrate.js          # Automated migration runner
├── middleware/
│   ├── errorHandler.js         # Centralized error handler
│   ├── rateLimiter.js          # IP rate limiting via express-rate-limit
│   └── validator.js           # Stellar Ed25519 address & payload validation
├── controllers/
│   ├── analyticsController.js  # Analytics HTTP request handlers
│   └── healthController.js     # Health check handler
├── routes/
│   ├── analyticsRoutes.js     # Express analytics router
│   └── healthRoutes.js        # Health check router
├── services/
│   └── analyticsService.js    # SQL query layer & fallback store
├── utils/
│   └── logger.js               # Structured Winston logger
├── server.js                   # Express application entrypoint
└── package.json                # Dependencies (express, pg, helmet, winston)
```

### 🗄️ PostgreSQL Database Schema (`wallet_interactions`)
- `id` (BIGSERIAL PRIMARY KEY)
- `wallet_address` (VARCHAR(56) NOT NULL — Indexed)
- `event_type` (VARCHAR(50) NOT NULL — Indexed)
- `transaction_hash` (VARCHAR(64) NULL)
- `status` (VARCHAR(20) NOT NULL DEFAULT 'success')
- `amount` (NUMERIC(30, 7) NULL)
- `metadata` (JSONB NULL)
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP — Indexed)

### 🔌 REST API Endpoints
- `POST /api/analytics/connect` — Logs wallet connection events
- `POST /api/analytics/contribute` — Logs contribution started/success/failure events
- `POST /api/analytics/withdraw` — Logs withdrawal started/success/failure events
- `POST /api/analytics/error` — Logs RPC & transaction simulation errors
- `GET /api/health` — Returns system uptime, version, and database connection status

### 🚀 Running the Analytics Backend
```bash
# Install dependencies
npm --prefix backend install

# Run database migrations
npm --prefix backend run migrate

# Start backend server (Port 5000)
npm --prefix backend start

# Run API test suite
npm --prefix backend test
```

---

## 🚀 Interactive User Onboarding System (Level 4 - Milestone 3)

CareCredits provides a 3-step interactive onboarding modal (`onboarding.js`) for first-time visitors to educate them on decentralized healthcare funding and guide them through wallet connection.

### 🧭 3-Step Guided Experience
1. **Step 1 — Welcome to CareCredits:** Explains healthcare micro-funding, instant 3-second Stellar transactions, and transparent on-chain auditing.
2. **Step 2 — Secure Wallet Setup:** Explains why a Stellar wallet is required, detects Freighter extension presence, and provides an in-modal connection trigger for Stellar Testnet.
3. **Step 3 — Explore CareCredits:** Highlights platform features (Browse Verified Caregivers, Family Fund Pools) and provides a primary **"Enter CareCredits"** CTA.

### ⚙️ State Management & FSM
- Managed via `window.CareOnboarding` using a Finite State Machine (`IDLE`, `STEP_1`, `STEP_2`, `STEP_3`, `COMPLETED`, `SKIPPED`).
- State is persisted in `localStorage` under the key `carecredits_onboarded = 'true'`.
- Returning users automatically skip onboarding.
- **Testing Reset:** Execute `CareOnboarding.reset()` in the browser developer console to clear local storage and reset state for re-testing.

### ♿ Accessibility & Responsiveness
- **Focus Control:** Traps keyboard focus (`Tab` / `Shift+Tab`) inside the active modal dialog when open.
- **Keyboard Shortcut:** `Escape` key closes/skips the onboarding tour cleanly.
- **Responsive Layout:** Responsive styles for `375px` (Mobile), `768px` (Tablet), `1024px`, and Desktop viewports.

### 📊 Onboarding Analytics Events
Logged non-blockingly to the Milestone 2 backend:
- `onboarding_started` — Fired when onboarding modal opens.
- `step_1_completed` — Fired when user completes Step 1.
- `step_2_completed` — Fired when user completes Step 2.
- `wallet_connected_during_onboarding` — Fired when user connects Freighter inside Step 2.
- `step_3_completed` — Fired when user completes Step 3.
- `onboarding_completed` — Fired when user finishes onboarding tour via "Enter CareCredits".
- `onboarding_skipped` — Fired when user closes or skips the tour.

---

## 💬 User Experience Center & Feedback Collection System (Level 4 - Milestone 4)

CareCredits includes a production-quality User Experience Center (`feedback.js`, Express `/api/feedback`, PostgreSQL `feedback_submissions`) that captures rich user sentiment, 5-star ratings, category tags, optional feedback text, and automated environment metadata across key application milestones.

### 🧭 4-Step Guided Feedback Flow
1. **Step 1 (Star Rating):** 1-5 interactive star selector (⭐⭐⭐⭐⭐) with hover effects and accessible keyboard navigation.
2. **Step 2 (Category Selection):** Categorize insights into `UI/UX`, `Wallet`, `Donation`, `Caregiver`, `Performance`, `Bug Report`, `Suggestion`, or `Other`.
3. **Step 3 (Detailed Thoughts):** Multiline textarea for optional comments ("Tell us more...") + auto-captured environment metadata (browser userAgent, page URL, platform OS, app version, connected wallet address).
4. **Step 4 (Thank You):** Animated thank-you screen ("Thank you for helping improve CareCredits ❤️") with 2.5s auto-close.

### ⚡ Automated & Manual Triggers
- **Post-Donation Popup:** Automatically triggers after successful caregiver or pool payment.
- **Post-Withdrawal Popup:** Automatically triggers after caregiver pool withdrawal.
- **Post-Onboarding Popup:** Automatically triggers after completing the onboarding tour.
- **Permanent Navbar Button:** "💬 Feedback" button available on all pages.

### 🗄️ Database Schema & API
- **SQL Table:** `feedback_submissions` (`002_create_feedback_submissions.sql`).
- **REST Endpoints:**
  - `POST /api/feedback` — Submit feedback entry (rate limited, sanitized, fallback store supported).
  - `GET /api/feedback/recent` — Retrieve recent feedback submissions.
- **Analytics Events:** `feedback_opened`, `feedback_skipped`, `feedback_submitted`, `feedback_category`, `feedback_rating`, `feedback_error`.

---

## ⚙️ Admin Console & Multi-Pool Registry System (Level 4 - Milestone 5)

CareCredits includes a secure, responsive Administrator Console (`admin.html`, `admin.js`, Express `/api/admin/*`) providing operational visibility into platform analytics, user feedback, caregiver statuses, and multi-pool management.

### 🔒 Admin Security & Token Authentication
- **Authentication:** Environment-configurable credentials (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SECRET`).
- **Session Protection:** Token-based bearer authentication with automatic 15-minute inactivity session expiration.
- **Protected Routes:** All `/api/admin/*` endpoints require `Authorization: Bearer <token>` authorization headers.

### 🏊 Multi-Pool Support & Registry (`pools.js`)
- **Dynamic Multi-Pool Registry:** Manages active pool contract IDs on Stellar Testnet (Primary Family Fund Pool, Hospice Relief Fund, Pediatric Emergency Relief Pool).
- **Frontend Pool Switcher:** Interactive dropdown in `pool.html` (`#poolSelectorDropdown`) allows switching active pools, updating raised balances, caregiver metadata, and goal progress bars.
- **Backward Compatibility:** Preserves existing primary contract (`CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN`) as default.

### 🗄️ Admin REST Endpoints & Database Schema
- **SQL Tables:** `admin_audit_logs` and `registered_pools` (`003_create_admin_tables.sql`).
- **REST API Endpoints:**
  - `POST /api/admin/login` — Authenticate admin credentials and generate bearer token.
  - `POST /api/admin/logout` — Revoke active admin session token.
  - `GET /api/admin/dashboard` — Operational summary metrics (total XLM volume, tx count, connected wallets, avg feedback rating).
  - `GET /api/admin/analytics` — Time-series analytics payload for daily donation trends and wallet connections.
  - `GET /api/admin/feedback` — Filterable feedback submission table with search query and star rating filters.
  - `GET /api/admin/caregivers` — List of registered and verified caregivers.
  - `GET /api/admin/pools` — List of active funding pool instances.

---

## 🛡️ Production Hardening, Security & Observability (Level 4 - Milestone 6)

CareCredits has been fully hardened for production deployment with site reliability engineering (SRE) controls, security headers, database query timing, expanded health diagnostics, and infrastructure monitoring.

### 🔒 Security Protections ([`SECURITY.md`](SECURITY.md))
- **Strict Helmet CSP & HSTS:** Enforces Content Security Policy, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), and HTTP Strict Transport Security (HSTS).
- **Environment Validation (`backend/config/env.js`):** Fail-fast startup checks in production mode for required environment variables (`DATABASE_URL`, `ADMIN_SECRET`).
- **SQL Injection & XSS Shield:** All database access is strictly parameterized via PostgreSQL `$1`, `$2` placeholders.

### 🖥️ Observability & Infrastructure Widgets ([`ADMIN_GUIDE.md`](ADMIN_GUIDE.md))
- **Expanded `/api/health` Diagnostics:** Exposes database latency (ms), process uptime (s), memory heap/RSS (MB), Node version, CPU architecture, and health score (100 / 100).
- **Database Query Timing (`backend/config/db.js`):** Tracks query execution time and logs slow queries (>100ms) and connection errors safely without leaking sensitive parameters.
- **Graceful Shutdown & Signal Trapping:** Traps `SIGTERM`/`SIGINT` signals to drain HTTP connections and close database connection pools cleanly before exiting.
- **Admin System Health Tab:** `admin.html` includes a live System Monitoring tab that auto-refreshes health telemetry every 10 seconds.

### 🚀 Production Deployment Documentation ([`DEPLOYMENT.md`](DEPLOYMENT.md) & [`ENVIRONMENT.md`](ENVIRONMENT.md))
- Step-by-step guides for deploying frontend to Vercel and Express / PostgreSQL backend to Railway or Render.

---

## 🖼️ Verified E2E Screenshot Previews

All screenshots are stored inside the [`screenshots/`](screenshots) directory:

| State / View | Screenshot |
|---|---|
| **Freighter Connected & Balance Loaded** | ![Wallet Connected](screenshots/wallet-connected.png) |
| **Family Fund Pool details loaded** | ![Pool Loaded](screenshots/pool-loaded.png) |
| **Mobile responsive UI layout** | ![Mobile Responsive](screenshots/mobile-responsive.png) |

---

## 📄 License & Credits

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
Built with 💙 for the Stellar Journey to Mastery.
