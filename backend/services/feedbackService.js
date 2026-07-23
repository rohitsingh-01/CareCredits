const db = require('../config/db');
const logger = require('../utils/logger');

const fallbackFeedbackStore = [];

async function recordFeedback({
  wallet_address = null,
  rating,
  category,
  message = null,
  page = null,
  browser = null,
  platform = null,
  version = '1.0.0',
  metadata = null,
}) {
  const queryText = `
    INSERT INTO feedback_submissions (
      wallet_address,
      rating,
      category,
      message,
      page,
      browser,
      platform,
      version,
      metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, wallet_address, rating, category, message, page, browser, platform, version, metadata, created_at;
  `;

  const values = [
    wallet_address,
    parseInt(rating, 10),
    category,
    message,
    page,
    browser,
    platform,
    version,
    metadata ? JSON.stringify(metadata) : null,
  ];

  try {
    const result = await db.query(queryText, values);
    logger.info('Feedback recorded in PostgreSQL [ID: %s, Rating: %s, Category: %s]', result.rows[0].id, rating, category);
    return {
      source: 'database',
      record: result.rows[0],
    };
  } catch (error) {
    logger.warn('PostgreSQL database query failed (%s). Storing feedback in fallback storage.', error.message);
    const fallbackRecord = {
      id: fallbackFeedbackStore.length + 1,
      wallet_address,
      rating: parseInt(rating, 10),
      category,
      message,
      page,
      browser,
      platform,
      version,
      metadata,
      created_at: new Date().toISOString(),
    };
    fallbackFeedbackStore.push(fallbackRecord);
    return {
      source: 'fallback_store',
      record: fallbackRecord,
    };
  }
}

async function getRecentFeedback(limit = 50) {
  const queryText = `
    SELECT id, wallet_address, rating, category, message, page, browser, platform, version, metadata, created_at
    FROM feedback_submissions
    ORDER BY created_at DESC
    LIMIT $1;
  `;
  try {
    const result = await db.query(queryText, [limit]);
    return result.rows;
  } catch (error) {
    logger.warn('PostgreSQL query failed (%s). Returning fallback in-memory feedback.', error.message);
    return fallbackFeedbackStore.slice(-limit).reverse();
  }
}

module.exports = {
  recordFeedback,
  getRecentFeedback,
  fallbackFeedbackStore,
};
