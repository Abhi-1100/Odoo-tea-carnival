const express = require('express');
const router = express.Router();
const {
	processPayment,
	getByOrder,
	getAll,
	confirmUPI,
	createRazorpayOrder,
	verifyRazorpayPayment,
} = require('./payments.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
	processPaymentSchema,
	confirmUPISchema,
	createRazorpayOrderSchema,
	verifyRazorpayPaymentSchema,
} = require('./payments.validation');

router.use(authenticate);

router.post('/', validate(processPaymentSchema), processPayment);
router.get('/order/:orderId', getByOrder);
router.get('/', getAll);
router.post('/upi/confirm', validate(confirmUPISchema), confirmUPI);
router.post('/razorpay/create-order', validate(createRazorpayOrderSchema), createRazorpayOrder);
router.post('/razorpay/verify', validate(verifyRazorpayPaymentSchema), verifyRazorpayPayment);

module.exports = router;
