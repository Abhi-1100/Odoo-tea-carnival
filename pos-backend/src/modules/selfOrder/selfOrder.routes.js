const express = require('express');
const router = express.Router();
const { generateToken, getSession, getProducts, placeOrder } = require('./selfOrder.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { generateTokenSchema, placeOrderSchema } = require('./selfOrder.validation');

// Auth required
router.post('/generate-token', authenticate, validate(generateTokenSchema), generateToken);

// No auth required (token-based)
router.get('/session/:token', getSession);
router.get('/products/:token', getProducts);
router.post('/place-order/:token', validate(placeOrderSchema), placeOrder);

module.exports = router;
