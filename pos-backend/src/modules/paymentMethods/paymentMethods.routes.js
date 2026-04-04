const express = require('express');
const router = express.Router();
const { getAll, toggle, saveUPI, getQR } = require('./paymentMethods.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { upiSchema } = require('./paymentMethods.validation');

router.use(authenticate);

router.get('/', getAll);
router.put('/:id/toggle', toggle);
router.put('/:id/upi', validate(upiSchema), saveUPI);
router.get('/:id/qr', getQR);

module.exports = router;
