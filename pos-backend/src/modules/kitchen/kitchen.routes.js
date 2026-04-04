const express = require('express');
const router = express.Router();
const { getTickets, getTicketById, updateStage, markItemPrepared, getFilters, getStageCounts } = require('./kitchen.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { updateStageSchema, markItemPreparedSchema } = require('./kitchen.validation');

router.use(authenticate);

router.get('/tickets', getTickets);
router.get('/tickets/counts', getStageCounts);
router.get('/filters', getFilters);
router.get('/tickets/:id', getTicketById);
router.put('/tickets/:id/stage', validate(updateStageSchema), updateStage);
router.put('/tickets/:id/items/:itemId/prepared', validate(markItemPreparedSchema), markItemPrepared);

module.exports = router;
