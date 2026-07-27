import { findCaregiverById } from "../data/caregivers.js";
import { initPageChrome, renderShell } from "../components/layout.js";
import {
  NETWORK_PASSPHRASE,
  StellarSdk,
  getRpcNamespace,
  getRpcServer,
  horizonServer,
} from "../lib/stellar.js";
import {
  calculateProgressPercent,
  classifyError,
  errorMessageFor,
  truncateAddress,
  xlmToStroops,
} from "../lib/utils.js";
import { connectFreighterWallet, signWithFreighter } from "../lib/freighterWallet.js";

const REGISTRY_CONTRACT_ID = "CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224";
const DEFAULT_POOL_ID = "CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN";

let connectedAddress = null;
let activeContractId = null;
let raisedAmount = 0;
let goalAmount = 0;
let caregiverAddress = null;
let isVerified = false;
let isPaused = false;
let eventInterval = null;
let lastCheckedLedger = 0;

const $ = (id) => document.getElementById(id);

function isLocalTestMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has("testmode") && ["localhost", "127.0.0.1", "[::1]", ""].includes(window.location.hostname);
}

function setStatus(id, message, kind = "") {
  const element = $(id);
  if (!element) return;
  element.textContent = message;
  element.className = `status ${kind}`;
}

function setStatusHtml(id, html, kind = "") {
  const element = $(id);
  if (!element) return;
  element.innerHTML = html;
  element.className = `status ${kind}`;
}

