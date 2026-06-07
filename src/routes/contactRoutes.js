const express = require('express');
const { submitContactForm } = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/contact (rate limited)
router.post('/', contactLimiter, submitContactForm);

module.exports = router;
