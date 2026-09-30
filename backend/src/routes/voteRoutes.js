const express = require('express');
const rateLimit = require('express-rate-limit');
const voteController = require('../controllers/voteController');

const router = express.Router();

// Prevent abuse of the payment-initialization endpoint
const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many vote attempts. Please wait a moment and try again.' },
});

router.post('/initialize', voteLimiter, voteController.initializeVote);
router.get('/verify/:reference', voteController.verifyVote);

// NOTE: webhook route is mounted separately in server.js with raw body parsing

module.exports = router;
