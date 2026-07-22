const logger = require('../utils/logger');
const config = require('../config/env');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled server error: %s', err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  const response = {
    success: false,
    error: err.message || 'Internal Server Error',
  };

  if (config.nodeEnv === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
