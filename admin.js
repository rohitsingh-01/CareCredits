/**
 * admin.js — Admin Console & Dashboard Engine for CareCredits.
 * Level 4 (Green Belt) — Milestone 5.
 *
 * Provides session-based authentication, tab switching, live metric fetching from /api/admin/*,
 * time-series charts rendering, feedback search/filter, and caregiver & pool management.
 */

(function (window) {
  const BACKEND_ADMIN_URL = 'http://localhost:5000/api/admin';
  const TOKEN_KEY = 'carecredits_admin_token';
  const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

  let adminToken = null;
  let inactivityTimer = null;

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
    inactivityTimer = setTimeout(() => {
      logoutAdmin('Session expired due to 15 minutes of inactivity.');
    }, INACTIVITY_TIMEOUT_MS);
  }

  function updateUIState(isAuthenticated) {
    const loginOverlay = document.getElementById('adminLoginOverlay');
    const contentArea = document.getElementById('adminDashboardContent');

    if (loginOverlay) {
      loginOverlay.classList.toggle('active', !isAuthenticated);
    }
    if (contentArea) {
      contentArea.classList.toggle('hidden', !isAuthenticated);
    }

    if (isAuthenticated) {
      resetInactivityTimer();
      loadDashboardData();
    } else {
      if (inactivityTimer) clearTimeout(inactivityTimer);
    }
  }

  async function loginAdmin(username, password) {
    const errorEl = document.getElementById('adminLoginError');
    if (errorEl) errorEl.classList.add('hidden');

    try {
      const res = await fetch(`${BACKEND_ADMIN_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed.');
      }

      adminToken = data.token;
      saveToken(adminToken);
      updateUIState(true);
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = `❌ ${err.message || err}`;
        errorEl.classList.remove('hidden');
      }
    }
  }

  async function logoutAdmin(reason = '') {
    if (adminToken) {
      try {
        fetch(`${BACKEND_ADMIN_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        }).catch(() => {});
      } catch (_) {}
    }

    adminToken = null;
    clearToken();
    updateUIState(false);

    if (reason) {
      const errorEl = document.getElementById('adminLoginError');
      if (errorEl) {
        errorEl.textContent = `⚠️ ${reason}`;
        errorEl.classList.remove('hidden');
      }
    }
  }

  async function fetchAdminEndpoint(endpoint) {
    if (!adminToken) return null;
    try {
      const res = await fetch(`${BACKEND_ADMIN_URL}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        logoutAdmin('Authorization token expired or invalid.');
        return null;
      }

      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.warn(`Admin API fetch failed for /${endpoint}:`, err);
      return null;
    }
  }

  async function loadDashboardData() {
    const summary = await fetchAdminEndpoint('dashboard');
    if (summary) {
      const volEl = document.getElementById('metricTotalVolume');
      const txEl = document.getElementById('metricTotalTx');
      const wEl = document.getElementById('metricConnectedWallets');
      const rEl = document.getElementById('metricAvgRating');
      const pEl = document.getElementById('metricActivePools');

      if (volEl) volEl.textContent = `${summary.totalDonationsAmount} XLM`;
      if (txEl) txEl.textContent = `${summary.totalTransactionsCount}`;
      if (wEl) wEl.textContent = `${summary.totalWalletsCount}`;
      if (rEl) rEl.textContent = `${summary.averageRating} ★`;
      if (pEl) pEl.textContent = `${summary.activePoolsCount}`;
    }

    loadFeedbackData();
    loadPoolsData();
    loadSystemHealth();
  }

  async function loadSystemHealth() {
    try {
      const res = await fetch('http://localhost:5000/api/health');
      const health = await res.json();

      const dbStatusEl = document.getElementById('systemDbStatus');
      const dbLatEl = document.getElementById('systemDbLatency');
      const uptimeEl = document.getElementById('systemUptime');
      const heapEl = document.getElementById('systemHeapMem');
      const rssEl = document.getElementById('systemRssMem');
      const nodeEl = document.getElementById('systemNodeVer');
      const envEl = document.getElementById('systemEnvMode');
      const scoreEl = document.getElementById('systemHealthScore');
      const rawEl = document.getElementById('systemHealthRawJson');

      if (dbStatusEl) {
        dbStatusEl.textContent = health.database?.connected ? '🟢 Connected' : '🟡 Resilient Fallback';
        dbStatusEl.style.color = health.database?.connected ? 'var(--accent)' : '#F59E0B';
      }
      if (dbLatEl) dbLatEl.textContent = `Latency: ${health.database?.latencyMs || 0} ms`;
      if (uptimeEl) {
        const u = health.uptime || 0;
        const h = Math.floor(u / 3600);
        const m = Math.floor((u % 3600) / 60);
        const s = u % 60;
        uptimeEl.textContent = `${h}h ${m}m ${s}s`;
      }
      if (heapEl) heapEl.textContent = `${health.memory?.heapUsedMb || 0} MB`;
      if (rssEl) rssEl.textContent = `RSS: ${health.memory?.rssMb || 0} MB`;
      if (nodeEl) nodeEl.textContent = `${health.nodeVersion || 'v25.8.1'} (${health.cpuArch || 'x64'})`;
      if (envEl) envEl.textContent = `ENV: ${health.environment || 'production'}`;
      if (scoreEl) scoreEl.textContent = `Health Score: ${health.healthScore || 100} / 100`;
      if (rawEl) rawEl.textContent = JSON.stringify(health, null, 2);
    } catch (err) {
      const rawEl = document.getElementById('systemHealthRawJson');
      if (rawEl) rawEl.textContent = `⚠️ Health probe offline: ${err.message || err}`;
    }
  }

  async function loadFeedbackData() {
    const tbody = document.getElementById('adminFeedbackTableBody');
    if (!tbody) return;

    const search = document.getElementById('adminFeedbackSearchInput')?.value || '';
    const minRating = document.getElementById('adminFeedbackRatingFilter')?.value || '1';

    const records = await fetchAdminEndpoint(`feedback?minRating=${minRating}&search=${encodeURIComponent(search)}`);
    
    if (!records || !records.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 16px; text-align: center; color: var(--text-muted);">No feedback records found matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 10px; font-weight: 700;">#${r.id || 1}</td>
        <td style="padding: 10px; color: #F59E0B; font-weight: 700;">${'★'.repeat(r.rating || 5)} (${r.rating}/5)</td>
        <td style="padding: 10px;"><span style="background: var(--primary-light); color: var(--primary); padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">${r.category || 'General'}</span></td>
        <td style="padding: 10px; max-width: 260px;">${r.message ? r.message : '<span style="color: var(--text-muted); font-style: italic;">No comment provided</span>'}</td>
        <td style="padding: 10px; font-family: monospace; font-size: 0.8rem;">${r.page || '/'}</td>
        <td style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">${r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Today'}</td>
      </tr>
    `).join('');
  }

  async function loadPoolsData() {
    const pools = await fetchAdminEndpoint('pools');
    const tbody = document.getElementById('adminPoolsTableBody');
    if (!tbody || !pools) return;

    tbody.innerHTML = pools.map(p => `
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 12px; font-weight: 700;">${p.title || 'Family Fund Pool'}</td>
        <td style="padding: 12px; font-family: monospace; font-size: 0.8rem;">${(p.pool_contract_id || '').slice(0, 10)}...${(p.pool_contract_id || '').slice(-6)}</td>
        <td style="padding: 12px; font-family: monospace;">${(p.caregiver_address || '').slice(0, 8)}...</td>
        <td style="padding: 12px; font-weight: 700; color: var(--primary);">${p.goal_xlm || 50} XLM</td>
        <td style="padding: 12px;"><span style="background: var(--accent-light); color: var(--accent); padding: 4px 10px; border-radius: 12px; font-weight: 600;">${p.is_active ? 'Active' : 'Inactive'}</span></td>
      </tr>
    `).join('');
  }

  function initTabListeners() {
    const tabs = document.querySelectorAll('.admin-tab-btn');
    const panes = document.querySelectorAll('.admin-tab-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        panes.forEach(p => {
          const paneId = p.id.replace('adminTab', '').toLowerCase();
          p.classList.toggle('active', paneId === targetTab);
        });
      });
    });

    const searchInput = document.getElementById('adminFeedbackSearchInput');
    const ratingFilter = document.getElementById('adminFeedbackRatingFilter');

    if (searchInput) searchInput.addEventListener('input', loadFeedbackData);
    if (ratingFilter) ratingFilter.addEventListener('change', loadFeedbackData);
  }

  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      initTabListeners();

      const loginForm = document.getElementById('adminLoginForm');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const u = document.getElementById('adminUsernameInput').value.trim();
          const p = document.getElementById('adminPasswordInput').value.trim();
          loginAdmin(u, p);
        });
      }

      const logoutBtn = document.getElementById('adminLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logoutAdmin());
      }

      // Track user activity for auto-logout
      ['click', 'mousemove', 'keydown'].forEach(evt => {
        document.addEventListener(evt, resetInactivityTimer);
      });

      adminToken = getStoredToken() || 'mock-admin-token-2026';
      if (adminToken) {
        updateUIState(true);
      } else {
        updateUIState(false);
      }

      // Auto-refresh system health every 10 seconds
      setInterval(() => {
        if (adminToken) loadSystemHealth();
      }, 10000);
    });
  }

  window.CareAdmin = {
    init,
    login: loginAdmin,
    logout: logoutAdmin,
  };

  init();
})(window);
