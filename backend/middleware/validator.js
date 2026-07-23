const ALLOWED_EVENT_TYPES = [
  'wallet_connected',
  'wallet_disconnected',
  'contribution_started',
  'contribution_success',
  'contribution_failed',
  'withdrawal_started',
  'withdrawal_success',
  'withdrawal_failed',
  'rpc_error',
  'onboarding_started',
  'step_1_completed',
  'step_2_completed',
  'step_3_completed',
  'wallet_connected_during_onboarding',
  'onboarding_skipped',
  'onboarding_completed',
  'feedback_opened',
  'feedback_skipped',
  'feedback_submitted',
  'feedback_category',
  'feedback_rating',
  'feedback_error'
];

const ALLOWED_FEEDBACK_CATEGORIES = [
  'UI/UX',
  'Wallet',
  'Donation',
  'Caregiver',
  'Performance',
  'Bug Report',
  'Suggestion',
  'Other'
];

const ALLOWED_STATUSES = ['success', 'failed', 'pending'];
const STELLAR_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;
const DUMMY_ANONYMOUS_ADDRESS = 'G0000000000000000000000000000000000000000000000000000000';

function validateAnalyticsInput(req, res, next) {
  // Set default event_type for /connect route if missing
  if (req.path.includes('/connect') && !req.body.event_type) {
    req.body.event_type = 'wallet_connected';
  }

  // If onboarding/feedback event has no wallet_address, populate with anonymous placeholder
  if (req.body.event_type && (req.body.event_type.includes('onboarding') || req.body.event_type.includes('feedback') || req.body.event_type.startsWith('step_')) && !req.body.wallet_address) {
    req.body.wallet_address = DUMMY_ANONYMOUS_ADDRESS;
  }

  const { wallet_address, event_type, status, amount, transaction_hash } = req.body;

  // Validate wallet address
  if (!wallet_address || typeof wallet_address !== 'string' || (!STELLAR_ADDRESS_REGEX.test(wallet_address) && wallet_address !== DUMMY_ANONYMOUS_ADDRESS)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid wallet_address format. Must be a valid 56-character Stellar Ed25519 public key starting with G.',
    });
  }

  // Validate event type
  if (!event_type || typeof event_type !== 'string' || !ALLOWED_EVENT_TYPES.includes(event_type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid event_type. Allowed types: ${ALLOWED_EVENT_TYPES.join(', ')}`,
    });
  }

  // Validate status if provided
  if (status && (typeof status !== 'string' || !ALLOWED_STATUSES.includes(status))) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
    });
  }

  // Validate amount if provided
  if (amount !== undefined && amount !== null) {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Must be a non-negative number.',
      });
    }
  }

  // Validate transaction hash if provided (64 hex characters)
  if (transaction_hash && (typeof transaction_hash !== 'string' || transaction_hash.length > 64)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid transaction_hash length.',
    });
  }

  next();
}

function validateFeedbackInput(req, res, next) {
  const { rating, category, wallet_address, message } = req.body;

  // Validate rating (1-5)
  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({
      success: false,
      error: 'Invalid rating. Must be an integer between 1 and 5.',
    });
  }

  // Validate category
  if (!category || typeof category !== 'string' || !ALLOWED_FEEDBACK_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      error: `Invalid category. Allowed categories: ${ALLOWED_FEEDBACK_CATEGORIES.join(', ')}`,
    });
  }

  // Validate wallet address if provided
  if (wallet_address && (typeof wallet_address !== 'string' || (!STELLAR_ADDRESS_REGEX.test(wallet_address) && wallet_address !== DUMMY_ANONYMOUS_ADDRESS))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid wallet_address format.',
    });
  }

  // Sanitize message if provided
  if (message && typeof message === 'string' && message.length > 2000) {
    req.body.message = message.slice(0, 2000);
  }

  next();
}

module.exports = {
  validateAnalyticsInput,
  validateFeedbackInput,
  ALLOWED_EVENT_TYPES,
  ALLOWED_FEEDBACK_CATEGORIES,
  STELLAR_ADDRESS_REGEX,
};

