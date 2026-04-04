const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { getIO } = require('../../config/socket');

const ACTIVE_STAGES = ['to_cook', 'preparing'];

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeStage = (stage) => {
  if (!stage || stage === 'all') return undefined;
  return stage;
};

const mapTicket = (ticket) => ({
  id: ticket.id,
  ticketNumber: ticket.ticketNumber,
  orderId: ticket.orderId,
  stage: ticket.stage,
  sentAt: ticket.sentAt,
  completedAt: ticket.completedAt,
  items: ticket.items.map((item) => ({
    id: item.id,
    productName: item.productName,
    categoryName: item.categoryName,
    quantity: item.quantity,
    isPrepared: item.isPrepared,
    notes: item.notes || '',
  })),
});

const buildWhere = ({ stage, product, category, search }) => {
  const where = {};
  const normalizedStage = normalizeStage(stage);

  if (normalizedStage) where.stage = normalizedStage;

  if (product || category || search) {
    where.AND = [];

    if (product) {
      where.AND.push({
        items: {
          some: { productName: { equals: product, mode: 'insensitive' } },
        },
      });
    }

    if (category) {
      where.AND.push({
        items: {
          some: { categoryName: { equals: category, mode: 'insensitive' } },
        },
      });
    }

    if (search) {
      where.AND.push({
        OR: [
          { ticketNumber: { contains: search, mode: 'insensitive' } },
          {
            items: {
              some: { productName: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      });
    }
  }

  return where;
};

const getCounts = async () => {
  const [all, toCook, preparing, completed] = await Promise.all([
    prisma.kitchenTicket.count(),
    prisma.kitchenTicket.count({ where: { stage: 'to_cook' } }),
    prisma.kitchenTicket.count({ where: { stage: 'preparing' } }),
    prisma.kitchenTicket.count({ where: { stage: 'completed' } }),
  ]);

  return { all, to_cook: toCook, preparing, completed };
};

const emitStageUpdated = async (ticketId, newStage) => {
  try {
    const io = getIO();
    io.of('/kitchen').emit('ticket_stage_updated', {
      ticketId,
      newStage,
      stageCounts: await getCounts(),
    });
  } catch (_) {
    // Socket may be unavailable in tests.
  }
};

/** GET /api/kitchen/tickets */
const getTickets = async (req, res, next) => {
  try {
    const { stage = 'all', product, category, search } = req.query;
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math.max(1, Math.min(50, toInt(req.query.limit, 8)));
    const where = buildWhere({ stage, product, category, search });

    const [total, tickets, stageCounts] = await Promise.all([
      prisma.kitchenTicket.count({ where }),
      prisma.kitchenTicket.findMany({
        where,
        include: { items: true },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      getCounts(),
    ]);

    res.json({
      success: true,
      data: {
        tickets: tickets.map(mapTicket),
        stageCounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/kitchen/filters */
const getFilters = async (req, res, next) => {
  try {
    const items = await prisma.kitchenTicketItem.findMany({
      where: {
        ticket: {
          stage: { in: ACTIVE_STAGES },
        },
      },
      select: {
        productName: true,
        categoryName: true,
      },
    });

    const products = [...new Set(items.map((item) => item.productName).filter(Boolean))].sort();
    const categories = [...new Set(items.map((item) => item.categoryName).filter(Boolean))].sort();

    res.json({ success: true, data: { products, categories } });
  } catch (error) {
    next(error);
  }
};

/** GET /api/kitchen/tickets/counts */
const getStageCounts = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getCounts() });
  } catch (error) {
    next(error);
  }
};

/** GET /api/kitchen/tickets/:id */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await prisma.kitchenTicket.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { items: true },
    });

    if (!ticket) throw new AppError('Kitchen ticket not found', 404);
    res.json({ success: true, data: mapTicket(ticket) });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/kitchen/tickets/:id/stage */
const updateStage = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { stage } = req.body;

    const existing = await prisma.kitchenTicket.findUnique({ where: { id: ticketId } });
    if (!existing) throw new AppError('Kitchen ticket not found', 404);

    const updateData = {
      stage,
      completedAt: stage === 'completed' ? new Date() : null,
    };

    const ticket = await prisma.kitchenTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: { items: true },
    });

    if (stage === 'completed') {
      const order = await prisma.order.update({
        where: { id: ticket.orderId },
        data: { status: 'completed' },
        select: { tableId: true },
      });

      if (order.tableId) {
        await prisma.table.update({ where: { id: order.tableId }, data: { status: 'available' } });
      }
    }

    await emitStageUpdated(ticketId, ticket.stage);

    res.json({
      success: true,
      data: {
        ticketId,
        newStage: ticket.stage,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/kitchen/tickets/:id/items/:itemId/prepared */
const markItemPrepared = async (req, res, next) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const itemId = parseInt(req.params.itemId, 10);
    const isPrepared = req.body.isPrepared ?? true;

    const item = await prisma.kitchenTicketItem.update({
      where: { id: itemId },
      data: { isPrepared },
      select: { id: true, ticketId: true },
    });

    if (!item || item.ticketId !== ticketId) {
      throw new AppError('Kitchen ticket item not found', 404);
    }

    const ticketItems = await prisma.kitchenTicketItem.findMany({
      where: { ticketId },
      select: { isPrepared: true },
    });
    const allItemsPrepared = ticketItems.length > 0 && ticketItems.every((row) => row.isPrepared);

    if (allItemsPrepared) {
      await prisma.kitchenTicket.update({ where: { id: ticketId }, data: { stage: 'preparing' } });
      await emitStageUpdated(ticketId, 'preparing');
    }

    try {
      const io = getIO();
      io.of('/kitchen').emit('item_prepared', { ticketId, itemId, isPrepared });
    } catch (_) {
      // Socket may be unavailable in tests.
    }

    res.json({
      success: true,
      data: { ticketId, itemId, isPrepared, allItemsPrepared },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  getFilters,
  getStageCounts,
  getTicketById,
  updateStage,
  markItemPrepared,
};
