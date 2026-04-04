const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { getIO } = require('../../config/socket');

/**
 * Generate auto-incremented order number: ORD-YYYY-XXXX
 */
async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderNumber.split('-').pop());
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

/**
 * Calculate order totals from items
 */
async function recalculateOrderTotals(orderId) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: { product: { select: { taxPercent: true } } },
  });

  let subtotal = 0;
  let taxAmount = 0;

  for (const item of items) {
    const lineTotal = Number(item.quantity) * Number(item.unitPrice);
    subtotal += lineTotal;
    taxAmount += lineTotal * (Number(item.product.taxPercent) / 100);
  }

  const totalAmount = subtotal + taxAmount;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    },
  });
}

/** GET /api/orders */
const getAll = async (req, res, next) => {
  try {
    const { sessionId, tableId, status, date } = req.query;
    const where = {};

    if (sessionId) where.sessionId = parseInt(sessionId);
    if (tableId) where.tableId = parseInt(tableId);
    if (status) where.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.createdAt = { gte: start, lt: end };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: { select: { id: true, tableNumber: true } },
        createdByUser: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};

/** GET /api/orders/:id */
const getById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        table: { select: { id: true, tableNumber: true } },
        session: { select: { id: true, terminalName: true } },
        createdByUser: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, taxPercent: true } },
            variant: { select: { id: true, attribute: true, value: true, extraPrice: true } },
          },
        },
        payments: { include: { paymentMethod: { select: { id: true, name: true, type: true } } } },
        kitchenTickets: { include: { items: true } },
      },
    });

    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

/** POST /api/orders */
const create = async (req, res, next) => {
  try {
    const { sessionId, tableId, orderType, notes, items } = req.body;

    // Validate session is open
    const session = await prisma.posSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'open') {
      throw new AppError('Cannot create order. Session is not open.', 400);
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        sessionId,
        tableId: tableId || null,
        createdBy: req.user.id,
        orderType,
        notes,
        status: 'draft',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes || '',
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
        table: { select: { id: true, tableNumber: true } },
      },
    });

    // Recalculate totals (with tax)
    await recalculateOrderTotals(order.id);

    // Mark table as occupied
    if (tableId) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'occupied' },
      });
    }

    // Fetch final order
    const finalOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
        table: { select: { id: true, tableNumber: true } },
      },
    });

    res.status(201).json({ success: true, data: finalOrder });
  } catch (error) { next(error); }
};

/** PUT /api/orders/:id */
const update = async (req, res, next) => {
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
      },
    });
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

/** PUT /api/orders/:id/send-kitchen */
const sendToKitchen = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sendToKitchen: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
      },
    });

    if (!order) throw new AppError('Order not found', 404);
    if (order.status === 'cancelled' || order.status === 'completed') {
      throw new AppError('Cannot send a completed or cancelled order to kitchen', 400);
    }

    const existingTicket = await prisma.kitchenTicket.findFirst({
      where: { orderId },
    });

    if (existingTicket) {
      throw new AppError('Kitchen ticket already exists for this order', 400);
    }

    // Filter items where product.sendToKitchen = true
    const kitchenItems = order.items.filter((item) => item.product.sendToKitchen);

    if (kitchenItems.length === 0) {
      throw new AppError('No items to send to kitchen', 400);
    }

    // Create kitchen ticket
    const ticket = await prisma.kitchenTicket.create({
      data: {
        orderId,
        ticketNumber: order.orderNumber,
        stage: 'to_cook',
        items: {
          create: kitchenItems.map((item) => ({
            orderItemId: item.id,
            productName: item.product.name,
            variantInfo: item.variant
              ? `${item.variant.attribute}: ${item.variant.value}`
              : null,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            table: { select: { id: true, tableNumber: true } },
          },
        },
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'sent_to_kitchen' },
    });

    // Emit Socket.io event to kitchen
    try {
      const io = getIO();
      io.of('/kitchen').emit('new_kitchen_order', ticket);
    } catch (e) {
      console.warn('Socket.io not available for kitchen emit');
    }

    res.json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

/** PUT /api/orders/:id/status */
const updateStatus = async (req, res, next) => {
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status: req.body.status },
    });

    // If cancelled, free the table
    if (req.body.status === 'cancelled' && order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'available' },
      });
    }

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

/** DELETE /api/orders/:id */
const remove = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!order) throw new AppError('Order not found', 404);

    // Free table if assigned
    if (order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'available' },
      });
    }

    await prisma.order.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) { next(error); }
};

/** GET /api/orders/table/:tableId */
const getByTable = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        tableId: parseInt(req.params.tableId),
        status: { notIn: ['completed', 'cancelled'] },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

module.exports = {
  getAll, getById, create, update, sendToKitchen,
  updateStatus, remove, getByTable, recalculateOrderTotals,
};
