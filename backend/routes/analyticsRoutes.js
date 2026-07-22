const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { validateAnalyticsInput } = require('../middleware/validator');
const { analyticsRateLimiter } = require('../middleware/rateLimiter');

router.use(analyticsRateLimiter);

router.post('/connect', validateAnalyticsInput, analyticsController.trackConnect);
router.post('/contribute', validateAnalyticsInput, analyticsController.trackContribute);
router.post('/withdraw', validateAnalyticsInput, analyticsController.trackWithdraw);
router.post('/error', validateAnalyticsInput, analyticsController.trackError);
router.get('/recent', analyticsController.getRecentEvents);

module.exports = router;
