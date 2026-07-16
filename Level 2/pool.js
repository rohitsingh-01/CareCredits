import StellarSdk from "https://esm.sh/@stellar/stellar-sdk@14.0.0";
import { StellarWalletsKit, WalletNetwork, allowAllModules } from "https://esm.sh/@creit.tech/stellar-wallets-kit@1.7.5?bundle&deps=@stellar/stellar-sdk@14.0.0";
import { findCaregiverById } from "./caregivers.js";
import { stroopsToXlm, xlmToStroops, calculateProgressPercent, truncateAddress, classifyError, errorMessageFor } from "./utils.js";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

const rpcNamespace = StellarSdk.SorobanRpc || StellarSdk.rpc;
const server = new StellarSdk.Horizon.Server(HORIZON_URL);
const rpcServer = new rpcNamespace.Server(RPC_URL);

// Orange Belt registry address
const REGISTRY_CONTRACT_ID = "CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7";

// Check test mode - Gated to local development only to protect production integrity
const urlParams = new URLSearchParams(window.location.search);
const isTestMode = urlParams.has("testmode") && (
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1" || 
  window.location.hostname === "[::1]" ||
  window.location.hostname === ""
);

let connectedAddress = null;
let activeContractId = null;
let raisedAmount = 0;
let goalAmount = 0;
let caregiverAddress = null;
let isVerified = false;
let isPaused = false;
let lastCheckedLedger = 0;
let eventInterval = null;

// Initialize Wallets Kit
const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  modules: allowAllModules(),
});

const $ = (id) => document.getElementById(id);

