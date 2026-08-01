import { initPageChrome, renderShell } from "../components/layout.js";

const BACKEND_ADMIN_URL = "/api/admin";
const TOKEN_KEY = "carecredits_admin_token";
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

let adminToken = null;
let inactivityTimer = null;
let healthInterval = null;

const $ = (id) => document.getElementById(id);

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (_) {
    return null;
  }
}

function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (_) {}
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => logoutAdmin("Session expired due to 15 minutes of inactivity."), INACTIVITY_TIMEOUT_MS);
}

function updateUIState(isAuthenticated) {
  $("adminLoginOverlay").classList.toggle("active", !isAuthenticated);
  $("adminDashboardContent").classList.toggle("hidden", !isAuthenticated);
  if (isAuthenticated) {
    resetInactivityTimer();
    loadDashboardData();
  } else if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
}

async function loginAdmin(username, password) {
  $("adminLoginError").classList.add("hidden");
  try {
    const response = await fetch(`${BACKEND_ADMIN_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Login failed.");
    adminToken = data.token;
    saveToken(adminToken);
    updateUIState(true);
  } catch (error) {
    $("adminLoginError").textContent = error.message || String(error);
    $("adminLoginError").classList.remove("hidden");
  }
}

async function logoutAdmin(reason = "") {
  if (adminToken) {
    fetch(`${BACKEND_ADMIN_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    }).catch(() => {});
  }
  adminToken = null;
  clearToken();
  updateUIState(false);
  if (reason) {
    $("adminLoginError").textContent = reason;
    $("adminLoginError").classList.remove("hidden");
  }
}

