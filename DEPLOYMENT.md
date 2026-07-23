# 🚀 CareCredits Production Deployment Guide

This guide outlines step-by-step instructions for deploying the **CareCredits** frontend to **Vercel** and the **Express / PostgreSQL** backend to **Railway** or **Render**.

---

## 📋 Prerequisites
- Node.js v18+ & npm
- PostgreSQL database instance (Neon / Supabase / Railway Postgres)
- Vercel CLI or Vercel GitHub Integration
- Git repository access

---

## 🗄️ 1. Database Setup (PostgreSQL)

1. **Provision Database:** Create a managed PostgreSQL database on Neon, Supabase, or Railway.
2. **Run Migrations:**
   ```bash
   cd backend
   npm install
   DATABASE_URL="postgres://user:password@host:5432/dbname" npm run migrate
   ```
3. **Verify Schema:** Ensure `wallet_interactions`, `feedback_submissions`, `admin_audit_logs`, and `registered_pools` tables exist.

---

## ⚙️ 2. Backend Deployment (Railway / Render)

### Deploying on Railway
1. Connect your GitHub repository to Railway.
2. Select the `backend` directory as the root folder.
3. Configure Environment Variables in Railway Dashboard:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `DATABASE_URL` = `postgres://...`
   - `CORS_ORIGIN` = `https://carecredits.vercel.app`
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = `<secure_password>`
   - `ADMIN_SECRET` = `<secure_64_char_jwt_secret>`
4. Build & Start Command:
   - Build: `npm install`
   - Start: `npm start`
5. Note your deployed backend URL (e.g., `https://carecredits-backend.up.railway.app`).

---

## 🌐 3. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Set Root Directory to `./` (repository root).
3. Configure `vercel.json` rewrite proxy to point to your Railway backend URL:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://carecredits-backend.up.railway.app/api/:path*" }
     ]
   }
   ```
4. Deploy project.

---

## 🔍 4. Production Verification Checklist

- [ ] `GET https://carecredits.vercel.app/api/health` returns HTTP 200 with `status: "healthy"` and `database.connected: true`.
- [ ] Connect Freighter Wallet on `/wallet.html` -> Verify connection succeeds and balance displays.
- [ ] Deposit XLM on `/pool.html` -> Verify transaction confirms on Stellar Testnet.
- [ ] Open `/admin.html` -> Login as Admin -> Verify System Health Monitoring widgets display live telemetry.

---

## 🔄 5. Rollback Procedure

If a critical fault occurs post-deployment:
1. **Frontend:** In Vercel Dashboard, select **Deployments** -> Find last stable build -> Click **Promote to Production**.
2. **Backend:** In Railway / Render, select **Deployments** -> Rollback to previous release hash.