function showLoading(message = "Loading on-chain state...") {
  $("loadingMessage").textContent = message;
  $("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  $("loadingOverlay").classList.add("hidden");
}

function updateWalletUI(connected) {
  $("connectBtn").classList.toggle("hidden", connected);
  $("disconnectBtn").classList.toggle("hidden", !connected);
  $("contributeBtn").disabled = !connected || !activeContractId;
}

function updateWithdrawUI() {
  const section = $("withdrawSection");
  if (!section) return;
  const isCaregiver = connectedAddress && caregiverAddress && connectedAddress === caregiverAddress;
  section.classList.toggle("hidden", !isCaregiver);
  if (!isCaregiver) return;

  const button = $("withdrawBtn");
  if (!isVerified) {
    button.disabled = true;
    setStatus("withdrawStatus", "Caregiver is not verified in CareRegistry. Withdrawal blocked.", "error");
  } else if (isPaused) {
    button.disabled = true;
    setStatus("withdrawStatus", "Caregiver is paused in CareRegistry. Withdrawal blocked.", "error");
  } else {
    button.disabled = false;
    setStatus("withdrawStatus", "");
  }
}

function showError(id, error) {
  const code = classifyError(error);
  const extra = code === "UNKNOWN_ERROR" ? ` (${error.message || String(error)})` : "";
  setStatus(id, `Error: ${errorMessageFor(code)}${extra}`, "error");
}

async function connectWallet() {
  if (isLocalTestMode()) {
    connectedAddress = new URLSearchParams(window.location.search).has("caregiver")
      ? "GCYRYFQXKWKPI74B23SKUZXQOKIY6CZUUS7AWDGX6MRPNKGVSEKTDAEL"
      : "GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4";
    setStatus("walletStatus", `Connected: ${truncateAddress(connectedAddress)} (Testnet Mock)`, "success");
    updateWalletUI(true);
    updateWithdrawUI();
    return;
  }

  try {
    setStatus("walletStatus", "Connecting Freighter...");
    const { address } = await connectFreighterWallet();
    connectedAddress = address;
    updateWalletUI(true);
    updateWithdrawUI();
    setStatus("walletStatus", `Connected: ${truncateAddress(address)} (Testnet)`, "success");
    if (window.CareAnalytics) window.CareAnalytics.trackConnect(address);
  } catch (error) {
    showError("walletStatus", error);
  }
}

function disconnectWallet() {
  if (connectedAddress && window.CareAnalytics) window.CareAnalytics.trackDisconnect(connectedAddress);
  connectedAddress = null;
  window.CareWalletState = { address: null, network: null };
  updateWalletUI(false);
  updateWithdrawUI();
  setStatus("walletStatus", "Not connected");
}

function updateProgressUI() {
  $("raisedValue").textContent = raisedAmount.toFixed(4);
  $("goalValue").textContent = goalAmount.toFixed(4);
  $("caregiverAddr").textContent = truncateAddress(caregiverAddress);
  $("caregiverAddr").title = caregiverAddress || "";

  const percent = calculateProgressPercent(raisedAmount, goalAmount);
  $("progressBar").style.width = `${percent}%`;
  $("progressPercent").textContent = `${percent}%`;
  $("progressRingCircle").style.strokeDashoffset = 377 - (percent / 100) * 377;
  $("goalBadge").classList.toggle("hidden", raisedAmount < goalAmount);
  $("verifiedBadge").classList.toggle("hidden", !isVerified);
  $("pausedBadge").classList.toggle("hidden", !isPaused);
}

function safeDecodeScVal(scVal) {
  if (!scVal) return null;
  try {
    const switchValue = scVal.switch().name || scVal.switch().value || scVal.switch();
    if (switchValue === "scvAddress" || switchValue === 18) {
      const address = scVal.address();
      const addressType = address.switch().name || address.switch().value || address.switch();
      if (addressType === "scAddressTypeAccount" || addressType === 0) {
        return StellarSdk.StrKey.encodeEd25519PublicKey(address.accountId().ed25519());
      }
      if (addressType === "scAddressTypeContract" || addressType === 1) {
        return StellarSdk.StrKey.encodeContract(address.contractId());
      }
    }
  } catch (_) {}
  return StellarSdk.scValToNative(scVal);
}

async function simulateReadOnly(contractId, method, args) {
  const rpcServer = getRpcServer();
  const rpcNamespace = getRpcNamespace();
  const tempAccount = new StellarSdk.Account("GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4", "1");
  const transaction = new StellarSdk.TransactionBuilder(tempAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .setTimeout(StellarSdk.TimeoutInfinite)
    .addOperation(StellarSdk.Operation.invokeContractFunction({ contract: contractId, function: method, args }))
    .build();

  const response = await rpcServer.simulateTransaction(transaction);
  if (rpcNamespace.Api.isSimulationSuccess(response)) {
    return safeDecodeScVal(response.result.retval);
  }
  throw new Error(`Simulation failed: ${response.error || "unknown error"}`);
}

async function refreshRegistryStatus() {
  if (!caregiverAddress) return;
  try {
    const caregiverVal = StellarSdk.nativeToScVal(caregiverAddress, { type: "address" });
    isVerified = await simulateReadOnly(REGISTRY_CONTRACT_ID, "is_verified", [caregiverVal]);
    isPaused = await simulateReadOnly(REGISTRY_CONTRACT_ID, "is_paused", [caregiverVal]);
  } catch (error) {
    console.warn("Failed to query CareRegistry status:", error);
  }
}

async function loadPool() {
  const contractId = $("contractInput").value.trim();
  if (!contractId) {
    setStatus("configStatus", "Please enter a valid Contract ID.", "error");
    return;
  }
  activeContractId = contractId;
  showLoading("Fetching contract state...");
  setStatus("configStatus", "Loading pool details...");

  if (isLocalTestMode()) {
    caregiverAddress = "GCYRYFQXKWKPI74B23SKUZXQOKIY6CZUUS7AWDGX6MRPNKGVSEKTDAEL";
    goalAmount = 100;
    raisedAmount = 40;
    isVerified = true;
    isPaused = false;
    updateProgressUI();
    updateWalletUI(Boolean(connectedAddress));
    updateWithdrawUI();
    setStatus("configStatus", "Pool loaded successfully in mock mode.", "success");
    hideLoading();
    return;
  }

  try {
    const [raisedVal, goalVal, careVal] = await Promise.all([
      simulateReadOnly(contractId, "total_raised", []),
      simulateReadOnly(contractId, "goal", []),
      simulateReadOnly(contractId, "caregiver", []),
    ]);
    raisedAmount = Number(raisedVal) / 10000000;
    goalAmount = Number(goalVal) / 10000000;
    caregiverAddress = careVal;
    await refreshRegistryStatus();
    updateProgressUI();
    updateWalletUI(Boolean(connectedAddress));
    updateWithdrawUI();
    startEventPolling();
    setStatus("configStatus", "Pool loaded successfully.", "success");
  } catch (error) {
    activeContractId = null;
    updateWalletUI(false);
    updateWithdrawUI();
    setStatus("configStatus", `Failed to load contract: ${error.message || error}`, "error");
  } finally {
    hideLoading();
  }
}

async function invokeContract(method, args, statusId) {
  const rpcServer = getRpcServer();
  const sourceAccount = await horizonServer.loadAccount(connectedAddress);
  let transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .setTimeout(StellarSdk.TimeoutInfinite)
    .addOperation(StellarSdk.Operation.invokeContractFunction({ contract: activeContractId, function: method, args }))
    .build();

  setStatus(statusId, "Simulating on ledger...");
  transaction = await rpcServer.prepareTransaction(transaction);

  setStatus(statusId, "Waiting for signature...");
  const signedTxXdr = await signWithFreighter(transaction.toXDR(), connectedAddress);
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

  setStatus(statusId, "Submitting to network...");
  let response = await rpcServer.sendTransaction(signedTx);
  if (response.status === "ERROR") throw new Error(JSON.stringify(response.errorResult));

  const hash = response.hash;
  setStatus(statusId, "Confirming transaction...");
  for (let count = 0; count < 20; count += 1) {
    response = await rpcServer.getTransaction(hash);
    if (response.status === "SUCCESS") return { ...response, hash };
    if (response.status === "FAILED") throw new Error(`Transaction failed: ${JSON.stringify(response.resultResultXdr)}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Transaction confirmation timeout. Check the ledger later.");
}

async function contributeToPool() {
  const amount = $("contributeAmount").value.trim();
  if (!amount || Number(amount) <= 0) {
    setStatus("contributeStatus", "Enter a positive amount.", "error");
    return;
  }

  showLoading("Submitting contribution to ledger...");
  if (isLocalTestMode()) {
    raisedAmount += Number(amount);
    updateProgressUI();
    addActivityFeedEvent(truncateAddress(connectedAddress), `contributed ${amount} XLM`);
    setStatus("contributeStatus", "Contribution successful in mock mode.", "success");
    hideLoading();
    return;
  }

  try {
    if (window.CareAnalytics) window.CareAnalytics.trackContributeStart(connectedAddress, amount);
    const account = await horizonServer.loadAccount(connectedAddress);
    const nativeBalance = account.balances.find((balance) => balance.asset_type === "native");
    if ((nativeBalance ? Number(nativeBalance.balance) : 0) < Number(amount) + 1) {
      throw new Error("insufficient balance");
    }

    const result = await invokeContract(
      "contribute",
      [
        StellarSdk.nativeToScVal(connectedAddress, { type: "address" }),
        StellarSdk.nativeToScVal(BigInt(xlmToStroops(amount)), { type: "i128" }),
      ],
      "contributeStatus",
    );
    if (window.CareAnalytics) window.CareAnalytics.trackContributeSuccess(connectedAddress, amount, result.hash);
    setStatusHtml("contributeStatus", `Contribution successful. <a href="https://stellar.expert/explorer/testnet/tx/${result.hash}" target="_blank" rel="noopener">View on StellarExpert</a>`, "success");
    $("contributeAmount").value = "";
    if (result.returnValue) raisedAmount = Number(StellarSdk.scValToNative(result.returnValue)) / 10000000;
    updateProgressUI();
  } catch (error) {
    if (window.CareAnalytics) window.CareAnalytics.trackContributeFailed(connectedAddress, amount, error.message);
    showError("contributeStatus", error);
  } finally {
    hideLoading();
  }
}

async function withdrawFromPool() {
  showLoading("Withdrawing funds from ledger...");
  if (isLocalTestMode()) {
    addActivityFeedEvent("Caregiver", "withdrew all raised funds");
    raisedAmount = 0;
    updateProgressUI();
    setStatus("withdrawStatus", "Withdrawal successful in mock mode.", "success");
    hideLoading();
    return;
  }

  try {
    const result = await invokeContract(
      "withdraw",
      [StellarSdk.nativeToScVal(connectedAddress, { type: "address" })],
      "withdrawStatus",
    );
    setStatusHtml("withdrawStatus", `Withdrawal successful. <a href="https://stellar.expert/explorer/testnet/tx/${result.hash}" target="_blank" rel="noopener">View on StellarExpert</a>`, "success");
    raisedAmount = 0;
    updateProgressUI();
  } catch (error) {
    showError("withdrawStatus", error);
  } finally {
    hideLoading();
  }
}

function addActivityFeedEvent(actor, actionText) {
  const feed = $("activityFeed");
  if (feed.textContent.includes("Waiting") || feed.textContent.includes("Listening")) {
    feed.innerHTML = "";
    feed.className = "result-panel";
  }
  const eventItem = document.createElement("div");
  eventItem.className = "feed-event-item";
  eventItem.innerHTML = `<div class="feed-event-actor"><div class="feed-event-dot"></div><div><strong>${actor}</strong> ${actionText}</div></div><div class="feed-event-time">${new Date().toLocaleTimeString()}</div>`;
  feed.prepend(eventItem);
}

function startEventPolling() {
  if (eventInterval) clearInterval(eventInterval);
  const feed = $("activityFeed");
  feed.className = "result-panel";
  feed.innerHTML = "<div>Listening to live contract events...</div>";
  eventInterval = setInterval(async () => {
    try {
      await refreshRegistryStatus();
      updateWithdrawUI();
      const rpcServer = getRpcServer();
      const latestLedger = (await rpcServer.getLatestLedger()).sequence;
      if (lastCheckedLedger === 0) lastCheckedLedger = latestLedger - 10;
      if (lastCheckedLedger >= latestLedger) return;
      const response = await rpcServer.getEvents({
        startLedger: lastCheckedLedger + 1,
        filters: [{ type: "contract", contractIds: [activeContractId, REGISTRY_CONTRACT_ID] }],
        limit: 15,
      });
      lastCheckedLedger = latestLedger;
      for (const event of response.events || []) {
        const topics = event.topic.map((topic) => StellarSdk.scValToNative(topic));
        addActivityFeedEvent(String(topics[0] || "Contract"), "emitted an on-chain event");
      }
    } catch (error) {
      console.warn("Failed to poll events:", error);
    }
  }, 5000);
}

function applyPrefill() {
  const careId = new URLSearchParams(window.location.search).get("care");
  if (!careId) return;
  const caregiver = findCaregiverById(careId);
  if (!caregiver) return;
  $("prefillBanner").innerHTML = `<strong>Caregiver Selected:</strong> ${caregiver.name} (${caregiver.role})<br><span>${caregiver.publicKey}</span>`;
  $("prefillBanner").classList.remove("hidden");
}

export function renderPoolPage(root) {
  root.innerHTML = renderShell(
    "pool",
    `
      <div id="loadingOverlay" class="loading-overlay hidden"><div class="loading-card"><div class="spinner"></div><p id="loadingMessage">Loading on-chain state...</p></div></div>
      <header class="hero compact-hero">
        <div class="container text-center">
          <span class="eyebrow">Soroban Smart Contract</span>
          <h1>Family Fund Pool</h1>
          <p class="lede">Contribute collectively using a verified Stellar Testnet funding contract.</p>
          <div class="wallet-bar"><button id="connectBtn" class="btn btn-primary">Connect Wallet</button><button id="disconnectBtn" class="btn btn-outline hidden">Disconnect</button></div>
          <p id="walletStatus" class="status" aria-live="polite">Not connected</p>
        </div>
      </header>
      <main class="container section page-topless">
        <div id="prefillBanner" class="prefill-banner hidden"></div>
        <div class="grid">
          <section class="card wide">
            <h2>Active Funding Pool Registry</h2>
            <label>Select Active Funding Pool
              <select id="poolSelectorDropdown" class="feedback-textarea">
                <option value="${DEFAULT_POOL_ID}">Primary Family Support Pool</option>
                <option value="CDYIHXTJFHHL4RFDEDIJ4CA2LTTYDQXAPIKJ4KRRQYJYFGCPJZHE4224">Hospice Caregiver Relief Fund</option>
                <option value="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC">Pediatric Emergency Care Pool</option>
              </select>
            </label>
            <div class="config-form"><label>Contract ID<input id="contractInput" type="text" placeholder="C... contract address" /></label><button id="loadPoolBtn" class="btn btn-accent">Load Selected Pool</button></div>
            <p id="configStatus" class="status" aria-live="polite"></p>
          </section>
          <section class="card wide">
            <h2>Funding Progress</h2>
            <div class="progress-card-content">
              <div class="progress-ring-container"><svg width="140" height="140"><circle class="progress-ring-circle-bg" cx="70" cy="70" r="60"></circle><circle id="progressRingCircle" class="progress-ring-circle" cx="70" cy="70" r="60" stroke-dasharray="377" stroke-dashoffset="377"></circle></svg><div class="progress-ring-text"><span id="progressPercent" class="percentage">0%</span><span class="label">Funded</span></div></div>
              <div class="progress-details"><div class="progress-stats-numbers"><span id="raisedValue" class="raised">0.0000</span><span> / </span><span id="goalValue" class="goal">0.0000</span><span> XLM</span></div><div class="progress-bar-bg"><div id="progressBar" class="progress-bar"></div></div><p class="hint">Target Caregiver: <code id="caregiverAddr">-</code> <span id="verifiedBadge" class="badge success hidden">Verified</span><span id="pausedBadge" class="badge danger hidden">Paused</span><span id="goalBadge" class="badge success hidden">Goal Reached</span></p></div>
            </div>
          </section>
          <section class="card"><h2>Contribute to Pool</h2><label>Amount (XLM)<input id="contributeAmount" type="number" step="0.0000001" placeholder="10.0" /></label><button id="contributeBtn" class="btn btn-accent btn-block" disabled>Contribute</button><p id="contributeStatus" class="status"></p></section>
          <section id="withdrawSection" class="card hidden"><h2>Withdraw Funds</h2><p class="hint">Shown only when the connected wallet is the caregiver for this pool.</p><button id="withdrawBtn" class="btn btn-primary btn-block">Withdraw Raised Funds</button><p id="withdrawStatus" class="status"></p></section>
          <section class="card wide"><h2>Live Pool Activity Feed</h2><div id="activityFeed" class="result-panel empty">Waiting to load pool state...</div></section>
        </div>
      </main>
    `,
  );

  const cleanupChrome = initPageChrome();
  applyPrefill();
  $("connectBtn").addEventListener("click", connectWallet);
  $("disconnectBtn").addEventListener("click", disconnectWallet);
  $("loadPoolBtn").addEventListener("click", loadPool);
  $("contributeBtn").addEventListener("click", contributeToPool);
  $("withdrawBtn").addEventListener("click", withdrawFromPool);

  const activePool = window.CarePools?.getActivePool();
  $("contractInput").value = activePool?.id || DEFAULT_POOL_ID;
  $("poolSelectorDropdown").value = $("contractInput").value;
  $("poolSelectorDropdown").addEventListener("change", (event) => {
    window.CarePools?.setActivePool(event.target.value);
    $("contractInput").value = event.target.value;
    loadPool();
  });

  return () => {
    if (eventInterval) clearInterval(eventInterval);
    cleanupChrome();
  };
}
