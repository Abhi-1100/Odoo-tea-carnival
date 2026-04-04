const express = require('express');
const router = express.Router();
const { getTickets, getTicketById, updateStage, markItemPrepared } = require('./kitchen.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { updateStageSchema } = require('./kitchen.validation');

router.use(authenticate);

router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);
router.put('/tickets/:id/stage', validate(updateStageSchema), updateStage);
router.put('/tickets/:id/items/:itemId/prepared', markItemPrepared);

module.exports = router;
