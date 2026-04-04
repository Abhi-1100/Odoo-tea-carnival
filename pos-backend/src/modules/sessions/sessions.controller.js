const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

/** GET /api/sessions */
const getAll = async (req, res, next) => {
  try {
    const sessions = await prisma.posSession.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: sessions });
  } catch (error) { next(error); }
};

/** GET /api/sessions/active */
const getActive = async (req, res, next) => {
  try {
    const session = await prisma.posSession.findFirst({
      where: { status: 'open' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { openedAt: 'desc' },
    });

    if (!session) {
      return res.json({ success: true, data: null, message: 'No active session found' });
    }

    res.json({ success: true, data: session });
  } catch (error) { next(error); }
};

/** GET /api/sessions/:id */
const getById = async (req, res, next) => {
  try {
    const session = await prisma.posSession.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orders: {
          select: { id: true, orderNumber: true, status: true, totalAmount: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!session) throw new AppError('Session not found', 404);
    res.json({ success: true, data: session });
  } catch (error) { next(error); }
};

/** POST /api/sessions/open */
const open = async (req, res, next) => {
  try {
    const { terminalName, openingCash } = req.body;

    const session = await prisma.posSession.create({
      data: {
        terminalName,
        openingCash,
        openedBy: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) { next(error); }
};

/** PUT /api/sessions/:id/close */
const close = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { closingCash, notes } = req.body;

    const session = await prisma.posSession.findUnique({
      where: { id: parseInt(id) },
    });

    if (!session) throw new AppError('Session not found', 404);
    if (session.status === 'closed') throw new AppError('Session is already closed', 400);

    // Calculate total sales from all confirmed payments in this session
    const salesResult = await prisma.payment.aggregate({
      where: {
        order: { sessionId: parseInt(id) },
        status: 'confirmed',
      },
      _sum: { amountPaid: true },
    });

    const totalSales = salesResult._sum.amountPaid || 0;

    const updated = await prisma.posSession.update({
      where: { id: parseInt(id) },
      data: {
        closingCash,
        totalSales,
        status: 'closed',
        closedAt: new Date(),
        notes,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

module.exports = { getAll, getActive, getById, open, close };
