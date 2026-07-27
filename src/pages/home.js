import { CAREGIVERS } from "../data/caregivers.js";
import { initPageChrome, renderShell } from "../components/layout.js";
import { linkTo } from "../router.js";

function caregiverCard(caregiver) {
  return `
    <article class="caregiver-card" id="card-${caregiver.id}">
      <div class="caregiver-card-header">
        ${
          caregiver.avatar
            ? `<div class="avatar-wrapper"><img src="${caregiver.avatar}" alt="${caregiver.name}" class="avatar-img" /></div>`
            : `<div class="avatar-fallback">${caregiver.emoji || "CC"}</div>`
        }
        <div>
          <h3>${caregiver.name}</h3>
          <span class="role">${caregiver.role}</span>
          <div class="badge-group">
            <span class="badge success">Testnet Ready</span>
          </div>
        </div>
      </div>
      <div class="caregiver-meta-grid">
        <div class="meta-item"><span class="meta-label">Specialty</span><span class="meta-value">${caregiver.specialization}</span></div>
        <div class="meta-item"><span class="meta-label">Experience</span><span class="meta-value">${caregiver.experience}</span></div>
        <div class="meta-item"><span class="meta-label">Location</span><span class="meta-value">${caregiver.location}</span></div>
        <div class="meta-item"><span class="meta-label">Rating</span><span class="meta-value">${caregiver.rating}</span></div>
      </div>
      <p class="description">${caregiver.description}</p>
      <div class="pubkey-wrapper">
        <span class="pubkey">${caregiver.publicKey.slice(0, 6)}...${caregiver.publicKey.slice(-6)}</span>
      </div>
      <div class="card-actions">
        <a class="btn btn-accent btn-block" ${linkTo(`/wallet?care=${encodeURIComponent(caregiver.id)}`)}>Select and Send Care Credit</a>
        <a class="btn btn-outline btn-block" ${linkTo(`/pool?care=${encodeURIComponent(caregiver.id)}`)}>Contribute to Fund Pool</a>
      </div>
    </article>
  `;
}

export function renderHomePage(root) {
  root.innerHTML = renderShell(
    "home",
    `
      <header class="hero">
        <div class="container">
          <div class="hero-grid">
            <div class="hero-content">
              <span class="eyebrow">Stellar Testnet Compliance Platform</span>
              <h1>Send care credits directly to the people doing the caring.</h1>
              <p class="lede">
                CareCredits is a single root Vite dApp for transparent Stellar Testnet wallet payments,
                caregiver funding pools, and verifiable healthcare support.
              </p>
              <div class="hero-actions">
                <a class="btn btn-primary" ${linkTo("/wallet")}>Open Wallet</a>
                <a href="#directory" class="btn btn-outline">Browse Caregivers</a>
              </div>
            </div>
            <div class="hero-visual">
              <div class="visual-center-circle"></div>
              <div class="floating-mock floating-mock-1">
                <div class="icon-wrapper">XLM</div>
                <div class="details"><span class="title-text">Wallet Connected</span><span class="subtitle-text">Freighter Testnet</span></div>
              </div>
              <div class="floating-mock floating-mock-2">
                <div class="icon-wrapper">OK</div>
                <div class="details"><span class="title-text">Balance Loaded</span><span class="subtitle-text">Horizon API</span></div>
              </div>
              <div class="floating-mock floating-mock-3">
                <div class="icon-wrapper">TX</div>
                <div class="details"><span class="title-text">Payment Sent</span><span class="subtitle-text">Hash displayed</span></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section class="how-it-works">
        <div class="container">
          <h2>How CareCredits Works</h2>
          <div class="steps">
            <div class="step-card"><div class="step-num">1</div><h3>Connect Wallet</h3><p>Link Freighter on Stellar Testnet from the Vite wallet route.</p></div>
            <div class="step-card"><div class="step-num">2</div><h3>Select Caregiver</h3><p>Choose a verified caregiver and prefill their public key.</p></div>
            <div class="step-card"><div class="step-num">3</div><h3>Fund On-Chain</h3><p>Sign and submit an XLM transaction with visible confirmation.</p></div>
          </div>
        </div>
      </section>
      <section class="section" id="directory">
        <div class="container">
          <div class="section-header">
            <h2>Caregiver Directory</h2>
            <p>Choose a caregiver to send direct care credits or contribute to a family funding pool.</p>
          </div>
          <div id="caregiverGrid" class="caregiver-grid">
            ${CAREGIVERS.map(caregiverCard).join("")}
          </div>
        </div>
      </section>
    `,
  );
  return initPageChrome();
}
