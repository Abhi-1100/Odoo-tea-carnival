const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('./floors.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createFloorSchema, updateFloorSchema } = require('./floors.validation');

router.use(authenticate);

router.get('/', getAll);
router.post('/', validate(createFloorSchema), create);
router.put('/:id', validate(updateFloorSchema), update);
router.delete('/:id', remove);

module.exports = router;
