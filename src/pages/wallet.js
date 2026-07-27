import { findCaregiverById } from "../data/caregivers.js";
import { initPageChrome, renderShell } from "../components/layout.js";
import {
  StellarSdk,
  buildNativePaymentTransaction,
  fetchNativeBalance,
  horizonServer,
  submitClassicTransaction,
} from "../lib/stellar.js";
import {
  connectFreighterWallet,
  disconnectFreighterWallet,
  signWithFreighter,
} from "../lib/freighterWallet.js";

let connectedAddress = null;

const $ = (id) => document.getElementById(id);

function setStatus(id, message, kind = "") {
  const element = $(id);
  if (!element) return;
  element.textContent = message;
  element.className = `status ${kind}`;
}

function setResultPanel(html, kind) {
  const element = $("resultPanel");
  if (!element) return;
  element.innerHTML = html;
  element.className = `result-panel ${kind}`;
}

function updateWalletUI(connected) {
  $("connectBtn").classList.toggle("hidden", connected);
  $("disconnectBtn").classList.toggle("hidden", !connected);
  $("refreshBalanceBtn").disabled = !connected;
  $("sendBtn").disabled = !connected;
}

function isLocalTestMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has("testmode") && ["localhost", "127.0.0.1", "[::1]", ""].includes(window.location.hostname);
}

function getMockServer() {
  return {
    loadAccount: async (address) => {
      const account = new StellarSdk.Account(address, "1");
      account.balances = [{ asset_type: "native", balance: "100.0000000" }];
      return account;
    },
    submitTransaction: async () => ({ hash: "mock_tx_hash_1234567890abcdef1234567890abcdef" }),
  };
}

function activeServer() {
  return isLocalTestMode() ? getMockServer() : horizonServer;
}

async function connectWallet() {
  try {
    if (isLocalTestMode()) {
      connectedAddress = "GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4";
      window.CareWalletState = { address: connectedAddress, network: "TESTNET" };
    } else {
      const result = await connectFreighterWallet();
      connectedAddress = result.address;
    }

    updateWalletUI(true);
    setStatus("walletStatus", `Connected: ${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-6)} (Testnet)`, "success");
    if (window.CareAnalytics) window.CareAnalytics.trackConnect(connectedAddress);
    await refreshBalance();
  } catch (error) {
    setStatus("walletStatus", `Connection failed: ${error.message || error}`, "error");
  }
}

function disconnectWallet() {
  if (connectedAddress && window.CareAnalytics) window.CareAnalytics.trackDisconnect(connectedAddress);
  disconnectFreighterWallet();
  connectedAddress = null;
  updateWalletUI(false);
  setStatus("walletStatus", "Not connected");
  $("balanceValue").textContent = "-";
  setStatus("balanceStatus", "");
  setStatus("sendStatus", "");
  setResultPanel("No transaction submitted yet. Ready to record ledger confirmations.", "empty");
}

async function refreshBalance() {
  if (!connectedAddress) return;
  try {
    setStatus("balanceStatus", "Fetching balance...");
    $("balanceValue").textContent = await fetchNativeBalance(connectedAddress, activeServer());
    setStatus("balanceStatus", "Balance up to date.", "success");
  } catch (error) {
    if (error?.response?.status === 404) {
      $("balanceValue").textContent = "0.0000";
      setStatus("balanceStatus", "Account not found on Testnet yet. Fund it via Friendbot first.", "error");
      return;
    }
    setStatus("balanceStatus", `Failed to fetch balance: ${error.message || error}`, "error");
  }
}

