const express = require('express');
const { getReviews, submitReview } = require('../controllers/reviewController');
const { reviewLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// GET /api/reviews
router.get('/', getReviews);

// POST /api/reviews (rate limited)
router.post('/', reviewLimiter, submitReview);

module.exports = router;
