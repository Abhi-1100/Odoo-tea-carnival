const express = require('express');
const router = express.Router();
const { addItem, updateItem, removeItem } = require('./orderItems.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { addItemSchema, updateItemSchema } = require('./orderItems.validation');

router.use(authenticate);

router.post('/', validate(addItemSchema), addItem);
router.put('/:id', validate(updateItemSchema), updateItem);
router.delete('/:id', removeItem);

module.exports = router;
