/**
 * app.js — CareCredits Wallet Page
 * Stellar Journey to Mastery — Level 1 (White Belt)
 *
 * Implements all Level 1 requirements (unchanged from the original
 * submission — only the surrounding UI/theme changed):
 *   1. Wallet Setup       — Freighter, Stellar Testnet
 *   2. Wallet Connection  — connect + disconnect
 *   3. Balance Handling   — fetch + display connected wallet's XLM balance
 *   4. Transaction Flow   — send an XLM payment, show success/failure + tx hash
 *
 * NEW in this version: reads a `?care=<id>` query param (set when the
 * user clicks "Select" on a caregiver card on index.html) and
 * pre-fills the recipient address + memo accordingly.
 */

import StellarSdk from "https://esm.sh/@stellar/stellar-sdk@14.0.0";
import actualFreighterApi from "https://esm.sh/@stellar/freighter-api";
import { findCaregiverById } from "../caregivers.js";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
let server = new StellarSdk.Horizon.Server(HORIZON_URL);

// Mock mode for testing without extension - Gated to local development only to protect production integrity
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.has("testmode") && (
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1" || 
  window.location.hostname === "[::1]" ||
  window.location.hostname === ""
);

const freighterApi = isTestMode ? {
  isConnected: async () => ({ isConnected: true }),
  requestAccess: async () => ({ address: "GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4" }),
  getAddress: async () => ({ address: "GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4" }),
  getNetwork: async () => ({ network: "TESTNET" }),
  signTransaction: async (xdr) => ({ signedTxXdr: xdr }),
} : actualFreighterApi;

if (isTestMode) {
  server = {
    loadAccount: async (address) => {
      const acc = new StellarSdk.Account(address, "1");
      acc.balances = [{ asset_type: "native", balance: "100.0000000" }];
      return acc;
    },
    submitTransaction: async (tx) => ({
      hash: "mock_tx_hash_1234567890abcdef1234567890abcdef",
    }),
  };
}

let connectedAddress = null;

// ---------- DOM helpers ----------
const $ = (id) => document.getElementById(id);

function setStatus(elId, message, kind = "") {
  const el = $(elId);
  el.textContent = message;
  el.className = `status ${kind}`;
}

function setResultPanel(html, kind) {
  const el = $("resultPanel");
  el.innerHTML = html;
  el.className = `result-panel ${kind}`;
}

function updateWalletUI(connected) {
  $("connectBtn").classList.toggle("hidden", connected);
  $("disconnectBtn").classList.toggle("hidden", !connected);
  $("refreshBalanceBtn").disabled = !connected;
  $("sendBtn").disabled = !connected;
}

// ---------- Pre-fill from Caregiver Directory selection ----------
function applyCaregiverPrefill() {
  const params = new URLSearchParams(window.location.search);
  const careId = params.get("care");
  if (!careId) return;

  const caregiver = findCaregiverById(careId);
  if (!caregiver) return;

  $("destinationInput").value = caregiver.publicKey;
  $("memoInput").value = `Care credit for ${caregiver.name}`.slice(0, 28);

  const banner = $("prefillBanner");
  banner.textContent = `${caregiver.emoji} Sending to ${caregiver.name} (${caregiver.role}) — connect your wallet below to continue.`;
  banner.classList.remove("hidden");
}

// ---------- 1 & 2. Wallet Setup + Connect/Disconnect ----------
async function connectWallet() {
  try {
    const connectionCheck = await freighterApi.isConnected();
    const isInstalled = 
      typeof connectionCheck === "boolean" 
        ? connectionCheck 
        : (connectionCheck && typeof connectionCheck === "object" 
            ? ("isConnected" in connectionCheck ? connectionCheck.isConnected : true)
            : !!connectionCheck);

    if (!isInstalled) {
      setStatus(
        "walletStatus",
        "Freighter extension not found. Install it from freighter.app, then reload this page.",
        "error"
      );
      return;
    }

    await freighterApi.requestAccess();
    const { address } = await freighterApi.getAddress();
    const { network } = await freighterApi.getNetwork();

    if (network !== "TESTNET") {
      setStatus(
        "walletStatus",
        `⚠️ Freighter is set to ${network}. Switch Freighter to TESTNET and reconnect.`,
        "error"
      );
      return;
    }

    connectedAddress = address;
    updateWalletUI(true);
    setStatus(
      "walletStatus",
      `Connected: ${address.slice(0, 6)}...${address.slice(-6)} (Testnet)`,
      "success"
    );

    await refreshBalance();
  } catch (err) {
    setStatus("walletStatus", `Connection failed: ${err.message || err}`, "error");
  }
}

