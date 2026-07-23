# ⚙️ CareCredits Environment Variables Reference

This document describes all environment variables used by the CareCredits backend service.

---

## 📋 Variables Reference

| Variable Name | Required | Default (Dev) | Production Description |
|---|---|---|---|
| `PORT` | No | `5000` | HTTP port on which Express server listens. |
| `NODE_ENV` | Yes | `development` | Environment mode (`development`, `staging`, `production`). |
| `DATABASE_URL` | Yes (Prod) | `postgres://localhost/carecredits_db` | PostgreSQL connection string format `postgres://user:pass@host:5432/dbname`. |
| `CORS_ORIGIN` | Yes (Prod) | `*` | Allowed CORS origin domain for frontend web client (e.g. `https://carecredits.vercel.app`). |
| `ADMIN_USERNAME` | No | `admin` | Username required for Admin Console login. |
| `ADMIN_PASSWORD` | Yes (Prod) | `carecredits2026` | Password required for Admin Console login. Must be updated in production. |
| `ADMIN_SECRET` | Yes (Prod) | `carecredits-secret-admin-jwt-token-2026` | Secret key used for signing administrative session bearer tokens. Must be changed in production. |

---

## 🔐 Fail-Fast Production Validation

In `production` mode (`NODE_ENV=production`), `backend/config/env.js` validates all environment variables at process startup. If `DATABASE_URL` is missing or `ADMIN_SECRET` is set to the default fallback, the server outputs an error log and exits with code `1` (`process.exit(1)`).