async function fetchAdminEndpoint(endpoint) {
  if (!adminToken) return null;
  try {
    const response = await fetch(`${BACKEND_ADMIN_URL}/${endpoint}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (response.status === 401 || response.status === 403) {
      logoutAdmin("Authorization token expired or invalid.");
      return null;
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.warn(`Admin API fetch failed for /${endpoint}:`, error);
    return null;
  }
}

async function loadDashboardData() {
  const summary = await fetchAdminEndpoint("dashboard");
  if (summary) {
    $("metricTotalVolume").textContent = `${summary.totalDonationsAmount} XLM`;
    $("metricTotalTx").textContent = `${summary.totalTransactionsCount}`;
    $("metricConnectedWallets").textContent = `${summary.totalWalletsCount}`;
    $("metricAvgRating").textContent = `${summary.averageRating} stars`;
    $("metricActivePools").textContent = `${summary.activePoolsCount}`;
  }
  loadFeedbackData();
  loadPoolsData();
  loadSystemHealth();
}

async function loadSystemHealth() {
  try {
    const response = await fetch("/api/health");
    const health = await response.json();
    $("systemDbStatus").textContent = health.database?.connected ? "Connected" : "Fallback";
    $("systemDbLatency").textContent = `Latency: ${health.database?.latencyMs || 0} ms`;
    $("systemHealthScore").textContent = `Health Score: ${health.healthScore || 100} / 100`;
    $("systemHealthRawJson").textContent = JSON.stringify(health, null, 2);
  } catch (error) {
    $("systemHealthRawJson").textContent = `Health probe offline: ${error.message || error}`;
  }
}

async function loadFeedbackData() {
  const search = $("adminFeedbackSearchInput").value || "";
  const minRating = $("adminFeedbackRatingFilter").value || "1";
  const records = await fetchAdminEndpoint(`feedback?minRating=${minRating}&search=${encodeURIComponent(search)}`);
  const tbody = $("adminFeedbackTableBody");
  if (!records?.length) {
    tbody.innerHTML = `<tr><td colspan="6">No feedback records found.</td></tr>`;
    return;
  }
  tbody.innerHTML = records
    .map(
      (record) => `
        <tr>
          <td>#${record.id || 1}</td>
          <td>${record.rating || 5}/5</td>
          <td>${record.category || "General"}</td>
          <td>${record.message || "No comment provided"}</td>
          <td>${record.page || "/"}</td>
          <td>${record.created_at ? new Date(record.created_at).toLocaleDateString() : "Today"}</td>
        </tr>
      `,
    )
    .join("");
}

async function loadPoolsData() {
  const pools = await fetchAdminEndpoint("pools");
  const tbody = $("adminPoolsTableBody");
  if (!pools?.length) return;
  tbody.innerHTML = pools
    .map(
      (pool) => `
        <tr>
          <td>${pool.title || "Family Fund Pool"}</td>
          <td>${(pool.pool_contract_id || "").slice(0, 10)}...${(pool.pool_contract_id || "").slice(-6)}</td>
          <td>${(pool.caregiver_address || "").slice(0, 8)}...</td>
          <td>${pool.goal_xlm || 50} XLM</td>
          <td>${pool.is_active ? "Active" : "Inactive"}</td>
        </tr>
      `,
    )
    .join("");
}

function initTabs() {
  const tabs = document.querySelectorAll(".admin-tab-btn");
  const panes = document.querySelectorAll(".admin-tab-pane");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");
      tabs.forEach((item) => item.classList.toggle("active", item === tab));
      panes.forEach((pane) => {
        const paneId = pane.id.replace("adminTab", "").toLowerCase();
        pane.classList.toggle("active", paneId === targetTab);
      });
    });
  });
}

export function renderAdminPage(root) {
  root.innerHTML = renderShell(
    "admin",
    `
      <div id="adminLoginOverlay" class="onboarding-overlay active">
        <div class="onboarding-modal admin-login-modal">
          <div class="onboarding-header"><div class="onboarding-brand">Admin Authentication</div></div>
          <div class="onboarding-body">
            <h2 class="onboarding-step-title">CareCredits Admin Access</h2>
            <p class="onboarding-step-desc">Enter operational credentials to manage platform analytics, feedback, and funding pools.</p>
            <form id="adminLoginForm">
              <label>Username<input id="adminUsernameInput" type="text" class="feedback-textarea" value="admin" required /></label>
              <label>Password<input id="adminPasswordInput" type="password" class="feedback-textarea" value="carecredits2026" required /></label>
              <button type="submit" id="adminLoginBtn" class="btn btn-primary btn-block">Login to Admin Console</button>
              <p id="adminLoginError" class="status error hidden"></p>
            </form>
          </div>
        </div>
      </div>
      <main id="adminDashboardContent" class="container section hidden">
        <header class="admin-header"><div><h1>Operational Administrator Console</h1><p class="hint">Stellar Testnet operational visibility and multi-pool management.</p></div><button id="adminLogoutBtn" class="btn btn-outline">Logout</button></header>
        <div class="admin-tabs">
          <button class="admin-tab-btn active" data-tab="overview">Overview</button>
          <button class="admin-tab-btn" data-tab="feedback">Feedback</button>
          <button class="admin-tab-btn" data-tab="pools">Funding Pools</button>
          <button class="admin-tab-btn" data-tab="system">System</button>
        </div>
        <section id="adminTabOverview" class="admin-tab-pane active">
          <div class="caregiver-meta-grid admin-metrics">
            <div class="meta-item-card"><span>Total XLM Volume</span><strong id="metricTotalVolume">142.5 XLM</strong></div>
            <div class="meta-item-card"><span>Total Transactions</span><strong id="metricTotalTx">24</strong></div>
            <div class="meta-item-card"><span>Connected Wallets</span><strong id="metricConnectedWallets">12</strong></div>
            <div class="meta-item-card"><span>Average Feedback Rating</span><strong id="metricAvgRating">4.8 stars</strong></div>
            <div class="meta-item-card"><span>Active Pools</span><strong id="metricActivePools">3</strong></div>
          </div>
        </section>
        <section id="adminTabFeedback" class="admin-tab-pane">
          <div class="card wide">
            <div class="admin-filter-row"><input id="adminFeedbackSearchInput" type="text" class="feedback-textarea" placeholder="Search feedback..." /><select id="adminFeedbackRatingFilter" class="feedback-textarea"><option value="1">All Ratings</option><option value="4">4+ Stars</option><option value="5">5 Stars</option></select></div>
            <table class="admin-table"><tbody id="adminFeedbackTableBody"><tr><td>Loading feedback entries...</td></tr></tbody></table>
          </div>
        </section>
        <section id="adminTabPools" class="admin-tab-pane">
          <div class="card wide"><table class="admin-table"><tbody id="adminPoolsTableBody"><tr><td>Primary Family Support Pool</td><td>${"CDSBFPVCUE6V7HAEMUYY5RSOXV34TIC5EKJZMBEG3J3XKXIERA2EV6CN"}</td><td>50 XLM</td><td>Active</td></tr></tbody></table></div>
        </section>
        <section id="adminTabSystem" class="admin-tab-pane">
          <div class="card wide">
            <div class="caregiver-meta-grid">
              <div class="meta-item-card"><span>PostgreSQL Connection</span><strong id="systemDbStatus">Checking</strong><small id="systemDbLatency">Latency: 0 ms</small></div>
              <div class="meta-item-card"><span id="systemHealthScore">Health Score: 100 / 100</span></div>
            </div>
            <pre id="systemHealthRawJson" class="system-health-json">Fetching system health stream...</pre>
          </div>
        </section>
      </main>
    `,
    { admin: true },
  );

  const cleanupChrome = initPageChrome();
  initTabs();
  $("adminLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    loginAdmin($("adminUsernameInput").value.trim(), $("adminPasswordInput").value.trim());
  });
  $("adminLogoutBtn").addEventListener("click", () => logoutAdmin());
  $("adminFeedbackSearchInput").addEventListener("input", loadFeedbackData);
  $("adminFeedbackRatingFilter").addEventListener("change", loadFeedbackData);
  ["click", "mousemove", "keydown"].forEach((eventName) => document.addEventListener(eventName, resetInactivityTimer));

  adminToken = getStoredToken() || "mock-admin-token-2026";
  updateUIState(Boolean(adminToken));
  healthInterval = setInterval(() => {
    if (adminToken) loadSystemHealth();
  }, 10000);

  return () => {
    cleanupChrome();
    if (healthInterval) clearInterval(healthInterval);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    ["click", "mousemove", "keydown"].forEach((eventName) => document.removeEventListener(eventName, resetInactivityTimer));
  };
}
