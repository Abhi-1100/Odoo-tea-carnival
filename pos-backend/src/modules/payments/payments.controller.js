const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { getIO } = require('../../config/socket');

/**
 * Generate auto-incremented receipt number: RCP-YYYY-XXXX
 */
async function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const prefix = `RCP-${year}-`;

  const lastPayment = await prisma.payment.findFirst({
    where: { receiptNumber: { startsWith: prefix } },
    orderBy: { receiptNumber: 'desc' },
  });

  let sequence = 1;
  if (lastPayment) {
    const lastSeq = parseInt(lastPayment.receiptNumber.split('-').pop());
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

/** POST /api/payments — Process payment */
const processPayment = async (req, res, next) => {
  try {
    const { orderId, method, amountPaid, upiRef } = req.body;

    // Get order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status === 'cancelled') throw new AppError('Cannot pay for a cancelled order', 400);
    if (order.status === 'completed') throw new AppError('Order is already paid', 400);

    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (existingPayment) {
      throw new AppError('A payment already exists for this order', 400);
    }

    // Find payment method
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { type: method, isEnabled: true },
    });
    if (!paymentMethod) throw new AppError(`Payment method "${method}" is not enabled`, 400);

    // Calculate change
    const totalAmount = Number(order.totalAmount);
    if (amountPaid < totalAmount) {
      throw new AppError('Amount paid cannot be less than order total', 400);
    }
    const changeAmount = Math.max(0, amountPaid - totalAmount);

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        paymentMethodId: paymentMethod.id,
        amountPaid,
        changeAmount: Math.round(changeAmount * 100) / 100,
        upiRef: upiRef || null,
        receiptNumber,
        status: method === 'upi' ? 'pending' : 'confirmed',
      },
      include: {
        paymentMethod: { select: { id: true, name: true, type: true } },
      },
    });

    // If not UPI (instant confirmation), update order and table
    if (method !== 'upi') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'completed' },
      });

      // Free table
      if (order.tableId) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'available' },
        });
      }
    }

    // Emit payment confirmation for instant-confirmed methods
    try {
      if (payment.status === 'confirmed') {
        const io = getIO();
        io.of('/customer').emit('payment_confirmed', {
          orderId,
          amountPaid: payment.amountPaid,
          receiptNumber: payment.receiptNumber,
          status: payment.status,
        });
      }
    } catch (e) { /* socket not available */ }

    res.status(201).json({
      success: true,
      paymentId: payment.id,
      receiptNumber: payment.receiptNumber,
      amountPaid: payment.amountPaid,
      change: payment.changeAmount,
      method: paymentMethod.type,
      status: payment.status,
    });
  } catch (error) { next(error); }
};

/** GET /api/payments/order/:orderId */
const getByOrder = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { orderId: parseInt(req.params.orderId) },
      include: {
        paymentMethod: { select: { id: true, name: true, type: true } },
      },
    });
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
};

/** GET /api/payments */
const getAll = async (req, res, next) => {
  try {
    const { status, method, startDate, endDate } = req.query;
    const where = {};

    if (status) where.status = status;
    if (method) {
      where.paymentMethod = { type: method };
    }
    if (startDate && endDate) {
      where.paidAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        paymentMethod: { select: { id: true, name: true, type: true } },
        order: { select: { id: true, orderNumber: true, totalAmount: true } },
      },
      orderBy: { paidAt: 'desc' },
    });

    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
};

/** POST /api/payments/upi/confirm — Manually confirm UPI payment */
const confirmUPI = async (req, res, next) => {
  try {
    const { orderId, upiRef } = req.body;

    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        status: 'pending',
        paymentMethod: { type: 'upi' },
      },
    });

    if (!payment) throw new AppError('No pending payment found for this order', 404);

    // Update payment status
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'confirmed', upiRef },
    });

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' },
    });

    // Free table
    if (order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'available' },
      });
    }

    // Emit to customer display
    try {
      const io = getIO();
      io.of('/customer').emit('payment_confirmed', {
        orderId,
        amountPaid: updated.amountPaid,
        receiptNumber: updated.receiptNumber,
        status: 'confirmed',
      });
    } catch (e) { /* socket not available */ }

    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

module.exports = { processPayment, getByOrder, getAll, confirmUPI };
