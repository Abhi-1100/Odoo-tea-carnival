const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('./customers.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createCustomerSchema, updateCustomerSchema } = require('./customers.validation');

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', validate(createCustomerSchema), create);
router.put('/:id', validate(updateCustomerSchema), update);
router.delete('/:id', remove);

module.exports = router;
