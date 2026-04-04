const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { getIO } = require('../../config/socket');

/** GET /api/kitchen/tickets */
const getTickets = async (req, res, next) => {
  try {
    const { stage } = req.query;
    const where = {};
    if (stage) where.stage = stage;

    const tickets = await prisma.kitchenTicket.findMany({
      where,
      include: {
        items: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderType: true,
            notes: true,
            table: { select: { id: true, tableNumber: true } },
          },
        },
      },
      orderBy: { sentAt: 'asc' },
    });

    res.json({ success: true, data: tickets });
  } catch (error) { next(error); }
};

/** GET /api/kitchen/tickets/:id */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await prisma.kitchenTicket.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderType: true,
            notes: true,
            table: { select: { id: true, tableNumber: true } },
            createdByUser: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!ticket) throw new AppError('Kitchen ticket not found', 404);
    res.json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

/** PUT /api/kitchen/tickets/:id/stage */
const updateStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const updateData = { stage };
    if (stage === 'completed') {
      updateData.completedAt = new Date();
    }

    const ticket = await prisma.kitchenTicket.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { items: true },
    });

    // Emit socket event
    try {
      const io = getIO();
      io.of('/kitchen').emit('ticket_stage_updated', {
        ticketId: ticket.id,
        newStage: ticket.stage,
      });
    } catch (e) { /* socket not available */ }

    res.json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

/** PUT /api/kitchen/tickets/:id/items/:itemId/prepared */
const markItemPrepared = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;

    const item = await prisma.kitchenTicketItem.update({
      where: { id: parseInt(itemId) },
      data: { isPrepared: true },
    });

    // Also mark the order item as prepared
    await prisma.orderItem.update({
      where: { id: item.orderItemId },
      data: { isPrepared: true },
    });

    // Emit socket event
    try {
      const io = getIO();
      io.of('/kitchen').emit('item_prepared', {
        ticketId: parseInt(id),
        itemId: parseInt(itemId),
      });
    } catch (e) { /* socket not available */ }

    // Check if all items are prepared → auto-complete ticket
    const allItems = await prisma.kitchenTicketItem.findMany({
      where: { ticketId: parseInt(id) },
    });
    const allPrepared = allItems.every((i) => i.isPrepared);

    if (allPrepared) {
      await prisma.kitchenTicket.update({
        where: { id: parseInt(id) },
        data: { stage: 'completed', completedAt: new Date() },
      });

      try {
        const io = getIO();
        io.of('/kitchen').emit('ticket_stage_updated', {
          ticketId: parseInt(id),
          newStage: 'completed',
        });
      } catch (e) { /* socket not available */ }
    }

    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

module.exports = { getTickets, getTicketById, updateStage, markItemPrepared };
