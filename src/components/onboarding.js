/**
 * onboarding.js — User Onboarding System & Finite State Machine for CareCredits.
 * Level 4 (Green Belt) — Milestone 3.
 *
 * Implements a 3-step interactive onboarding modal experience:
 *   Step 1: Welcome to CareCredits & Healthcare Funding Overview
 *   Step 2: Secure Wallet Setup (Freighter Detection & Stellar Testnet Verification)
 *   Step 3: Platform Capability Tour & Final CTA
 *
 * Provides keyboard accessibility (focus trapping, ESC handler), responsive CSS-only animations,
 * state persistence in localStorage ('carecredits_onboarded'), and non-blocking analytics logging.
 */

(function (window) {
  const STORAGE_KEY = 'carecredits_onboarded';

  const STATES = {
    IDLE: 'IDLE',
    STEP_1: 'STEP_1',
    STEP_2: 'STEP_2',
    STEP_3: 'STEP_3',
    COMPLETED: 'COMPLETED',
    SKIPPED: 'SKIPPED',
  };

  let currentState = STATES.IDLE;
  let connectedWalletAddress = null;
  let previousFocusedElement = null;

  function isAlreadyOnboarded() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (_) {
      return false;
    }
  }

  function markOnboarded() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (_) {}
  }

  function injectModalMarkup() {
    if (document.getElementById('onboardingOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'onboardingOverlay';
    overlay.className = 'onboarding-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'onboardingTitle');

    overlay.innerHTML = `
      <div class="onboarding-modal" tabindex="-1">
        <!-- Header -->
        <div class="onboarding-header">
          <div class="onboarding-brand">
            <span>💙</span> CareCredits
          </div>
          <div class="onboarding-progress-dots" aria-label="Onboarding Progress">
            <div id="dot1" class="onboarding-dot active"></div>
            <div id="dot2" class="onboarding-dot"></div>
            <div id="dot3" class="onboarding-dot"></div>
          </div>
          <button id="onboardingCloseBtn" class="onboarding-close-btn" aria-label="Close onboarding tour">✕</button>
        </div>

        <!-- Body -->
        <div class="onboarding-body">
          <!-- Pane 1 -->
          <div id="pane1" class="onboarding-step-pane active">
            <span class="onboarding-step-badge">Step 1 of 3 · Transparent Healthcare</span>
            <h2 id="onboardingTitle" class="onboarding-step-title">Welcome to CareCredits</h2>
            <p class="onboarding-step-desc">
              CareCredits is a decentralized micro-funding platform for medical support powered by the Stellar blockchain. 
              We empower verified caregivers and patients with instant, fee-minimized, transparent funding.
            </p>
            <div class="onboarding-features-list">
              <div class="onboarding-feature-card">
                <div class="onboarding-feature-icon">🔍</div>
                <div class="onboarding-feature-text">
                  <h4>Transparent On-Chain Funding</h4>
                  <p>Every contribution is recorded on the Stellar Testnet ledger for 100% public auditability.</p>
                </div>
              </div>
              <div class="onboarding-feature-card">
                <div class="onboarding-feature-icon">⚡</div>
                <div class="onboarding-feature-text">
                  <h4>Instant 3-Second Settlement</h4>
                  <p>Funds settle near-instantly with sub-cent transaction fees powered by Soroban smart contracts.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pane 2 -->
          <div id="pane2" class="onboarding-step-pane">
            <span class="onboarding-step-badge">Step 2 of 3 · Wallet Setup</span>
            <h2 class="onboarding-step-title">Connect Your Stellar Wallet</h2>
            <p class="onboarding-step-desc">
              To send contributions or manage health pools, connect your Freighter wallet set to the <strong>Stellar Testnet</strong> network.
            </p>

            <div class="onboarding-wallet-card">
              <div id="onboardingWalletIcon" style="font-size: 2.2rem;">👛</div>
              <button id="onboardingConnectWalletBtn" class="btn btn-primary" style="min-width: 200px;">
                Connect Freighter Wallet
              </button>
              <div id="onboardingWalletStatus" class="onboarding-wallet-status hidden"></div>
            </div>
          </div>

          <!-- Pane 3 -->
          <div id="pane3" class="onboarding-step-pane">
            <span class="onboarding-step-badge">Step 3 of 3 · You're All Set</span>
            <h2 class="onboarding-step-title">Explore Platform Features</h2>
            <p class="onboarding-step-desc">
              You are ready to explore verified healthcare campaigns and experience transparent funding in action.
            </p>
            <div class="onboarding-features-list">
              <div class="onboarding-feature-card">
                <div class="onboarding-feature-icon">👩‍⚕️</div>
                <div class="onboarding-feature-text">
                  <h4>Browse Verified Caregivers</h4>
                  <p>View credentialed hospice and community caregivers verified by CareRegistry smart contracts.</p>
                </div>
              </div>
              <div class="onboarding-feature-card">
                <div class="onboarding-feature-icon">📊</div>
                <div class="onboarding-feature-text">
                  <h4>Family Fund Pools</h4>
                  <p>Contribute collectively to targeted health pools and monitor live funding progress bars.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="onboarding-footer">
          <button id="onboardingSkipBtn" class="onboarding-btn-skip">Skip Tour</button>
          <div class="onboarding-actions">
            <button id="onboardingBackBtn" class="btn btn-outline hidden" style="padding: 10px 18px;">Back</button>
            <button id="onboardingNextBtn" class="btn btn-accent onboarding-btn-next">Continue →</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    attachEventListeners();
  }

  function attachEventListeners() {
    const overlay = document.getElementById('onboardingOverlay');
    const closeBtn = document.getElementById('onboardingCloseBtn');
    const skipBtn = document.getElementById('onboardingSkipBtn');
    const nextBtn = document.getElementById('onboardingNextBtn');
    const backBtn = document.getElementById('onboardingBackBtn');
    const connectBtn = document.getElementById('onboardingConnectWalletBtn');

    if (closeBtn) closeBtn.addEventListener('click', skipOnboarding);
    if (skipBtn) skipBtn.addEventListener('click', skipOnboarding);
    if (nextBtn) nextBtn.addEventListener('click', handleNext);
    if (backBtn) backBtn.addEventListener('click', handleBack);
    if (connectBtn) connectBtn.addEventListener('click', connectWalletInModal);

    // Trap keyboard focus and handle ESC
    document.addEventListener('keydown', handleKeyDown);

    // Overlay backdrop click to close
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) skipOnboarding();
      });
    }
  }

  function handleKeyDown(e) {
    const overlay = document.getElementById('onboardingOverlay');
    if (!overlay || !overlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      skipOnboarding();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = overlay.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  }

  function updateUI() {
    const overlay = document.getElementById('onboardingOverlay');
    if (!overlay) return;

    const pane1 = document.getElementById('pane1');
    const pane2 = document.getElementById('pane2');
    const pane3 = document.getElementById('pane3');

    const dot1 = document.getElementById('dot1');
    const dot2 = document.getElementById('dot2');
    const dot3 = document.getElementById('dot3');

    const backBtn = document.getElementById('onboardingBackBtn');
    const nextBtn = document.getElementById('onboardingNextBtn');

    // Panes
    pane1.classList.toggle('active', currentState === STATES.STEP_1);
    pane2.classList.toggle('active', currentState === STATES.STEP_2);
    pane3.classList.toggle('active', currentState === STATES.STEP_3);

    // Dots
    dot1.className = 'onboarding-dot ' + (currentState === STATES.STEP_1 ? 'active' : 'completed');
    dot2.className = 'onboarding-dot ' + (currentState === STATES.STEP_2 ? 'active' : (currentState === STATES.STEP_3 ? 'completed' : ''));
    dot3.className = 'onboarding-dot ' + (currentState === STATES.STEP_3 ? 'active' : '');

    // Buttons
    backBtn.classList.toggle('hidden', currentState === STATES.STEP_1);

    if (currentState === STATES.STEP_3) {
      nextBtn.textContent = 'Enter CareCredits ✨';
      nextBtn.className = 'btn btn-accent onboarding-btn-next';
    } else {
      nextBtn.textContent = 'Continue →';
      nextBtn.className = 'btn btn-primary onboarding-btn-next';
    }

    if (currentState === STATES.IDLE || currentState === STATES.COMPLETED || currentState === STATES.SKIPPED) {
      overlay.classList.remove('active');
      if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
        previousFocusedElement.focus();
      }
    } else {
      overlay.classList.add('active');
      nextBtn.focus();
    }
  }

  async function connectWalletInModal() {
    const statusEl = document.getElementById('onboardingWalletStatus');
    statusEl.classList.remove('hidden', 'success', 'error');
    statusEl.textContent = 'Connecting to Freighter...';

    try {
      if (!window.freighterApi && typeof freighterApi === 'undefined') {
        // Check dynamic freighter window injection
        if (!window.freighter) {
          statusEl.textContent = '⚠️ Freighter wallet extension not detected. Install it from freighter.app then retry.';
          statusEl.classList.add('error');
          return;
        }
      }

      const api = window.freighterApi || (typeof freighterApi !== 'undefined' ? freighterApi : null);

      if (!api) {
        statusEl.textContent = '⚠️ Freighter wallet extension not detected. Install it from freighter.app then retry.';
        statusEl.classList.add('error');
        return;
      }

      await api.requestAccess();
      const { address } = await api.getAddress();
      const { network } = await api.getNetwork();

      if (network !== 'TESTNET') {
        statusEl.textContent = `⚠️ Freighter is on ${network}. Please switch to Stellar TESTNET.`;
        statusEl.classList.add('error');
        return;
      }

      connectedWalletAddress = address;
      statusEl.textContent = `✅ Connected: ${address.slice(0, 6)}...${address.slice(-6)} (Stellar Testnet)`;
      statusEl.classList.add('success');

      if (window.CareAnalytics) {
        window.CareAnalytics.trackOnboardingWalletConnect(address);
      }
    } catch (err) {
      statusEl.textContent = `❌ Connection failed: ${err.message || err}`;
      statusEl.classList.add('error');
    }
  }

  function transitionTo(newState) {
    currentState = newState;
    updateUI();
  }

  function handleNext() {
    if (currentState === STATES.STEP_1) {
      if (window.CareAnalytics) window.CareAnalytics.trackOnboardingStep(1, connectedWalletAddress);
      transitionTo(STATES.STEP_2);
    } else if (currentState === STATES.STEP_2) {
      if (window.CareAnalytics) window.CareAnalytics.trackOnboardingStep(2, connectedWalletAddress);
      transitionTo(STATES.STEP_3);
    } else if (currentState === STATES.STEP_3) {
      if (window.CareAnalytics) {
        window.CareAnalytics.trackOnboardingStep(3, connectedWalletAddress);
        window.CareAnalytics.trackOnboardingComplete(connectedWalletAddress);
      }
      markOnboarded();
      transitionTo(STATES.COMPLETED);
      if (window.CareFeedback) {
        setTimeout(() => window.CareFeedback.open('onboarding_completed'), 400);
      }
    }
  }

  function handleBack() {
    if (currentState === STATES.STEP_2) {
      transitionTo(STATES.STEP_1);
    } else if (currentState === STATES.STEP_3) {
      transitionTo(STATES.STEP_2);
    }
  }

  function skipOnboarding() {
    if (window.CareAnalytics) {
      window.CareAnalytics.trackOnboardingSkip(connectedWalletAddress);
    }
    markOnboarded();
    transitionTo(STATES.SKIPPED);
  }

  function openOnboarding(force = false) {
    if (!force && isAlreadyOnboarded()) {
      return;
    }
    previousFocusedElement = document.activeElement;
    injectModalMarkup();
    if (window.CareAnalytics) {
      window.CareAnalytics.trackOnboardingStart(connectedWalletAddress);
    }
    transitionTo(STATES.STEP_1);
  }

  function resetOnboarding() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    currentState = STATES.IDLE;
    updateUI();
  }

  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      injectModalMarkup();

      // Check for onboarding tour trigger button in header/footer if present
      const triggerBtn = document.getElementById('openOnboardingBtn');
      if (triggerBtn) {
        triggerBtn.addEventListener('click', () => openOnboarding(true));
      }

      if (!isAlreadyOnboarded()) {
        openOnboarding(false);
      }
    });
  }

  // Public API
  const CareOnboarding = {
    init,
    open: (force = true) => openOnboarding(force),
    close: skipOnboarding,
    reset: resetOnboarding,
    getState: () => currentState,
    nextStep: handleNext,
    prevStep: handleBack,
  };

  window.CareOnboarding = CareOnboarding;
  CareOnboarding.init();
})(window);
