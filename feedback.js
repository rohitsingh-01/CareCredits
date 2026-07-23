/**
 * feedback.js — User Experience Center & Feedback Collection System for CareCredits.
 * Level 4 (Green Belt) — Milestone 4.
 *
 * Implements a 4-step interactive feedback modal experience:
 *   Step 1: 5-Star Experience Rating (⭐⭐⭐⭐⭐)
 *   Step 2: Category Tag Selection (UI/UX, Wallet, Donation, Caregiver, Performance, Bug Report, Suggestion, Other)
 *   Step 3: Multiline Optional Comments & Auto-captured Environment Metadata
 *   Step 4: Animated Thank You Screen
 *
 * Captures environment context (browser, current page path, platform OS, app version, wallet address).
 * Non-blocking API delivery to Express /api/feedback backend with silent fallback.
 */

(function (window) {
  const BACKEND_FEEDBACK_URL = 'http://localhost:5000/api/feedback';

  const STATES = {
    IDLE: 'IDLE',
    STEP_RATING: 'STEP_RATING',
    STEP_CATEGORY: 'STEP_CATEGORY',
    STEP_COMMENT: 'STEP_COMMENT',
    STEP_THANKYOU: 'STEP_THANKYOU',
    SKIPPED: 'SKIPPED',
  };

  const CATEGORIES = [
    'UI/UX',
    'Wallet',
    'Donation',
    'Caregiver',
    'Performance',
    'Bug Report',
    'Suggestion',
    'Other',
  ];

  let currentState = STATES.IDLE;
  let currentRating = 0;
  let currentCategory = '';
  let currentComment = '';
  let triggerSource = 'manual';
  let previousFocusedElement = null;
  let autoCloseTimer = null;

  function getConnectedWallet() {
    if (window.CareWalletState && window.CareWalletState.address) {
      return window.CareWalletState.address;
    }
    try {
      return localStorage.getItem('carecredits_wallet_address') || null;
    } catch (_) {
      return null;
    }
  }

  function getEnvironmentContext() {
    return {
      browser: (navigator && navigator.userAgent) ? navigator.userAgent.slice(0, 250) : 'Unknown Browser',
      page: (window.location && window.location.pathname) ? window.location.pathname : '/',
      platform: (navigator && navigator.platform) ? navigator.platform : 'Unknown OS',
      version: '1.0.0',
    };
  }

  function injectFeedbackModal() {
    if (document.getElementById('feedbackOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'feedbackOverlay';
    overlay.className = 'feedback-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'feedbackModalTitle');

    overlay.innerHTML = `
      <div class="feedback-modal" tabindex="-1">
        <!-- Header -->
        <div class="feedback-header">
          <div class="feedback-brand">
            <span>💬</span> CareCredits Experience Center
          </div>
          <button id="feedbackCloseBtn" class="feedback-close-btn" aria-label="Close feedback dialog">✕</button>
        </div>

        <!-- Body -->
        <div class="feedback-body">
          <!-- Step 1: Star Rating -->
          <div id="feedbackPaneRating" class="feedback-step-pane active">
            <span class="feedback-step-badge">Step 1 of 3 · Your Experience</span>
            <h2 id="feedbackModalTitle" class="feedback-step-title">How would you rate your experience?</h2>
            <p class="feedback-step-desc">Your feedback directly shapes the future of CareCredits healthcare funding.</p>
            
            <div class="feedback-stars-container" role="radiogroup" aria-label="Star rating from 1 to 5">
              <button type="button" class="feedback-star" data-rating="1" aria-label="1 star - Poor">★</button>
              <button type="button" class="feedback-star" data-rating="2" aria-label="2 stars - Fair">★</button>
              <button type="button" class="feedback-star" data-rating="3" aria-label="3 stars - Good">★</button>
              <button type="button" class="feedback-star" data-rating="4" aria-label="4 stars - Very Good">★</button>
              <button type="button" class="feedback-star" data-rating="5" aria-label="5 stars - Excellent">★</button>
            </div>
            <div id="feedbackRatingLabel" class="feedback-rating-label">Select a star rating to proceed</div>
          </div>

          <!-- Step 2: Category Selection -->
          <div id="feedbackPaneCategory" class="feedback-step-pane">
            <span class="feedback-step-badge">Step 2 of 3 · Feedback Category</span>
            <h2 class="feedback-step-title">What topic best fits your feedback?</h2>
            <p class="feedback-step-desc">Select the main area you want to share insights about.</p>
            
            <div class="feedback-categories-grid">
              ${CATEGORIES.map(cat => `
                <button type="button" class="feedback-category-btn" data-category="${cat}">
                  ${getCategoryIcon(cat)} ${cat}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 3: Optional Text Area -->
          <div id="feedbackPaneComment" class="feedback-step-pane">
            <span class="feedback-step-badge">Step 3 of 3 · Detailed Thoughts</span>
            <h2 class="feedback-step-title">Tell us more...</h2>
            <p class="feedback-step-desc">Share any specific suggestions, praise, or issues you encountered. (Optional)</p>
            
            <textarea 
              id="feedbackCommentText" 
              class="feedback-textarea" 
              placeholder="Type your message here... (e.g. 'The pool contribution was quick, but I would like dark mode support.')" 
              rows="4" 
              maxlength="1500"
            ></textarea>
            
            <div class="feedback-comment-footer">
              <span id="feedbackCharCount" class="feedback-char-count">0 / 1500</span>
              <button id="feedbackSubmitBtn" class="btn btn-accent" style="padding: 10px 24px;">Submit Feedback ✨</button>
            </div>
          </div>

          <!-- Step 4: Thank You Screen -->
          <div id="feedbackPaneThankYou" class="feedback-step-pane" style="text-align: center; padding: 20px 0;">
            <div style="font-size: 3.5rem; margin-bottom: 12px; animation: heartPulse 1.2s ease infinite alternate;">❤️</div>
            <h2 class="feedback-step-title">Thank You!</h2>
            <p class="feedback-step-desc" style="font-size: 1.1rem; color: var(--text);">
              Thank you for helping improve CareCredits. Your feedback has been recorded.
            </p>
          </div>
        </div>

        <!-- Footer / Navigation -->
        <div id="feedbackFooterNav" class="feedback-footer">
          <button id="feedbackSkipBtn" class="feedback-btn-skip">Skip</button>
          <button id="feedbackBackBtn" class="btn btn-outline hidden" style="padding: 8px 16px;">Back</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    attachEventListeners();
  }

  function getCategoryIcon(cat) {
    switch (cat) {
      case 'UI/UX': return '🎨';
      case 'Wallet': return '👛';
      case 'Donation': return '💙';
      case 'Caregiver': return '👩‍⚕️';
      case 'Performance': return '⚡';
      case 'Bug Report': return '🐛';
      case 'Suggestion': return '💡';
      default: return '💬';
    }
  }

  function attachEventListeners() {
    const overlay = document.getElementById('feedbackOverlay');
    const closeBtn = document.getElementById('feedbackCloseBtn');
    const skipBtn = document.getElementById('feedbackSkipBtn');
    const backBtn = document.getElementById('feedbackBackBtn');
    const submitBtn = document.getElementById('feedbackSubmitBtn');
    const textarea = document.getElementById('feedbackCommentText');
    const starBtns = document.querySelectorAll('.feedback-star');
    const categoryBtns = document.querySelectorAll('.feedback-category-btn');

    if (closeBtn) closeBtn.addEventListener('click', skipFeedback);
    if (skipBtn) skipBtn.addEventListener('click', skipFeedback);
    if (backBtn) backBtn.addEventListener('click', handleBack);
    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);

    if (textarea) {
      textarea.addEventListener('input', (e) => {
        currentComment = e.target.value;
        const charCount = document.getElementById('feedbackCharCount');
        if (charCount) charCount.textContent = `${currentComment.length} / 1500`;
      });
    }

    starBtns.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.getAttribute('data-rating'), 10);
        selectRating(rating);
      });

      star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.getAttribute('data-rating'), 10);
        highlightStars(rating);
      });
    });

    const starsContainer = document.querySelector('.feedback-stars-container');
    if (starsContainer) {
      starsContainer.addEventListener('mouseleave', () => {
        highlightStars(currentRating);
      });
    }

    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        selectCategory(category);
      });
    });

    document.addEventListener('keydown', handleKeyDown);

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) skipFeedback();
      });
    }
  }

  function handleKeyDown(e) {
    const overlay = document.getElementById('feedbackOverlay');
    if (!overlay || !overlay.classList.contains('active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      skipFeedback();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = overlay.querySelectorAll('button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
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

  function highlightStars(rating) {
    const starBtns = document.querySelectorAll('.feedback-star');
    const labels = ['', '1 Star - Needs Work 😞', '2 Stars - Fair 😐', '3 Stars - Good 🙂', '4 Stars - Very Good 😊', '5 Stars - Outstanding! 🌟'];
    
    starBtns.forEach(star => {
      const r = parseInt(star.getAttribute('data-rating'), 10);
      star.classList.toggle('highlighted', r <= rating);
      star.classList.toggle('selected', r <= currentRating);
    });

    const ratingLabel = document.getElementById('feedbackRatingLabel');
    if (ratingLabel) {
      ratingLabel.textContent = labels[rating] || 'Select a star rating to proceed';
    }
  }

  function selectRating(rating) {
    currentRating = rating;
    highlightStars(rating);
    
    if (window.CareAnalytics) {
      window.CareAnalytics.postEvent('/connect', {
        wallet_address: getConnectedWallet() || 'G0000000000000000000000000000000000000000000000000000000',
        event_type: 'feedback_rating',
        metadata: { rating, triggerSource },
      });
    }

    setTimeout(() => transitionTo(STATES.STEP_CATEGORY), 250);
  }

  function selectCategory(category) {
    currentCategory = category;
    const categoryBtns = document.querySelectorAll('.feedback-category-btn');
    categoryBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-category') === category);
    });

    if (window.CareAnalytics) {
      window.CareAnalytics.postEvent('/connect', {
        wallet_address: getConnectedWallet() || 'G0000000000000000000000000000000000000000000000000000000',
        event_type: 'feedback_category',
        metadata: { category, rating: currentRating, triggerSource },
      });
    }

    setTimeout(() => transitionTo(STATES.STEP_COMMENT), 200);
  }

  function updateUI() {
    const overlay = document.getElementById('feedbackOverlay');
    if (!overlay) return;

    const paneRating = document.getElementById('feedbackPaneRating');
    const paneCategory = document.getElementById('feedbackPaneCategory');
    const paneComment = document.getElementById('feedbackPaneComment');
    const paneThankYou = document.getElementById('feedbackPaneThankYou');
    const footerNav = document.getElementById('feedbackFooterNav');
    const backBtn = document.getElementById('feedbackBackBtn');

    if (paneRating) paneRating.classList.toggle('active', currentState === STATES.STEP_RATING);
    if (paneCategory) paneCategory.classList.toggle('active', currentState === STATES.STEP_CATEGORY);
    if (paneComment) paneComment.classList.toggle('active', currentState === STATES.STEP_COMMENT);
    if (paneThankYou) paneThankYou.classList.toggle('active', currentState === STATES.STEP_THANKYOU);

    if (backBtn) {
      backBtn.classList.toggle('hidden', currentState === STATES.STEP_RATING || currentState === STATES.STEP_THANKYOU);
    }

    if (footerNav) {
      footerNav.style.display = (currentState === STATES.STEP_THANKYOU) ? 'none' : 'flex';
    }

    if (currentState === STATES.IDLE || currentState === STATES.SKIPPED) {
      overlay.classList.remove('active');
      if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
        previousFocusedElement.focus();
      }
    } else {
      overlay.classList.add('active');
      if (currentState === STATES.STEP_COMMENT) {
        const textarea = document.getElementById('feedbackCommentText');
        if (textarea) textarea.focus();
      }
    }
  }

  function transitionTo(newState) {
    currentState = newState;
    updateUI();
  }

  function handleBack() {
    if (currentState === STATES.STEP_CATEGORY) {
      transitionTo(STATES.STEP_RATING);
    } else if (currentState === STATES.STEP_COMMENT) {
      transitionTo(STATES.STEP_CATEGORY);
    }
  }

  async function handleSubmit() {
    const walletAddress = getConnectedWallet();
    const envCtx = getEnvironmentContext();

    const payload = {
      wallet_address: walletAddress,
      rating: currentRating,
      category: currentCategory || 'General',
      message: currentComment ? currentComment.trim() : null,
      page: envCtx.page,
      browser: envCtx.browser,
      platform: envCtx.platform,
      version: envCtx.version,
      metadata: { triggerSource },
    };

    // Non-blocking async fetch with silent catch
    try {
      fetch(BACKEND_FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch (_) {}

    if (window.CareAnalytics) {
      window.CareAnalytics.postEvent('/connect', {
        wallet_address: walletAddress || 'G0000000000000000000000000000000000000000000000000000000',
        event_type: 'feedback_submitted',
        metadata: { rating: currentRating, category: currentCategory, triggerSource },
      });
    }

    transitionTo(STATES.STEP_THANKYOU);

    autoCloseTimer = setTimeout(() => {
      closeFeedback();
    }, 2500);
  }

  function skipFeedback() {
    if (window.CareAnalytics && currentState !== STATES.IDLE) {
      window.CareAnalytics.postEvent('/connect', {
        wallet_address: getConnectedWallet() || 'G0000000000000000000000000000000000000000000000000000000',
        event_type: 'feedback_skipped',
        metadata: { currentState, triggerSource },
      });
    }
    closeFeedback();
    currentState = STATES.SKIPPED;
  }

  function openFeedback(source = 'manual') {
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    triggerSource = source;
    currentRating = 0;
    currentCategory = '';
    currentComment = '';

    const textarea = document.getElementById('feedbackCommentText');
    if (textarea) textarea.value = '';

    previousFocusedElement = document.activeElement;
    injectFeedbackModal();

    if (window.CareAnalytics) {
      window.CareAnalytics.postEvent('/connect', {
        wallet_address: getConnectedWallet() || 'G0000000000000000000000000000000000000000000000000000000',
        event_type: 'feedback_opened',
        metadata: { triggerSource },
      });
    }

    transitionTo(STATES.STEP_RATING);
  }

  function closeFeedback() {
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    currentState = STATES.IDLE;
    updateUI();
  }

  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      injectFeedbackModal();

      // Hook feedback open buttons across pages
      const openBtns = document.querySelectorAll('.open-feedback-btn, #openFeedbackBtn');
      openBtns.forEach(btn => {
        btn.addEventListener('click', () => openFeedback('manual'));
      });
    });
  }

  const CareFeedback = {
    init,
    open: openFeedback,
    close: closeFeedback,
    getState: () => currentState,
    getRating: () => currentRating,
    getCategory: () => currentCategory,
    reset: closeFeedback,
  };

  window.CareFeedback = CareFeedback;
  CareFeedback.init();
})(window);
