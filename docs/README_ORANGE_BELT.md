# Orange Belt (Level 3) Submission - Production Stellar dApp

Status: Approved.

## Overview

Level 3 turns CareCredits into an end-to-end Stellar dApp with advanced smart contracts, inter-contract communication, event-aware frontend behavior, CI/CD, testing, deployment scripts, responsive UI, and complete documentation.

The frontend is now a root Vite app under `src/`; the contracts remain in `contracts/`.

## Requirement Checklist

| Orange Belt Requirement | Implementation |
|---|---|
| Advanced smart contract development | `contracts/registry` and `contracts/fund_pool` implement the CareRegistry and CareFundPool contracts. |
| Inter-contract communication | CareFundPool calls CareRegistry before allowing caregiver withdrawals. |
| Event streaming and real-time updates | `/pool` in `src/pages/pool.js` polls Soroban RPC events and updates the activity feed. |
| CI/CD pipeline setup | `.github/workflows/ci.yml` runs contract checks, Vite build, and frontend tests. |
| Smart contract deployment workflow | Deployment scripts are in `scripts/`; deployment instructions are in `DEPLOYMENT.md`. |
| Mobile responsive frontend | Vite routes use shared responsive CSS in `src/styles/style.css`. |
| Error handling and loading states | Wallet, pool, onboarding, feedback, and admin flows expose user-visible pending/success/failure states. |
| Tests for contracts and frontend | Rust contract tests plus Node frontend/backend tests are available. |
| Production-ready architecture | Frontend, backend API, contracts, admin console, telemetry, and docs are separated by responsibility. |
| Documentation and demo | README files, screenshots, live link, and demo video are included. |

## Smart Contract Details

- CareRegistry Contract ID: [`CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7`](https://stellar.expert/explorer/testnet/contract/CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7)
- CareFundPool Contract ID: [`CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO`](https://stellar.expert/explorer/testnet/contract/CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO)
- Native XLM SAC Token ID: [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)

## Transaction Proofs

- Registry verification call: [`ceebf9f01c8b7ed7a7f7c48f53e757c3ec08df6ae5c3c92f93a56418d985d65c`](https://stellar.expert/explorer/testnet/tx/ceebf9f01c8b7ed7a7f7c48f53e757c3ec08df6ae5c3c92f93a56418d985d65c)
- Pool initialization: [`cdfbc06cc5a27d5e2e844b898248b71ec7144e628deb7d983b4e116fa9d3b168`](https://stellar.expert/explorer/testnet/tx/cdfbc06cc5a27d5e2e844b898248b71ec7144e628deb7d983b4e116fa9d3b168)

## Screenshots

| Required Evidence | Screenshot |
|---|---|
| Mobile responsive UI | ![Mobile Responsive](../screenshots/mobile-responsive.png) |
| CI/CD pipeline running | ![CI Green](../screenshots/ci-green.png) |
| Test output with passing tests | ![Test Results](../screenshots/test-results.png) |

## Demo

- Live app: [https://care-credits.vercel.app](https://care-credits.vercel.app)
- Demo video: [CareCredits Walkthrough](https://youtu.be/UgHnk698BJw?si=XiN6-4QFzVk9UR-i)

## Verification Commands

```bash
npm run build
npm test
cargo test --workspace --manifest-path contracts/Cargo.toml
```
