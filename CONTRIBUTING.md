# Contributing to CareCredits

CareCredits is a single root Vite application with frontend source in `src/`, Stellar contracts in `contracts/`, and the analytics/admin API in `backend/`.

## Local Development

```bash
git clone https://github.com/rohitsingh-01/CareCredits.git
cd CareCredits
npm install
npm run dev
```

Frontend routes:

- `/` - caregiver directory
- `/wallet` - Freighter wallet, XLM balance, and direct Testnet payment flow
- `/pool` - Soroban funding pool
- `/admin` - administrator console

Backend setup:

```bash
cd backend
npm install
npm start
```

## Testing

Run these before opening a pull request:

```bash
npm run build
npm run test:frontend
npm run test:backend
npm test
```

Contract tests:

```bash
cargo test --workspace --manifest-path contracts/Cargo.toml
```

## Frontend Source Of Truth

All frontend application code lives under `src/`. The only root HTML file is Vite's minimal `index.html` mount shell.

There are no belt-specific folders and no synced duplicate frontend files. Do not add `/Level 1/`, `/Level 3/`, `wallet.html`, `pool.html`, or `admin.html`; route-level UI belongs in `src/pages/`.

## Pull Requests

1. Create a feature branch.
2. Keep changes focused.
3. Include tests or update existing tests when behavior changes.
4. Confirm the Vite build and relevant test suites pass.
