const express = require('express');
const router = express.Router();
const { processPayment, getByOrder, getAll, confirmUPI } = require('./payments.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { processPaymentSchema, confirmUPISchema } = require('./payments.validation');

router.use(authenticate);

router.post('/', validate(processPaymentSchema), processPayment);
router.get('/order/:orderId', getByOrder);
router.get('/', getAll);
router.post('/upi/confirm', validate(confirmUPISchema), confirmUPI);

module.exports = router;
