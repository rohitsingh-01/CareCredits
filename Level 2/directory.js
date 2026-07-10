/**
 * directory.js — Renders the Caregiver Directory on index.html from the
 * shared data in caregivers.js, and links each "Select" button to
 * wallet.html?care=<id> so the wallet page can pre-fill the recipient.
 */
import { CAREGIVERS } from "./caregivers.js";
import StellarSdk from "https://esm.sh/@stellar/stellar-sdk@12.3.0";

const grid = document.getElementById("caregiverGrid");
const REGISTRY_CONTRACT_ID = "CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7";
const RPC_URL = "https://soroban-testnet.stellar.org";

grid.innerHTML = CAREGIVERS.map(
  (c) => `
  <article class="caregiver-card" id="card-${c.id}">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div class="avatar">${c.emoji}</div>
      <div style="display: flex; gap: 4px; flex-wrap: wrap;">
        <span id="verified-${c.id}" class="badge hidden" style="background: rgba(126, 231, 135, 0.1); color: var(--accent-2); border: 1px solid var(--accent-2); font-size: 0.7rem; padding: 2px 6px;">Verified</span>
        <span id="paused-${c.id}" class="badge hidden" style="background: rgba(231, 126, 126, 0.1); color: #e77e7e; border: 1px solid #e77e7e; font-size: 0.7rem; padding: 2px 6px;">Paused</span>
      </div>
    </div>
    <h3>${c.name}</h3>
    <span class="role">${c.role}</span>
    <p class="description">${c.description}</p>
    <span class="pubkey">${c.publicKey.slice(0, 4)}...${c.publicKey.slice(-4)}</span>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; width: 100%;">
      <a class="btn btn-accent btn-block" href="wallet.html?care=${encodeURIComponent(c.id)}">
        Select &amp; Send Care Credit
      </a>
      <a class="btn btn-primary btn-block" style="text-align: center; text-decoration: none;" href="pool.html?care=${encodeURIComponent(c.id)}">
        Contribute to Fund Pool
      </a>
    </div>
  </article>
`
).join("");

// Asynchronously fetch Verified/Paused statuses from CareRegistry contract
async function queryRegistry(caregiverPubKey) {
  try {
    const rpcServer = new StellarSdk.SorobanRpc.Server(RPC_URL);
    const tempAccount = new StellarSdk.Account("GA6I3NHCV6MZWTUVZYACWYFAQXQXV24IE5XTTOMPWAVNHR4MZN5ROCG4", "1");
    
    const caregiverVal = StellarSdk.xdr.ScVal.scvAddress(
      StellarSdk.Address.fromString(caregiverPubKey).toScAddress()
    );

    const simulateCall = async (method) => {
      const tx = new StellarSdk.TransactionBuilder(tempAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .setTimeout(StellarSdk.TimeoutInfinite)
        .addOperation(
          StellarSdk.Operation.invokeContractFunction({
            contract: REGISTRY_CONTRACT_ID,
            function: method,
            args: [caregiverVal],
          })
        )
        .build();
      const response = await rpcServer.simulateTransaction(tx);
      if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(response)) {
        return StellarSdk.scValToNative(response.result.retval);
      }
      return false;
    };

    const isVerified = await simulateCall("is_verified");
    const isPaused = await simulateCall("is_paused");
    return { isVerified, isPaused };
  } catch (e) {
    console.warn(`Registry query failed for ${caregiverPubKey}:`, e);
    return { isVerified: false, isPaused: false };
  }
}

// Fetch and update badges for all caregivers
CAREGIVERS.forEach(async (c) => {
  const { isVerified, isPaused } = await queryRegistry(c.publicKey);
  const verifiedBadge = document.getElementById(`verified-${c.id}`);
  const pausedBadge = document.getElementById(`paused-${c.id}`);
  
  if (verifiedBadge && isVerified) verifiedBadge.classList.remove("hidden");
  if (pausedBadge && isPaused) pausedBadge.classList.remove("hidden");
});
