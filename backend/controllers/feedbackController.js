const feedbackService = require('../services/feedbackService');

async function submitFeedback(req, res, next) {
  try {
    const {
      wallet_address = null,
      rating,
      category,
      message = null,
      page = null,
      browser = null,
      platform = null,
      version = '1.0.0',
      metadata = null,
    } = req.body;

    const result = await feedbackService.recordFeedback({
      wallet_address,
      rating,
      category,
      message,
      page,
      browser,
      platform,
      version,
      metadata,
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: result.record,
    });
  } catch (error) {
    next(error);
  }
}

async function getRecentFeedback(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const records = await feedbackService.getRecentFeedback(limit);
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
  submitFeedback,
  getRecentFeedback,
};