function disconnectWallet() {
  connectedAddress = null;
  updateWalletUI(false);
  setStatus("walletStatus", "Not connected", "");
  $("balanceValue").textContent = "—";
  setStatus("balanceStatus", "", "");
  setResultPanel("No transaction submitted yet.", "empty");
}

// ---------- 3. Balance Handling ----------
async function refreshBalance() {
  if (!connectedAddress) return;
  try {
    setStatus("balanceStatus", "Fetching balance...");
    const account = await server.loadAccount(connectedAddress);
    const nativeBalance = account.balances.find((b) => b.asset_type === "native");
    $("balanceValue").textContent = nativeBalance ? Number(nativeBalance.balance).toFixed(4) : "0.0000";
    setStatus("balanceStatus", "Balance up to date.", "success");
  } catch (err) {
    if (err?.response?.status === 404) {
      $("balanceValue").textContent = "0.0000";
      setStatus(
        "balanceStatus",
        "Account not found on Testnet yet — fund it via Friendbot first.",
        "error"
      );
    } else {
      setStatus("balanceStatus", `Failed to fetch balance: ${err.message || err}`, "error");
    }
  }
}

// ---------- 4. Transaction Flow ----------
async function sendPayment() {
  const destination = $("destinationInput").value.trim();
  const amount = $("amountInput").value.trim();
  const memoText = $("memoInput").value.trim();

  if (!connectedAddress) {
    setStatus("sendStatus", "Connect your wallet first.", "error");
    return;
  }
  if (!destination || !StellarSdk.StrKey.isValidEd25519PublicKey(destination)) {
    setStatus("sendStatus", "Enter a valid recipient public key (starts with G...).", "error");
    return;
  }
  if (!amount || Number(amount) <= 0) {
    setStatus("sendStatus", "Enter a positive amount.", "error");
    return;
  }

  try {
    setStatus("sendStatus", "Building transaction...");

    const sourceAccount = await server.loadAccount(connectedAddress);

    let txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    }).addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount: Number(amount).toFixed(7),
      })
    );

    if (memoText) {
      txBuilder = txBuilder.addMemo(StellarSdk.Memo.text(memoText));
    }

    const transaction = txBuilder.setTimeout(StellarSdk.TimeoutInfinite).build();

    setStatus("sendStatus", "Waiting for signature in Freighter...");
    const { signedTxXdr } = await freighterApi.signTransaction(transaction.toXDR(), {
      networkPassphrase: NETWORK_PASSPHRASE,
      address: connectedAddress,
    });

    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

    setStatus("sendStatus", "Submitting to Stellar Testnet...");
    const result = await server.submitTransaction(signedTransaction);

    setStatus("sendStatus", "✅ Payment sent!", "success");
    setResultPanel(
      `✅ SUCCESS\n\n` +
        `Amount: ${amount} XLM\n` +
        `To: ${destination}\n` +
        `Transaction Hash: ${result.hash}\n\n` +
        `View on StellarExpert: ` +
        `<a href="https://stellar.expert/explorer/testnet/tx/${result.hash}" target="_blank" rel="noopener">` +
        `https://stellar.expert/explorer/testnet/tx/${result.hash}</a>`,
      "success"
    );

    await refreshBalance();
  } catch (err) {
    const details = err?.response?.data?.extras?.result_codes
      ? JSON.stringify(err.response.data.extras.result_codes)
      : err.message || String(err);

    setStatus("sendStatus", "❌ Payment failed.", "error");
    setResultPanel(`❌ FAILURE\n\nReason: ${details}`, "error");
  }
}

// ---------- Wire up ----------
applyCaregiverPrefill();
$("connectBtn").addEventListener("click", connectWallet);
$("disconnectBtn").addEventListener("click", disconnectWallet);
$("refreshBalanceBtn").addEventListener("click", refreshBalance);
$("sendBtn").addEventListener("click", sendPayment);
