const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

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

module.exports = { getOrder, getPaymentStatus };
