const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { validateFeedbackInput } = require('../middleware/validator');
const { analyticsRateLimiter } = require('../middleware/rateLimiter');

router.use(analyticsRateLimiter);

router.post('/', validateFeedbackInput, feedbackController.submitFeedback);
router.get('/recent', feedbackController.getRecentFeedback);

module.exports = router;
