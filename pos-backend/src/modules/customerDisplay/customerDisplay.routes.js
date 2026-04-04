const express = require('express');
const router = express.Router();
const { getOrder, getPaymentStatus } = require('./customerDisplay.controller');

// No authentication required for customer display
router.get('/order/:orderId', getOrder);
router.get('/payment-status/:orderId', getPaymentStatus);

module.exports = router;
