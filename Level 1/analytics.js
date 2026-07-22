/**
 * analytics.js — Non-blocking analytics & tracking client for CareCredits (Level 1).
 */

(function (window) {
  const DEFAULT_BACKEND_URL = window.CARE_ANALYTICS_URL || 'http://localhost:5000/api/analytics';

  async function postEvent(endpoint, payload) {
    try {
      const url = `${DEFAULT_BACKEND_URL}${endpoint}`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch (_) {}
  }

  const CareAnalytics = {
    trackConnect: function (walletAddress, metadata = {}) {
      if (!walletAddress) return;
      postEvent('/connect', {
        wallet_address: walletAddress,
        event_type: 'wallet_connected',
        metadata,
      });
    },

    trackDisconnect: function (walletAddress, metadata = {}) {
      if (!walletAddress) return;
      postEvent('/connect', {
        wallet_address: walletAddress,
        event_type: 'wallet_disconnected',
        metadata,
      });
    },

    trackContributeStart: function (walletAddress, amount, metadata = {}) {
      if (!walletAddress) return;
      postEvent('/contribute', {
        wallet_address: walletAddress,
        event_type: 'contribution_started',
        status: 'pending',
        amount: parseFloat(amount) || 0,
        metadata,
      });
    },

    trackContributeSuccess: function (walletAddress, amount, txHash, metadata = {}) {
      if (!walletAddress) return;
      postEvent('/contribute', {
        wallet_address: walletAddress,
        event_type: 'contribution_success',
        status: 'success',
        amount: parseFloat(amount) || 0,
        transaction_hash: txHash || null,
        metadata,
      });
    },

    trackContributeFailed: function (walletAddress, amount, errorDetails = {}, metadata = {}) {
      if (!walletAddress) return;
      postEvent('/contribute', {
        wallet_address: walletAddress,
        event_type: 'contribution_failed',
        status: 'failed',
        amount: parseFloat(amount) || 0,
        metadata: { ...metadata, error: errorDetails },
      });
    },

    trackWithdrawStart: function (walletAddress, amount = 0, metadata = {}) {
      if (!walletAddress) return;
      postEvent('/withdraw', {
        wallet_address: walletAddress,
        event_type: 'withdrawal_started',
        status: 'pending',
        amount: parseFloat(amount) || 0,
        metadata,
      });
    },

    trackWithdrawSuccess: function (walletAddress, amount, txHash, metadata = {}) {
      if (!walletAddress) return;
      postEvent('/withdraw', {
        wallet_address: walletAddress,
        event_type: 'withdrawal_success',
        status: 'success',
        amount: parseFloat(amount) || 0,
        transaction_hash: txHash || null,
        metadata,
      });
    },

    trackWithdrawFailed: function (walletAddress, amount = 0, errorDetails = {}, metadata = {}) {
      if (!walletAddress) return;
      postEvent('/withdraw', {
        wallet_address: walletAddress,
        event_type: 'withdrawal_failed',
        status: 'failed',
        amount: parseFloat(amount) || 0,
        metadata: { ...metadata, error: errorDetails },
      });
    },

    trackError: function (walletAddress, errorType = 'rpc_error', errorDetails = {}) {
      if (!walletAddress) return;
      postEvent('/error', {
        wallet_address: walletAddress,
        event_type: 'rpc_error',
        metadata: { errorType, errorDetails },
      });
    },
  };

  window.CareAnalytics = CareAnalytics;
})(window);
