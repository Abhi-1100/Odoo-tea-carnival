const express = require('express');
const router = express.Router();
const {
  getAll, getById, create, update, sendToKitchen,
  updateStatus, remove, getByTable,
} = require('./orders.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createOrderSchema, updateOrderSchema, updateStatusSchema } = require('./orders.validation');

router.use(authenticate);

router.get('/', getAll);
router.get('/table/:tableId', getByTable);
router.get('/:id', getById);
router.post('/', validate(createOrderSchema), create);
router.put('/:id/send-kitchen', sendToKitchen);
router.put('/:id/status', validate(updateStatusSchema), updateStatus);
router.put('/:id', validate(updateOrderSchema), update);
router.delete('/:id', remove);

module.exports = router;
