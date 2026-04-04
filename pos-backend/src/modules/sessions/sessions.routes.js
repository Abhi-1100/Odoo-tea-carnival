const express = require('express');
const router = express.Router();
const { getAll, getActive, getById, open, close } = require('./sessions.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { openSessionSchema, closeSessionSchema } = require('./sessions.validation');

router.use(authenticate);

router.get('/', getAll);
router.get('/active', getActive);
router.get('/:id', getById);
router.post('/open', validate(openSessionSchema), open);
router.put('/:id/close', validate(closeSessionSchema), close);

module.exports = router;
