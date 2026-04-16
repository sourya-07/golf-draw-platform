const express = require('express');
const router = express.Router();
const { createCheckout, handleWebhook, getPaymentStatus } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Webhook must NOT have JSON body parser (raw body handled in server.js)
router.post('/webhook', handleWebhook);

router.post('/create-checkout', authMiddleware, createCheckout);
router.get('/status', authMiddleware, getPaymentStatus);

module.exports = router;
