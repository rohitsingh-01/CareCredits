# Contributing to CareCredits

Thank you for interest in contributing to CareCredits! We welcome community contributions to help improve this on-chain caregiving compliance and funding gateway.

This guide outlines our development workflow, coding standards, and procedures for submitting contributions.

---

## 🛠️ Local Environment Setup

To contribute to both the smart contracts and the web application frontend, you need to set up the following tools:

### Prerequisites
1. **Rust Toolchain:**
   - Install Rust via [rustup](https://rustup.rs/).
   - Add the WebAssembly compilation target:
     ```bash
     rustup target add wasm32-unknown-unknown
     ```
2. **Stellar CLI:**
   - Install the official Stellar CLI tool (used for contract compilation, deployments, and testing):
     ```bash
     cargo install --locked stellar-cli
     ```
3. **Node.js:**
   - Install Node.js (version 20 or higher is recommended) to run the local dev server and frontend tests:
     ```bash
     node --version
     ```
4. **Freighter Wallet:**
   - Install the [Freighter browser extension](https://www.freighter.app/) and configure it to use the **Stellar Testnet** for manual browser verification.

---

## 💻 Development Workflow

1. **Fork & Clone:**
   - Fork the repository on GitHub and clone your fork locally:
     ```bash
     git clone https://github.com/YOUR_USERNAME/CareCredits.git
     cd CareCredits
     ```
2. **Create a Feature Branch:**
   - Always create a descriptive branch off of `main` for your work:
     ```bash
     git checkout -b feat/your-feature-name
     ```
3. **Develop & Format:**
   - Follow formatting and linting rules. Ensure Rust code is properly formatted before committing:
     ```bash
     cargo fmt --all --manifest-path contracts/Cargo.toml
     ```
4. **Run Local Audits:**
   - Run Clippy lints to check for anti-patterns and performance optimizations:
     ```bash
     cargo clippy --all-targets --manifest-path contracts/Cargo.toml -- -D warnings
     ```

---

## 🧪 Testing Guidelines

We enforce strict test coverage for both smart contracts and frontend helper utilities on every pull request.

### Smart Contract Tests
Run the cargo test suite to execute the 9+ Rust unit and integration tests (including adversarial cases):
```bash
cargo test --workspace --manifest-path contracts/Cargo.toml
```

### Frontend Unit Tests
Run the Node.js native test runner to verify math, conversion, and error classification utilities:
```bash
node --test "tests/**/*.test.js"
```

---

## 📝 Commit Conventions

We follow a structured commit convention to maintain a readable and easily parsable git history. Every commit message should use the following format:

`<type>(<scope>): <short description>`

### Commit Types
*   `feat`: A new feature (e.g. `feat(pool): add partial withdrawal support`)
*   `fix`: A bug fix (e.g. `fix(sdk): resolve Protocol 21 union switch XDR crash`)
*   `docs`: Documentation updates (e.g. `docs(contrib): update local setup steps`)
*   `style`: Code style modifications (formatting, semi-colons, white-spaces)
*   `refactor`: Code reorganization that neither fixes a bug nor adds a feature
*   `test`: Adding or correcting tests (e.g. `test(registry): assert initialization auth`)
*   `ci`: Modifications to Github Action workflows or deploy configurations

### Commit Scope Example
`fix(registry): require admin authorization on initialize`

---

## 🔀 Pull Request Process

1. **Sync with Main:** Keep your branch up to date with the upstream `main` branch to avoid merge conflicts:
   ```bash
   git pull origin main
   ```
2. **Verify CI:** Ensure the local test suites and formatting checks pass.
3. **Create the PR:** Submit the Pull Request on GitHub with:
   - A descriptive title.
   - A summary of the changes made and the problem solved.
   - Links to any associated issues.
   - Verification proofs (test results or terminal logs).
4. **Review:** Wait for a maintainer or Journey to Mastery reviewer to approve the changes.
