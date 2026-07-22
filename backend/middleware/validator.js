const ALLOWED_EVENT_TYPES = [
  'wallet_connected',
  'wallet_disconnected',
  'contribution_started',
  'contribution_success',
  'contribution_failed',
  'withdrawal_started',
  'withdrawal_success',
  'withdrawal_failed',
  'rpc_error'
];

const ALLOWED_STATUSES = ['success', 'failed', 'pending'];
const STELLAR_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;

function validateAnalyticsInput(req, res, next) {
  // Set default event_type for /connect route if missing
  if (req.path.includes('/connect') && !req.body.event_type) {
    req.body.event_type = 'wallet_connected';
  }

  const { wallet_address, event_type, status, amount, transaction_hash } = req.body;

  // Validate wallet address
  if (!wallet_address || typeof wallet_address !== 'string' || !STELLAR_ADDRESS_REGEX.test(wallet_address)) {
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

module.exports = {
  validateAnalyticsInput,
  ALLOWED_EVENT_TYPES,
  STELLAR_ADDRESS_REGEX,
};
