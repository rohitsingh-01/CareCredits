/**
 * directory.js — Renders Caregiver Directory on index.html for Level 1.
 */
import { CAREGIVERS } from "./caregivers.js";

const grid = document.getElementById("caregiverGrid");
if (grid) {
  grid.innerHTML = CAREGIVERS.map(
    (c) => `
    <article class="caregiver-card" id="card-${c.id}">
      <div class="caregiver-card-header">
        <div class="avatar-wrapper"><img src="${c.avatar}" alt="${c.name}" class="avatar-img" /></div>
        <div>
          <h3>${c.name}</h3>
          <span class="role">${c.role}</span>
        </div>
      </div>
      
      <div class="caregiver-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Specialty</span>
          <span class="meta-value">${c.specialization || 'Palliative Care'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Location</span>
          <span class="meta-value">${c.location || 'Remote'}</span>
        </div>
      </div>

      <p class="description">${c.description}</p>
      
      <div class="pubkey-wrapper">
        <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; margin-right: 4px;">Stellar Address:</span>
        <span class="pubkey">${c.publicKey.slice(0, 6)}...${c.publicKey.slice(-6)}</span>
      </div>

      <div style="margin-top: 12px; width: 100%;">
        <a class="btn btn-accent btn-block" href="wallet.html?care=${encodeURIComponent(c.id)}">
          Select &amp; Send Care Credit
        </a>
      </div>
    </article>
  `
  ).join("");
}
