const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('./categories.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('./categories.validation');

router.use(authenticate);

router.get('/', getAll);
router.post('/', validate(createCategorySchema), create);
router.put('/:id', validate(updateCategorySchema), update);
router.delete('/:id', remove);

module.exports = router;
