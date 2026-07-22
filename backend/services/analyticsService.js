const db = require('../config/db');
const logger = require('../utils/logger');

// In-memory fallback queue for local testing when PostgreSQL database is unavailable
const fallbackInMemoryStore = [];

async function recordInteraction({
  wallet_address,
  event_type,
  transaction_hash = null,
  status = 'success',
  amount = null,
  metadata = null,
}) {
  const queryText = `
    INSERT INTO wallet_interactions (
      wallet_address,
      event_type,
      transaction_hash,
      status,
      amount,
      metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, wallet_address, event_type, transaction_hash, status, amount, metadata, created_at;
  `;

  const values = [
    wallet_address,
    event_type,
    transaction_hash,
    status,
    amount ? parseFloat(amount) : null,
    metadata ? JSON.stringify(metadata) : null,
  ];

  try {
    const result = await db.query(queryText, values);
    logger.info('Interaction recorded in PostgreSQL [ID: %s, Event: %s, Address: %s]', result.rows[0].id, event_type, wallet_address);
    return {
      source: 'database',
      record: result.rows[0],
    };
  } catch (error) {
    logger.warn('PostgreSQL database query failed (%s). Storing event in fallback storage.', error.message);
    const fallbackRecord = {
      id: fallbackInMemoryStore.length + 1,
      wallet_address,
      event_type,
      transaction_hash,
      status,
      amount,
      metadata,
      created_at: new Date().toISOString(),
    };
    fallbackInMemoryStore.push(fallbackRecord);
    return {
      source: 'fallback_store',
      record: fallbackRecord,
    };
  }
}

async function getRecentInteractions(limit = 50) {
  const queryText = `
    SELECT id, wallet_address, event_type, transaction_hash, status, amount, metadata, created_at
    FROM wallet_interactions
    ORDER BY created_at DESC
    LIMIT $1;
  `;
  try {
    const result = await db.query(queryText, [limit]);
    return result.rows;
  } catch (error) {
    logger.warn('PostgreSQL database query failed (%s). Returning fallback in-memory records.', error.message);
    return fallbackInMemoryStore.slice(-limit).reverse();
  }
}

module.exports = {
  recordInteraction,
  getRecentInteractions,
  fallbackInMemoryStore,
};