async function sendPayment() {
  const destination = $("destinationInput").value.trim();
  const amount = $("amountInput").value.trim();
  const memo = $("memoInput").value.trim();

  if (!connectedAddress) {
    setStatus("sendStatus", "Connect your wallet first.", "error");
    return;
  }
  if (!destination || !StellarSdk.StrKey.isValidEd25519PublicKey(destination)) {
    setStatus("sendStatus", "Enter a valid recipient public key that starts with G.", "error");
    return;
  }
  if (!amount || Number(amount) <= 0) {
    setStatus("sendStatus", "Enter a positive amount.", "error");
    return;
  }

  try {
    setStatus("sendStatus", "Building transaction...");
    if (window.CareAnalytics) window.CareAnalytics.trackContributeStart(connectedAddress, amount);

    const transaction = await buildNativePaymentTransaction({
      sourceAddress: connectedAddress,
      destination,
      amount,
      memo,
      server: activeServer(),
    });

    setStatus("sendStatus", "Waiting for signature in Freighter...");
    const signedTxXdr = isLocalTestMode()
      ? transaction.toXDR()
      : await signWithFreighter(transaction.toXDR(), connectedAddress);

    setStatus("sendStatus", "Submitting to Stellar Testnet...");
    const result = await submitClassicTransaction(signedTxXdr, activeServer());
    if (window.CareAnalytics) window.CareAnalytics.trackContributeSuccess(connectedAddress, amount, result.hash);

    setStatus("sendStatus", "Payment sent.", "success");
    setResultPanel(
      `SUCCESS<br><br>Amount: ${amount} XLM<br>To: ${destination}<br>Transaction Hash: ${result.hash}<br><br><a href="https://stellar.expert/explorer/testnet/tx/${result.hash}" target="_blank" rel="noopener">View on StellarExpert</a>`,
      "success",
    );
    await refreshBalance();
    if (window.CareFeedback) setTimeout(() => window.CareFeedback.open("donation_success"), 1200);
  } catch (error) {
    const details = error?.response?.data?.extras?.result_codes
      ? JSON.stringify(error.response.data.extras.result_codes)
      : error.message || String(error);
    if (window.CareAnalytics) window.CareAnalytics.trackContributeFailed(connectedAddress, amount, details);
    setStatus("sendStatus", "Payment failed.", "error");
    setResultPanel(`FAILURE<br><br>Reason: ${details}`, "error");
  }
}

function applyCaregiverPrefill() {
  const careId = new URLSearchParams(window.location.search).get("care");
  if (!careId) return;
  const caregiver = findCaregiverById(careId);
  if (!caregiver) return;
  $("destinationInput").value = caregiver.publicKey;
  $("memoInput").value = `Care credit for ${caregiver.name}`.slice(0, 28);
  $("prefillBanner").textContent = `Sending to ${caregiver.name} (${caregiver.role}). Connect your wallet below to continue.`;
  $("prefillBanner").classList.remove("hidden");
}

export function renderWalletPage(root) {
  connectedAddress = null;
  root.innerHTML = renderShell(
    "wallet",
    `
      <header class="hero compact-hero">
        <div class="container text-center">
          <span class="eyebrow">Stellar Testnet Wallet Integration</span>
          <h1>Direct Care Transfer</h1>
          <p class="lede">Connect Freighter, display your XLM balance, and send a signed Testnet payment with visible transaction feedback.</p>
          <div class="wallet-bar">
            <button id="connectBtn" class="btn btn-primary">Connect Freighter Wallet</button>
            <button id="disconnectBtn" class="btn btn-outline hidden">Disconnect</button>
          </div>
          <p id="walletStatus" class="status" aria-live="polite">Not connected</p>
        </div>
      </header>
      <main class="container section page-topless">
        <div id="prefillBanner" class="prefill-banner hidden"></div>
        <div class="grid">
          <section class="card">
            <h2>Wallet Balance</h2>
            <p class="hint">Connected account balance on Stellar Testnet.</p>
            <div class="balance-display"><span id="balanceValue" class="value">-</span><span class="unit">XLM</span></div>
            <button id="refreshBalanceBtn" class="btn btn-outline btn-block" disabled>Refresh Balance</button>
            <p id="balanceStatus" class="status" aria-live="polite"></p>
            <p class="hint divider-hint">Need testnet funds? Use <a href="https://friendbot.stellar.org" target="_blank" rel="noopener">Friendbot</a>.</p>
          </section>
          <section class="card">
            <h2>Send Care Credit</h2>
            <label>Recipient Public Address<input id="destinationInput" type="text" placeholder="G... caregiver public key" /></label>
            <label>Amount (XLM)<input id="amountInput" type="number" step="0.0000001" placeholder="10.0" /></label>
            <label>Memo (Optional)<input id="memoInput" type="text" placeholder="Care credit top-up" maxlength="28" /></label>
            <button id="sendBtn" class="btn btn-accent btn-block" disabled>Send Payment</button>
            <p id="sendStatus" class="status" aria-live="polite"></p>
          </section>
          <section class="card wide">
            <h2>Transaction Result</h2>
            <div id="resultPanel" class="result-panel empty" aria-live="polite">No transaction submitted yet. Ready to record ledger confirmations.</div>
          </section>
        </div>
      </main>
    `,
  );

  const cleanupChrome = initPageChrome();
  applyCaregiverPrefill();
  $("connectBtn").addEventListener("click", connectWallet);
  $("disconnectBtn").addEventListener("click", disconnectWallet);
  $("refreshBalanceBtn").addEventListener("click", refreshBalance);
  $("sendBtn").addEventListener("click", sendPayment);
  return cleanupChrome;
}
