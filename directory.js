/**
 * directory.js — Renders the Caregiver Directory on index.html from the
 * shared data in caregivers.js, and links each "Select" button to
 * wallet.html?care=<id> so the wallet page can pre-fill the recipient.
 */
import { CAREGIVERS } from "./caregivers.js";
import StellarSdk from "https://esm.sh/@stellar/stellar-sdk@14.0.0";

const grid = document.getElementById("caregiverGrid");
const REGISTRY_CONTRACT_ID = "CBHFP5CZ7JMWIBL4CT4HCSIWWEACQQOQJPPN3YWXCIJOMVNYISXU24U7";
const RPC_URL = "https://soroban-testnet.stellar.org";

grid.innerHTML = CAREGIVERS.map(
  (c) => `
  <article class="caregiver-card" id="card-${c.id}">
    <div class="caregiver-card-header">
      ${c.avatar 
        ? `<div class="avatar-wrapper"><img src="${c.avatar}" alt="${c.name}" class="avatar-img" /></div>` 
        : `<div class="avatar-fallback">${c.emoji}</div>`
      }
      <div>
        <h3>${c.name}</h3>
        <span class="role">${c.role}</span>
        <div class="badge-group">
          <span id="verified-${c.id}" class="badge success hidden">Verified</span>
          <span id="paused-${c.id}" class="badge danger hidden">Paused</span>
        </div>
      </div>
    </div>
    
    <div class="caregiver-meta-grid">
      <div class="meta-item">
        <span class="meta-label">Specialty</span>
        <span class="meta-value">${c.specialization || 'Palliative Care'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Experience</span>
        <span class="meta-value">${c.experience || 'N/A'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Location</span>
        <span class="meta-value">${c.location || 'Remote'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Rating</span>
        <span class="meta-value">⭐ ${c.rating.split(' ')[0] || 'N/A'}</span>
      </div>
    </div>

    <p class="description">${c.description}</p>
    
    <div class="pubkey-wrapper">
      <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; margin-right: 4px;">Stellar:</span>
      <span class="pubkey">${c.publicKey.slice(0, 6)}...${c.publicKey.slice(-6)}</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; width: 100%;">
      <a class="btn btn-accent btn-block" href="wallet.html?care=${encodeURIComponent(c.id)}">
        Select &amp; Send Care Credit
      </a>
      <a class="btn btn-outline btn-block" style="text-align: center;" href="pool.html?care=${encodeURIComponent(c.id)}">
        Contribute to Fund Pool
      </a>
    </div>
  </article>
`
).join("");

// Asynchronously fetch Verified/Paused statuses from CareRegistry contract
async function queryRegistry(caregiverPubKey) {
  try {
    const rpcNamespace = StellarSdk.SorobanRpc || StellarSdk.rpc;
    const rpcServer = new rpcNamespace.Server(RPC_URL);
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
      if (rpcNamespace.Api.isSimulationSuccess(response)) {
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
