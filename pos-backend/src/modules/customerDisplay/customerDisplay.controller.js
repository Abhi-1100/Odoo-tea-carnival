const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

const THANK_YOU_WINDOW_MINUTES = 5;

const buildModePayload = async () => {
  const now = Date.now();
  const thankYouThreshold = new Date(now - THANK_YOU_WINDOW_MINUTES * 60 * 1000);

  const [activeSession, activeOrder, recentCompletedOrder] = await Promise.all([
    prisma.posSession.findFirst({
      where: { status: 'open' },
      orderBy: { openedAt: 'desc' },
      select: { terminalName: true },
    }),
    prisma.order.findFirst({
      where: { status: { notIn: ['completed', 'cancelled'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
        table: { select: { id: true, tableNumber: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            lineTotal: true,
            product: { select: { name: true } },
          },
        },
      },
    }),
    prisma.order.findFirst({
      where: { status: 'completed', updatedAt: { gte: thankYouThreshold } },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        updatedAt: true,
        totalAmount: true,
      },
    }),
  ]);

  const storeName = activeSession?.terminalName || 'Odoo Cafe';

  if (!activeOrder) {
    if (recentCompletedOrder) {
      return {
        mode: 'thankyou',
        storeName,
        message: 'Thank you for shopping with us. See you again.',
        order: {
          id: recentCompletedOrder.id,
          orderNumber: recentCompletedOrder.orderNumber,
          totalAmount: recentCompletedOrder.totalAmount,
          completedAt: recentCompletedOrder.updatedAt,
        },
      };
    }

    return {
      mode: 'idle',
      storeName,
      message: 'Welcome! Your order will appear here.',
      order: null,
    };
  }

  const pendingPayment = await prisma.payment.findFirst({
    where: {
      orderId: activeOrder.id,
      status: { in: ['pending', 'confirmed'] },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      amountPaid: true,
      paymentMethod: { select: { name: true, type: true } },
    },
  });

  if (pendingPayment && pendingPayment.paymentMethod?.type === 'upi' && pendingPayment.status === 'pending') {
    return {
      mode: 'qr',
      storeName,
      message: 'Scan and complete your UPI payment.',
      order: activeOrder,
      payment: pendingPayment,
    };
  }

  return {
    mode: 'order',
    storeName,
    message: 'Review your order details.',
    order: activeOrder,
    payment: pendingPayment || null,
  };
};

/** GET /api/customer-display/active — No auth required */
const getActiveDisplay = async (req, res, next) => {
  try {
    const payload = await buildModePayload();
    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};

/** GET /api/customer-display/order/:orderId — No auth required */
const getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.orderId) },
      select: {
        id: true,
        orderNumber: true,
        orderType: true,
        status: true,
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            lineTotal: true,
            notes: true,
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
        table: { select: { id: true, tableNumber: true } },
      },
    });

    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

/** GET /api/customer-display/payment-status/:orderId — No auth required */
const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId: parseInt(req.params.orderId) },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amountPaid: true,
        changeAmount: true,
        receiptNumber: true,
        status: true,
        paidAt: true,
        paymentMethod: { select: { name: true, type: true } },
      },
    });

    res.json({
      success: true,
      data: payment || null,
      message: payment ? undefined : 'No payment found for this order',
    });
  } catch (error) { next(error); }
};

module.exports = { getOrder, getPaymentStatus, getActiveDisplay };
