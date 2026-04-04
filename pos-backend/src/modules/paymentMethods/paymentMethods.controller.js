const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { generateUPIQR } = require('../../utils/generateQR');

/** GET /api/payment-methods */
const getAll = async (req, res, next) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      orderBy: { id: 'asc' },
    });
    res.json({ success: true, data: methods });
  } catch (error) { next(error); }
};

/** PUT /api/payment-methods/:id/toggle */
const toggle = async (req, res, next) => {
  try {
    const method = await prisma.paymentMethod.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!method) throw new AppError('Payment method not found', 404);

    const updated = await prisma.paymentMethod.update({
      where: { id: parseInt(req.params.id) },
      data: { isEnabled: !method.isEnabled },
    });

    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

/** PUT /api/payment-methods/:id/upi */
const saveUPI = async (req, res, next) => {
  try {
    const updated = await prisma.paymentMethod.update({
      where: { id: parseInt(req.params.id) },
      data: { upiId: req.body.upiId },
    });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

/** GET /api/payment-methods/:id/qr */
const getQR = async (req, res, next) => {
  try {
    const method = await prisma.paymentMethod.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!method) throw new AppError('Payment method not found', 404);
    if (!method.upiId) throw new AppError('UPI ID not configured for this payment method', 400);

    const qrBase64 = await generateUPIQR(method.upiId);

    res.json({
      success: true,
      qrBase64,
      upiId: method.upiId,
    });
  } catch (error) { next(error); }
};

module.exports = { getAll, toggle, saveUPI, getQR };
