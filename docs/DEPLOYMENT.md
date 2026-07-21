# Deployment Guide

This guide details the compile, deploy, and configuration workflows for the CareCredits multi-contract backend and static web application frontend.

---

## 🛠️ 1. Prerequisites

Ensure you have the following CLI tools installed:
*   [Stellar CLI](https://github.com/stellar/stellar-cli) (v21.5.0 or later)
*   Rust compiler (`cargo` with target `wasm32-unknown-unknown`)
*   Vercel CLI (optional, for frontend production hosting)

---

## ⛓️ 2. Smart Contract Deployment & Setup

The platform uses two smart contracts: `CareRegistry` and `CareFundPool`. The pool requires the registry's ID during initialization, meaning they must be deployed in sequence.

We provide automated deployment scripts inside the `scripts/` directory:

### Bash Script Orchestration (Linux/macOS)
To deploy the contracts and automatically verify a target caregiver on Testnet:
```bash
./scripts/deploy-all.sh <CAREGIVER_PUBLIC_KEY> <GOAL_IN_STROOPS>
```

**What the script does behind the scenes:**
1.  **Compiles** both crates to WebAssembly using `cargo build --target wasm32-unknown-unknown --release`.
2.  **Generates and funds** a temporary Stellar deployer key (`carecredits-deployer`) using the Testnet Friendbot.
3.  **Deploys and initializes** `CareRegistry` with the deployer as the admin.
4.  **Deploys and initializes** `CareFundPool` with the target caregiver, goals, native XLM SAC ID, and the newly created `CareRegistry` ID.
5.  **Invokes** `set_verified` on `CareRegistry` to pre-approve the target caregiver for testing ease.

### PowerShell Script Orchestration (Windows)
For Windows users, we provide equivalent PowerShell scripts:
```powershell
.\scripts\deploy-all.ps1 -caregiverKey "<CAREGIVER_PUBLIC_KEY>" -goalStroops <GOAL_IN_STROOPS>
```

---

## 🌐 3. Frontend Deployment

The frontend consists of static HTML5 and Vanilla JS files located directly in the root directory. It can be hosted on any static file provider.

### Vercel Hosting Configuration
We use `vercel.json` to handle redirects and custom headers.

#### [vercel.json](file:///c:/Users/rohit/Documents/New%20project/CareCredits/vercel.json)
```json
{
  "cleanUrls": true
}
```
*   `cleanUrls`: Removes the `.html` extension from URLs.

### Manual Vercel Deployment Steps
1.  Install the Vercel CLI:
    ```bash
    npm install -g vercel
    ```
2.  Link and deploy the project from the root folder:
    ```bash
    vercel
    ```
3.  Promote the deployment to production:
    ```bash
    vercel --prod
    ```

---

## 🤖 4. Automated CI/CD Workflows

We use GitHub Actions to automate code validation and deployments on pushes and pull requests to `main`.

### Continuous Integration (`ci.yml`)
Runs formatting audits, lints, and test runners:
-   **Rust Lints:** Performs formatting checks and strict Clippy quality checks (`cargo clippy -- -D warnings`).
-   **Contract Tests:** Executes all Rust workspace contract tests (`cargo test --workspace`).
-   **WASM Build:** Verifies compiled Wasm integrity.
-   **Node Tests:** Runs native JS unit tests (`node --test "tests/**/*.test.js"`).

### Continuous Deployment (`deploy.yml`)
Deploys the smart contracts and publishes updated addresses to the codebase when the repository is tagged:
-   Triggered on push/merge to `main`.
-   Loads the deployer secret key securely from GitHub Actions Secrets (`STELLAR_DEPLOYER_SECRET_KEY`).
-   Compiles, deploys, and updates contract references in the codebase automatically.
