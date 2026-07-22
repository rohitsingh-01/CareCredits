const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { healthRateLimiter } = require('../middleware/rateLimiter');

router.get('/health', healthRateLimiter, healthController.getHealth);

module.exports = router;
