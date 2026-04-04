const express = require('express');
const router = express.Router();
const { getAll, getByFloor, getById, create, update, remove, updateStatus, bulkAction } = require('./tables.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createTableSchema, updateTableSchema, updateStatusSchema, bulkActionSchema } = require('./tables.validation');

router.use(authenticate);

router.get('/', getAll);
router.get('/floor/:floorId', getByFloor);
router.get('/:id', getById);
router.post('/', validate(createTableSchema), create);
router.post('/bulk-action', validate(bulkActionSchema), bulkAction);
router.put('/:id/status', validate(updateStatusSchema), updateStatus);
router.put('/:id', validate(updateTableSchema), update);
router.delete('/:id', remove);

module.exports = router;
