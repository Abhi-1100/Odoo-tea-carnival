const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, getByCategory } = require('./products.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createProductSchema, updateProductSchema } = require('./products.validation');

router.use(authenticate);

router.get('/', getAll);
router.get('/category/:categoryId', getByCategory);
router.get('/:id', getById);
router.post('/', validate(createProductSchema), create);
router.put('/:id', validate(updateProductSchema), update);
router.delete('/:id', remove);

module.exports = router;