function showLoading(msg = "Loading on-chain state...") {
  $("loadingMessage").textContent = msg;
  $("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  $("loadingOverlay").classList.add("hidden");
}

function setStatus(elId, message, kind = "") {
  const el = $(elId);
  if (el) {
    el.textContent = message;
    el.className = `status ${kind}`;
  }
}

function setResultPanel(html, kind) {
  const el = $("activityFeed");
  if (el) {
    el.innerHTML = html;
    el.className = `result-panel ${kind}`;
  }
}

// Update Connected Wallet UI
function updateWalletUI(connected) {
  $("connectBtn").classList.toggle("hidden", connected);
  $("disconnectBtn").classList.toggle("hidden", !connected);
  $("contributeBtn").disabled = !connected || !activeContractId;
}

function showErrorBanner(sectionId, err) {
  const code = classifyError(err);
  const friendlyMessage = "❌ Error: " + errorMessageFor(code) + (code === "UNKNOWN_ERROR" ? ` (${err.message || String(err)})` : "");
  setStatus(sectionId, friendlyMessage, "error");
}

// 2. Connect / Disconnect Wallet
async function connectWallet() {
  if (isTestMode) {
    connectedAddress = urlParams.has("caregiver") ? "GCYRYFQXKWKPI74B23SKUZXQOKIY6CZUUS7AWDGX6MRPNKGVSEKTDAEL" : "GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4";
    const displayName = urlParams.has("caregiver") ? "GCYRYF...DAEL (Caregiver)" : "GA6I3N...5ROCG4 (Contributor)";
    setStatus("walletStatus", `Connected: ${displayName} (Testnet Mock)`, "success");
    updateWalletUI(true);
    updateWithdrawUI();
    return;
  }

  try {
    setStatus("walletStatus", "Opening wallet options...");
    await kit.openModal({
      onWalletSelected: async (option) => {
        try {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          connectedAddress = address;
          setStatus("walletStatus", `Connected: ${address.slice(0, 6)}...${address.slice(-6)} (Testnet)`, "success");
          updateWalletUI(true);
          updateWithdrawUI();
        } catch (err) {
          showErrorBanner("walletStatus", err);
        }
      },
    });
  } catch (err) {
    showErrorBanner("walletStatus", err);
  }
}

function disconnectWallet() {
  connectedAddress = null;
  updateWalletUI(false);
  updateWithdrawUI();
  setStatus("walletStatus", "Not connected", "");
}

// Update Withdraw Card visibility and check registry rules
function updateWithdrawUI() {
  const section = $("withdrawSection");
  if (connectedAddress && caregiverAddress && connectedAddress === caregiverAddress) {
    section.classList.remove("hidden");
    
    // Gating check
    const withdrawBtn = $("withdrawBtn");
    if (!isVerified) {
      withdrawBtn.disabled = true;
      setStatus("withdrawStatus", "⚠️ Caregiver is not verified in the CareRegistry. Withdrawal blocked.", "error");
    } else if (isPaused) {
      withdrawBtn.disabled = true;
      setStatus("withdrawStatus", "⚠️ Caregiver is paused in the CareRegistry. Withdrawal blocked.", "error");
    } else {
      withdrawBtn.disabled = false;
      setStatus("withdrawStatus", "", "");
    }
  } else {
    section.classList.add("hidden");
  }
}

// 3. Load Pool Details (Read operations)
async function loadPool() {
  const inputId = $("contractInput").value.trim();
  if (!inputId) {
    setStatus("configStatus", "Please enter a valid Contract ID.", "error");
    return;
  }
  activeContractId = inputId;
  setStatus("configStatus", "Loading pool details...", "success");
  showLoading("Fetching contract state...");

  if (isTestMode) {
    caregiverAddress = "GCYRYFQXKWKPI74B23SKUZXQOKIY6CZUUS7AWDGX6MRPNKGVSEKTDAEL";
    goalAmount = 100;
    raisedAmount = 40;
    isVerified = true;
    isPaused = false;
    lastCheckedLedger = 1000;
    updateProgressUI();
    updateWalletUI(!!connectedAddress);
    updateWithdrawUI();
    startMockEvents();
    hideLoading();
    setStatus("configStatus", "✅ Pool loaded successfully (Mock Mode).", "success");
    return;
  }

  try {
    // Fetch Raised, Goal, and Caregiver from Soroban RPC
    const raisedVal = await simulateReadOnly(activeContractId, "total_raised", []);
    const goalVal = await simulateReadOnly(activeContractId, "goal", []);
    const careVal = await simulateReadOnly(activeContractId, "caregiver", []);

    // 1 XLM = 10,000,000 stroops
    raisedAmount = Number(raisedVal) / 10000000;
    goalAmount = Number(goalVal) / 10000000;
    caregiverAddress = careVal;

    // Fetch verified/paused status from CareRegistry
    await refreshRegistryStatus();

    updateProgressUI();
    updateWalletUI(!!connectedAddress);
    updateWithdrawUI();
    startEventPolling();
    setStatus("configStatus", "✅ Pool loaded successfully.", "success");
  } catch (err) {
    activeContractId = null;
    updateWalletUI(false);
    updateWithdrawUI();
    setStatus("configStatus", `Failed to load contract: ${err.message || err}`, "error");
  } finally {
    hideLoading();
  }
}

async function refreshRegistryStatus() {
  if (!caregiverAddress) return;
  try {
    const caregiverVal = StellarSdk.nativeToScVal(caregiverAddress, { type: "address" });
    isVerified = await simulateReadOnly(REGISTRY_CONTRACT_ID, "is_verified", [caregiverVal]);
    isPaused = await simulateReadOnly(REGISTRY_CONTRACT_ID, "is_paused", [caregiverVal]);
  } catch (err) {
    console.error("Failed to query CareRegistry status:", err);
  }
}

// Update progress elements
function updateProgressUI() {
  $("raisedValue").textContent = raisedAmount.toFixed(4);
  $("goalValue").textContent = goalAmount.toFixed(4);
  $("caregiverAddr").textContent = truncateAddress(caregiverAddress);
  $("caregiverAddr").title = caregiverAddress; // Show full address on hover

  const pct = calculateProgressPercent(raisedAmount, goalAmount);
  
  // Update linear progress bar
  const progressBar = $("progressBar");
  if (progressBar) progressBar.style.width = `${pct}%`;
  
  // Update circular progress ring
  const circle = $("progressRingCircle");
  const percentText = $("progressPercent");
  if (circle && percentText) {
    // Circumference = 2 * pi * r = 2 * 3.14159 * 60 = 376.99 ~ 377
    const offset = 377 - (pct / 100) * 377;
    circle.style.strokeDashoffset = offset;
    percentText.textContent = `${pct}%`;
  }
  
  $("goalBadge").classList.toggle("hidden", raisedAmount < goalAmount);

  // Update verified/paused badges
  const verifiedEl = $("verifiedBadge");
  const pausedEl = $("pausedBadge");
  if (verifiedEl) verifiedEl.classList.toggle("hidden", !isVerified);
  if (pausedEl) pausedEl.classList.toggle("hidden", !isPaused);
}

// Helper to decode ScVal safely across different ESM bundle versions
function safeDecodeScVal(scVal) {
  if (!scVal) return null;
  
  try {
    const scValType = scVal.switch().name || scVal.switch().value || scVal.switch();
    if (scValType === "scvAddress" || scValType === 18) {
      const scAddress = scVal.address();
      const addrType = scAddress.switch().name || scAddress.switch().value || scAddress.switch();
      if (addrType === "scAddressTypeAccount" || addrType === 0) {
        return StellarSdk.StrKey.encodeEd25519PublicKey(scAddress.accountId().ed25519());
      } else if (addrType === "scAddressTypeContract" || addrType === 1) {
        return StellarSdk.StrKey.encodeContract(scAddress.contractId());
      }
    }
  } catch (e) {
    console.warn("Failed custom address parsing, falling back to scValToNative:", e);
  }

  return StellarSdk.scValToNative(scVal);
}

// Read-only contract simulation
async function simulateReadOnly(contractId, method, scArgs) {
  // Build a dummy transaction to simulate
  const tempAccount = new StellarSdk.Account("GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4", "1");
  const tx = new StellarSdk.TransactionBuilder(tempAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .setTimeout(StellarSdk.TimeoutInfinite)
    .addOperation(
      StellarSdk.Operation.invokeContractFunction({
        contract: contractId,
        function: method,
        args: scArgs,
      })
    )
    .build();

  const response = await rpcServer.simulateTransaction(tx);
  if (rpcNamespace.Api.isSimulationSuccess(response)) {
    return safeDecodeScVal(response.result.retval);
  } else {
    throw new Error(`Simulation failed: ${response.error || "unknown error"}`);
  }
}

// 4. Contribute (Write Operation)
async function contributeToPool() {
  const amount = $("contributeAmount").value.trim();
  if (!amount || Number(amount) <= 0) {
    setStatus("contributeStatus", "Enter a positive amount.", "error");
    return;
  }
  
  setStatus("contributeStatus", "Building transaction...");
  showLoading("Submitting contribution to ledger...");

  if (isTestMode) {
    raisedAmount += Number(amount);
    updateProgressUI();
    addActivityFeedEvent("GA6I3N...5ROCG4", `contributed ${amount} XLM`);
    setStatus("contributeStatus", "✅ Contribution successful (Mock).", "success");
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    hideLoading();
    return;
  }

  try {
    // Proactive balance check (Requirement 3: Insufficient Balance)
    const account = await server.loadAccount(connectedAddress);
    const nativeBal = account.balances.find(b => b.asset_type === "native");
    const userBalance = nativeBal ? Number(nativeBal.balance) : 0;
    
    // Check if user has enough balance plus 1.0 XLM for fees and reserve limits
    if (userBalance < Number(amount) + 1.0) {
      throw new Error("insufficient balance");
    }

    const stroops = BigInt(xlmToStroops(amount));
    const contributorVal = StellarSdk.nativeToScVal(connectedAddress, { type: "address" });
    const amountVal = StellarSdk.nativeToScVal(stroops, { type: "i128" });

    const result = await invokeContractViaKit(
      activeContractId,
      "contribute",
      [contributorVal, amountVal],
      "contributeStatus"
    );

    setStatus("contributeStatus", "✅ Contribution successful!", "success");
    $("contributeAmount").value = "";
    
    // Instantly refresh balance & progress
    raisedAmount = Number(StellarSdk.scValToNative(result.returnValue)) / 10000000;
    updateProgressUI();

    // Trigger subtle success confetti
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  } catch (err) {
    showErrorBanner("contributeStatus", err);
  } finally {
    hideLoading();
  }
}

// 5. Withdraw (Write Operation)
async function withdrawFromPool() {
  setStatus("withdrawStatus", "Building transaction...");
  showLoading("Withdrawing funds from ledger...");

  if (isTestMode) {
    addActivityFeedEvent("Caregiver", `withdrew all raised funds!`);
    raisedAmount = 0;
    updateProgressUI();
    updateWithdrawUI();
    setStatus("withdrawStatus", "✅ Withdrawal successful (Mock).", "success");
    hideLoading();
    return;
  }

  try {
    const caregiverVal = StellarSdk.nativeToScVal(connectedAddress, { type: "address" });

    const result = await invokeContractViaKit(
      activeContractId,
      "withdraw",
      [caregiverVal],
      "withdrawStatus"
    );

    setStatus("withdrawStatus", "✅ Withdrawal successful! Funds transferred.", "success");
    raisedAmount = 0; // Set local raised amount to 0 since it has been withdrawn
    updateProgressUI();
    updateWithdrawUI();
  } catch (err) {
    showErrorBanner("withdrawStatus", err);
  } finally {
    hideLoading();
  }
}

// Generic Invoke Helper
async function invokeContractViaKit(contractId, method, scArgs, statusElId) {
  // 1. Load sequence
  const sourceAccount = await server.loadAccount(connectedAddress);
  
  // 2. Build Transaction
  let tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .setTimeout(StellarSdk.TimeoutInfinite)
    .addOperation(
      StellarSdk.Operation.invokeContractFunction({
        contract: contractId,
        function: method,
        args: scArgs,
      })
    )
    .build();

  // 3. Simulate Transaction (Soroban needs footprint preparation)
  setStatus(statusElId, "Simulating on ledger...");
  tx = await rpcServer.prepareTransaction(tx);

  // 4. Sign via Kit
  setStatus(statusElId, "Waiting for signature...");
  const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), {
    address: connectedAddress,
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

  // 5. Submit Transaction
  setStatus(statusElId, "Submitting to network...");
  let response = await rpcServer.sendTransaction(signedTx);
  
  if (response.status === "ERROR") {
    throw new Error(JSON.stringify(response.errorResult));
  }

  const txHash = response.hash;
  
  // 6. Poll for transaction result
  setStatus(statusElId, "Confirming transaction...");
  let count = 0;
  while (count < 20) {
    response = await rpcServer.getTransaction(txHash);
    if (response.status === "SUCCESS") {
      return response;
    }
    if (response.status === "FAILED") {
      throw new Error(`Transaction failed: ${JSON.stringify(response.resultResultXdr)}`);
    }
    await new Promise(r => setTimeout(r, 1000));
    count++;
  }
  
  throw new Error("Transaction confirmation timeout. Check the ledger later.");
}

// 6. Event Listening & Polling (Sync every 5s)
function startEventPolling() {
  if (eventInterval) clearInterval(eventInterval);
  
  // Set initial feed title
  const feed = $("activityFeed");
  feed.className = "result-panel";
  feed.innerHTML = "<div style='color: var(--muted);'>Listening to live contract events...</div>";

  eventInterval = setInterval(async () => {
    try {
      // 1. Sync registry verified/paused status
      await refreshRegistryStatus();
      updateWithdrawUI();

      // 2. Poll contract events
      const latestLedgerResponse = await rpcServer.getLatestLedger();
      const latestLedger = latestLedgerResponse.sequence;
      
      if (lastCheckedLedger === 0) {
        lastCheckedLedger = latestLedger - 10; // check last 10 ledgers initially
      }

      if (lastCheckedLedger >= latestLedger) return;

      // Listen to events on both CareFundPool AND CareRegistry
      const response = await rpcServer.getEvents({
        startLedger: lastCheckedLedger + 1,
        filters: [
          {
            type: "contract",
            contractIds: [activeContractId]
          },
          {
            type: "contract",
            contractIds: [REGISTRY_CONTRACT_ID]
          }
        ],
        limit: 15
      });

      lastCheckedLedger = latestLedger;

      if (response.events && response.events.length > 0) {
        response.events.forEach(evt => {
          // Parse topics and value
          const topics = evt.topic.map(t => StellarSdk.scValToNative(t));
          const value = StellarSdk.scValToNative(evt.value);
          const type = topics[0]; // e.g. "contrib", "withdraw", "verified", "paused"

          if (type === "contrib") {
            const contributor = topics[1];
            const amount = Number(value[0]) / 10000000;
            addActivityFeedEvent(truncateAddress(contributor), `contributed ${amount.toFixed(4)} XLM`);
            
            // Refresh total raised
            raisedAmount = Number(value[1]) / 10000000;
            updateProgressUI();
          } else if (type === "withdraw") {
            const caregiver = topics[1];
            const amount = Number(value) / 10000000;
            addActivityFeedEvent(truncateAddress(caregiver), `withdrew ${amount.toFixed(4)} XLM`);
            
            // Reset raised amount
            raisedAmount = 0;
            updateProgressUI();
            updateWithdrawUI();
          } else if (type === "verified") {
            const caregiver = topics[1];
            const verifiedStatus = value;
            addActivityFeedEvent("Admin", `updated verified status of ${truncateAddress(caregiver)} to ${verifiedStatus}`);
            if (caregiver === caregiverAddress) {
              isVerified = verifiedStatus;
              updateProgressUI();
              updateWithdrawUI();
            }
          } else if (type === "paused") {
            const caregiver = topics[1];
            const pausedStatus = value;
            addActivityFeedEvent("Admin", `updated paused status of ${truncateAddress(caregiver)} to ${pausedStatus}`);
            if (caregiver === caregiverAddress) {
              isPaused = pausedStatus;
              updateProgressUI();
              updateWithdrawUI();
            }
          }
        });
      }
    } catch (err) {
      console.error("Failed to poll events:", err);
    }
  }, 5000);
}

// Test mode mock activity generator
function startMockEvents() {
  if (eventInterval) clearInterval(eventInterval);
  
  const feed = $("activityFeed");
  feed.className = "result-panel";
  feed.innerHTML = "<div style='color: var(--muted);'>Listening to mock contract events...</div>";

  eventInterval = setInterval(() => {
    // 20% chance to simulate a mock contribution from a family member
    if (Math.random() < 0.25) {
      const amount = Math.floor(Math.random() * 15) + 5;
      raisedAmount += amount;
      updateProgressUI();
      
      const addresses = [
        "GA3IGBR6O2K44PQL...KMAD3Y",
        "GBDTF5W4E4E63B...2HHD6T",
        "GCCHG4W3J6...KLMD7Y"
      ];
      const randomAddr = addresses[Math.floor(Math.random() * addresses.length)];
      addActivityFeedEvent(randomAddr, `contributed ${amount} XLM`);
    }
  }, 5000);
}

function addActivityFeedEvent(actor, actionText) {
  const feed = $("activityFeed");
  if (feed.textContent.includes("Waiting to load") || feed.textContent.includes("Listening to")) {
    feed.innerHTML = "";
    feed.className = "result-panel";
  }
  
  const timestamp = new Date().toLocaleTimeString();
  const eventItem = document.createElement("div");
  eventItem.className = "feed-event-item";
  eventItem.innerHTML = `
    <div class="feed-event-actor">
      <div class="feed-event-dot"></div>
      <div><strong>${actor}</strong> ${actionText}</div>
    </div>
    <div class="feed-event-time">${timestamp}</div>
  `;
  
  feed.prepend(eventItem);
}

// 7. Prefill Selection logic
function applyPrefill() {
  const params = new URLSearchParams(window.location.search);
  const careId = params.get("care");
  if (!careId) return;

  const caregiver = findCaregiverById(careId);
  if (!caregiver) return;

  // Render a prefill banner
  const banner = $("prefillBanner");
  banner.innerHTML = `👩‍⚕️ <strong>Caregiver Selected:</strong> ${caregiver.name} (${caregiver.role}).<br/>` +
    `<span style="font-size: 0.8rem; color: var(--muted);">Their address is: ${caregiver.publicKey}</span>`;
  banner.classList.remove("hidden");
  
  // Note: For demo ease, if a caregiver is selected, we can pre-populate the contract input field with a dummy contract ID
  // to help the user load the pool quickly.
  if (isTestMode) {
    $("contractInput").value = "C_MOCK_CONTRACT_ID_1234567890";
  }
}

// ---------- Wire up ----------
applyPrefill();
$("connectBtn").addEventListener("click", connectWallet);
$("disconnectBtn").addEventListener("click", disconnectWallet);
$("loadPoolBtn").addEventListener("click", loadPool);
$("contributeBtn").addEventListener("click", contributeToPool);
$("withdrawBtn").addEventListener("click", withdrawFromPool);

// Pre-fill fields with Level 2 Contract ID
if (isTestMode) {
  $("contractInput").value = "CD3BFFX7DTNJAGDVVM5RYGGQQNURZTH4VSBLWF55YXY3L6T2WWZK57EI";
} else {
  $("contractInput").value = "CDYFFYP2EZE6BHSJDQJSMK6CIYBHUYHOG7GLS22EO457C32C4KPG77WO";
}
