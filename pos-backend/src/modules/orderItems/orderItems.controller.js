const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { recalculateOrderTotals } = require('../orders/orders.controller');
const { getIO } = require('../../config/socket');

/** POST /api/order-items — Add item to existing order */
const addItem = async (req, res, next) => {
  try {
    const { orderId, productId, variantId, quantity, unitPrice, notes } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new AppError('Cannot modify a completed or cancelled order', 400);
    }

    const item = await prisma.orderItem.create({
      data: {
        orderId,
        productId,
        variantId: variantId || null,
        quantity,
        unitPrice,
        notes: notes || '',
      },
      include: {
        product: { select: { id: true, name: true } },
        variant: { select: { id: true, attribute: true, value: true } },
      },
    });

    // Recalculate order totals
    await recalculateOrderTotals(orderId);

    // Emit customer display update
    try {
      const io = getIO();
      const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: { select: { name: true } } } } },
      });
      io.of('/customer').emit('order_updated', updatedOrder);
    } catch (e) { /* socket not available */ }

    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
};

/** PUT /api/order-items/:id */
const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;

    const existing = await prisma.orderItem.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw new AppError('Order item not found', 404);

    const order = await prisma.order.findUnique({ where: { id: existing.orderId } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new AppError('Cannot modify a completed or cancelled order', 400);
    }

    const updateData = {};
    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }
    if (notes !== undefined) updateData.notes = notes;

    const item = await prisma.orderItem.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        product: { select: { id: true, name: true } },
        variant: { select: { id: true, attribute: true, value: true } },
      },
    });

    // Recalculate order totals
    await recalculateOrderTotals(existing.orderId);

    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

/** DELETE /api/order-items/:id */
const removeItem = async (req, res, next) => {
  try {
    const item = await prisma.orderItem.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!item) throw new AppError('Order item not found', 404);

    const order = await prisma.order.findUnique({ where: { id: item.orderId } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new AppError('Cannot modify a completed or cancelled order', 400);
    }

    await prisma.orderItem.delete({ where: { id: parseInt(req.params.id) } });

    // Recalculate order totals
    await recalculateOrderTotals(item.orderId);

    res.json({ success: true, message: 'Item removed successfully' });
  } catch (error) { next(error); }
};

module.exports = { addItem, updateItem, removeItem };
