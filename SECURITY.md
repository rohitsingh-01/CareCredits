# 🔒 CareCredits Security Architecture & Protections

**CareCredits Level 4 (Green Belt) — Security Report**  
**Classification:** Confidential / Production Security Documentation  
**Last Updated:** July 2026

---

## 📑 Executive Summary

CareCredits is a decentralized healthcare micro-funding platform deployed on the **Stellar Testnet** backed by **Soroban Smart Contracts** (`CareRegistry` & `CareFundPool`) and an **Express / PostgreSQL** production analytics & feedback backend. 

This document outlines all implemented defense-in-depth security mechanisms across smart contracts, REST API backend, data persistence layer, and client-side applications.

---

## 🛡️ 1. Smart Contract Security (Soroban Rust)

### 🔑 Authentication & Authorization Controls
- **Initialize Authorization Vulnerability Fix (Milestone 1):** `CareRegistry` and `CareFundPool` smart contracts require `admin.require_auth()` during `initialize()`. Unauthenticated attempts to hijack admin authority fail on-chain.
- **Role-Based Privilege Separation:**
  - `admin`: Reserved for contract owner; authorizes caregiver registration, verification, pause, and unpause operations.
  - `caregiver`: Authorized recipient for funding pool withdrawals (`caregiver.require_auth()`).
  - `contributor`: Anyone can deposit XLM; contributors can withdraw only their own unallocated balances before goal fulfillment.

### 🛡️ Reentrancy & Math Safety
- **Overflow / Underflow Protection:** All arithmetic operations use Rust checked arithmetic (`checked_add`, `checked_sub`).
- **State Mutual Exclusion:** Contract state transitions (`total_raised`, `is_closed`) occur before on-chain asset transfers.

---

## 🌐 2. Web & HTTP Security Protections

### 👒 Helmet HTTP Headers
The Express backend enforces rigid HTTP security headers via `helmet`:
- **Content Security Policy (CSP):** Restricts script, style, font, and connect origins:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `connect-src 'self' https://horizon-testnet.stellar.org https://stellar.expert`
  - `frame-ancestors 'none'` (Prevents clickjacking).
- **HTTP Strict Transport Security (HSTS):** Enforces HTTPS connections for 1 year (`maxAge: 31536000`, `includeSubDomains: true`, `preload: true`).
- **X-Content-Type-Options:** `nosniff` prevents MIME type sniffing.
- **X-Frame-Options:** `DENY` blocks embedding inside external iframes.
- **Referrer-Policy:** `strict-origin-when-cross-origin`.

### ⚡ CORS Policy
- Production CORS origin restricted to configured domain (`CORS_ORIGIN`).
- Allowed HTTP methods strictly scoped to `GET`, `POST`, `OPTIONS`.

### ⏱️ Rate Limiting & Denial of Service (DoS) Protection
- **Global API Rate Limit:** 100 requests per 15-minute window per IP.
- **Auth Endpoint Rate Limit:** 5 failed login attempts per 15-minute window on `/api/admin/login`.
- **Payload Size Limit:** Express JSON body parser capped at `100kb`.

---

## 🔑 3. Authentication & Secrets Management

### 🛡️ Admin Authentication
- **Token-Based Bearer Auth:** `/api/admin/*` endpoints require `Authorization: Bearer <token>` authorization headers.
- **Environment Verification:** Production startup validates that `ADMIN_SECRET` is set to a secure, non-default secret key (`backend/config/env.js`). Fail-fast termination occurs if missing.
- **Auto Session Timeout:** Frontend automatically terminates admin sessions after 15 minutes of inactivity.

### 🔐 Zero Secrets Committed
- No private keys, database passwords, or JWT secrets exist in git version control.
- Credentials template provided in `backend/.env.example`.

---

## 🗄️ 4. Data Layer & Input Sanitization

### 💉 SQL Injection Prevention
- All PostgreSQL database interactions use **parameterized queries** (`pg` parameterized placeholders `$1`, `$2`).
- String concatenation inside raw SQL statements is strictly prohibited.

### 🧼 Input Validation & XSS Filtering
- Strict schema validation middleware (`middleware/validator.js`) checks address formats, star ratings (1-5), and category tags.
- All user inputs are sanitized before rendering or storing in DB.

---

## 🛟 5. Resiliency & Disaster Recovery

- **Non-Blocking Fallback Mode:** If PostgreSQL is offline, analytics and feedback services seamlessly fallback to in-memory queues without crashing user contributions or transactions.
- **Graceful Shutdown:** Application traps `SIGINT`/`SIGTERM` signals, drains HTTP connections, and closes PostgreSQL connection pools cleanly.
