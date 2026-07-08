/**
 * directory.js — Renders the Caregiver Directory on index.html from the
 * shared data in caregivers.js, and links each "Select" button to
 * wallet.html?care=<id> so the wallet page can pre-fill the recipient.
 */
import { CAREGIVERS } from "./caregivers.js";

const grid = document.getElementById("caregiverGrid");

grid.innerHTML = CAREGIVERS.map(
  (c) => `
  <article class="caregiver-card">
    <div class="avatar">${c.emoji}</div>
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
