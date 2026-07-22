const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

async function trackConnect(req, res, next) {
  try {
    const { wallet_address, metadata } = req.body;
    const result = await analyticsService.recordInteraction({
      wallet_address,
      event_type: 'wallet_connected',
      status: 'success',
      metadata,
    });
    return res.status(201).json({
      success: true,
      message: 'Wallet connection logged successfully.',
      data: result.record,
    });
  } catch (error) {
    next(error);
  }
}

async function trackContribute(req, res, next) {
  try {
    const { wallet_address, event_type, transaction_hash, status = 'success', amount, metadata } = req.body;

    const event = event_type || (status === 'failed' ? 'contribution_failed' : 'contribution_success');

    const result = await analyticsService.recordInteraction({
      wallet_address,
      event_type: event,
      transaction_hash,
      status,
      amount,
      metadata,
    });

    return res.status(201).json({
      success: true,
      message: 'Contribution event logged successfully.',
      data: result.record,
    });
  } catch (error) {
    next(error);
  }
}

async function trackWithdraw(req, res, next) {
  try {
    const { wallet_address, event_type, transaction_hash, status = 'success', amount, metadata } = req.body;

    const event = event_type || (status === 'failed' ? 'withdrawal_failed' : 'withdrawal_success');

    const result = await analyticsService.recordInteraction({
      wallet_address,
      event_type: event,
      transaction_hash,
      status,
      amount,
      metadata,
    });

    return res.status(201).json({
      success: true,
      message: 'Withdrawal event logged successfully.',
      data: result.record,
    });
  } catch (error) {
    next(error);
  }
}

async function trackError(req, res, next) {
  try {
    const { wallet_address, event_type = 'rpc_error', metadata } = req.body;
    const result = await analyticsService.recordInteraction({
      wallet_address,
      event_type,
      status: 'failed',
      metadata,
    });
    return res.status(201).json({
      success: true,
      message: 'Error event logged successfully.',
      data: result.record,
    });
  } catch (error) {
    next(error);
  }
}

async function getRecentEvents(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const records = await analyticsService.getRecentInteractions(limit);
    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  trackConnect,
  trackContribute,
  trackWithdraw,
  trackError,
  getRecentEvents,
};
