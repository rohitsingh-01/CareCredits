# 🏛️ CareCredits System Architecture

**CareCredits Level 4 (Green Belt) — Technical Architecture Specification**  
**Version:** 1.0.0 (Production Hardened)

---

## 📑 System Overview

CareCredits is a decentralized, healthcare micro-funding platform deployed on the **Stellar Testnet** using **Soroban Smart Contracts** (`CareRegistry` & `CareFundPool`) paired with a high-performance **Express / PostgreSQL** analytics and feedback infrastructure.

```mermaid
graph TD
  User[👩‍⚕️ User / Contributor / Caregiver] -->|Freighter Wallet Web3 | WebApp[🌐 CareCredits Frontend HTML5/ES2022]
  
  subgraph "Stellar Testnet On-Chain Layer"
    WebApp -->|Soroban RPC / SDK| PoolContract["🏊 CareFundPool Smart Contract (Rust)"]
    WebApp -->|Soroban RPC / SDK| RegistryContract["📋 CareRegistry Smart Contract (Rust)"]
    PoolContract -->|SAC Transfer| XLM["⚡ Stellar Native Asset (XLM)"]
  end

  subgraph "Backend Infrastructure Layer"
    WebApp -->|Non-Blocking JSON Telemetry| BackendAPI["🚀 Express REST API (Port 5000)"]
    BackendAPI -->|Parameterized SQL| PostgresDB[("🗄️ PostgreSQL 15 Database")]
    BackendAPI -->|Resilient Fallback| MemoryStore["💾 In-Memory Fallback Queue"]
  end

  subgraph "Administration & Telemetry Console"
    AdminUser[⚙️ System Administrator] -->|Bearer Token Session| AdminDashboard["📊 Admin Console (admin.html)"]
    AdminDashboard -->|HTTP Bearer GET| BackendAPI
  end
```

---

## 🏊 On-Chain Soroban Smart Contracts (Rust)

CareCredits utilizes two compiled WebAssembly (`wasm32-unknown-unknown`) smart contracts built with `soroban-sdk v22.0.1`:

### 1. `CareRegistry` Contract (`contracts/registry`)
- **Address:** `CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224`
- **Purpose:** On-chain registry of authorized, background-verified healthcare caregivers.
- **Admin Security:** Requires `admin.require_auth()` on `initialize()` and `register_caregiver()` to prevent unauthorized authority hijacking.
- **Functions:**
  - `initialize(admin: Address)`
  - `register_caregiver(admin: Address, caregiver: Address, metadata_uri: String)`
  - `verify_caregiver(admin: Address, caregiver: Address)`
  - `pause_caregiver(admin: Address, caregiver: Address)`
  - `is_verified(caregiver: Address) -> bool`

### 2. `CareFundPool` Contract (`contracts/fund_pool`)
- **Address (Primary):** `CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN`
- **Purpose:** Escrow and distribution pool for caregiver health-support goals.
- **Functions:**
  - `initialize(admin: Address, registry: Address, caregiver: Address, goal_amount: i128)`
  - `deposit(contributor: Address, amount: i128)`
  - `withdraw(caregiver: Address, amount: i128)`
  - `get_pool_status() -> PoolStatus`

---

## 🏊 Multi-Pool Architecture (`pools.js`)

CareCredits supports multi-pool funding instances on Stellar Testnet through a dynamic client-side registry (`pools.js`):

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as pool.html UI
  participant Manager as CarePools Manager (pools.js)
  participant Storage as localStorage
  participant Contract as Soroban Smart Contract

  User->>UI: Select Pool from Dropdown
  UI->>Manager: CarePools.setActivePool(poolId)
  Manager->>Storage: Store active poolId
  Manager->>UI: Return active pool metadata
  UI->>Contract: Load pool state (total_raised, goal)
  Contract-->>UI: Return raised & goal balance
  UI->>User: Update progress bar & caregiver card
```

---

## 🚀 Backend Infrastructure & Telemetry Layer

The backend service is powered by Express, Helmet security headers, Winston structured logs, PostgreSQL, and resilient fallback queues.

```mermaid
flowchart LR
  Request[Incoming HTTP Request] --> Helmet[Helmet Security Headers & CSP]
  Helmet --> RateLimiter[Express Rate Limiter]
  RateLimiter --> Validator[Input Validation Middleware]
  Validator --> Controller[API Route Controller]
  
  Controller -->|Primary Path| PGDB[(PostgreSQL Database)]
  Controller -.->|Fallback Path on DB Error| Fallback[In-Memory Fallback Queue]
  
  PGDB --> Response[JSON Response HTTP 200/201]
  Fallback --> Response
```

---

## 🔄 Finite State Machines (FSM)

### 1. Interactive Onboarding FSM (`onboarding.js`)
```mermaid
stateDiagram-v2
  [*] --> IDLE
  IDLE --> STEP_1: open()
  STEP_1 --> STEP_2: nextStep()
  STEP_2 --> STEP_3: nextStep()
  STEP_3 --> COMPLETED: nextStep()
  STEP_1 --> SKIPPED: skip()
  STEP_2 --> SKIPPED: skip()
  STEP_3 --> SKIPPED: skip()
  COMPLETED --> [*]
  SKIPPED --> [*]
```

### 2. User Experience Center Feedback FSM (`feedback.js`)
```mermaid
stateDiagram-v2
  [*] --> IDLE
  IDLE --> STEP_RATING: open()
  STEP_RATING --> STEP_CATEGORY: selectStar(1-5)
  STEP_CATEGORY --> STEP_COMMENT: selectCategory()
  STEP_COMMENT --> THANK_YOU: submit()
  THANK_YOU --> IDLE: auto-close (2.5s)
```
