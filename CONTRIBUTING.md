# 🤝 Contributing to CareCredits

Thank you for your interest in contributing to **CareCredits**! We welcome contributions from developers, security researchers, and healthcare fintech advocates.

---

## 📜 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful and constructive in all communication.

---

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rohitsingh-01/gridpilot-ai.git
   cd CareCredits
   ```

2. **Install Root Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Start Backend Server:**
   ```bash
   npm start
   ```

5. **Run Frontend & Backend Test Suites:**
   ```bash
   # From root directory:
   npm test
   ```

---

## 🧪 Testing Guidelines

Before submitting a pull request, ensure all test suites pass cleanly:
- **Frontend Unit Tests:** `npm run test:frontend`
- **Backend Integration Tests:** `npm run test:backend`

---

## 🔄 Single Source of Truth & Belt Folder Synchronization

To support automated evaluators during the **Stellar Journey to Mastery** belt reviews without manual duplicate file maintenance:

- **Source of Truth:** All canonical frontend files (`index.html`, `wallet.html`, `pool.html`, `app.js`, `pool.js`, `pools.js`, `style.css`, `utils.js`, `directory.js`, `caregivers.js`) live directly at the **repository root (`/`)**.
- **Auto-Synced Folders:** The subfolders `/Level 1/` and `/Level 3/` contain auto-synced snapshots of these root files for evaluator path compatibility.

### Sync Workflow
Whenever you make changes to root frontend files, run the sync script before committing:

```bash
# Sync canonical root files into /Level 1/ and /Level 3/
npm run sync-belt-folders

# Verify sync status (Runs automatically in CI)
npm run check-belt-sync
```

> **Note:** Continuous Integration (`.github/workflows/ci.yml`) automatically executes `npm run check-belt-sync` on every commit and will fail the build if `/Level 1/` or `/Level 3/` files drift out of sync.

---

## 🚀 Submitting Pull Requests

1. Create a feature branch (`git checkout -b feature/my-feature`).
2. Commit your changes (`git commit -m 'feat: add my feature'`).
3. Push to your branch (`git push origin feature/my-feature`).
4. Open a Pull Request with a clear summary of your changes.
