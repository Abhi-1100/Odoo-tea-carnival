const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

/** GET /api/tables */
const getAll = async (req, res, next) => {
  try {
    const tables = await prisma.table.findMany({
      include: { floor: { select: { id: true, name: true } } },
      orderBy: { tableNumber: 'asc' },
    });
    res.json({ success: true, data: tables });
  } catch (error) { next(error); }
};

/** GET /api/tables/floor/:floorId */
const getByFloor = async (req, res, next) => {
  try {
    const tables = await prisma.table.findMany({
      where: { floorId: parseInt(req.params.floorId) },
      orderBy: { tableNumber: 'asc' },
    });
    res.json({ success: true, data: tables });
  } catch (error) { next(error); }
};

/** GET /api/tables/:id — with current active order */
const getById = async (req, res, next) => {
  try {
    const table = await prisma.table.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        floor: { select: { id: true, name: true } },
        orders: {
          where: { status: { notIn: ['completed', 'cancelled'] } },
          include: {
            items: {
              include: {
                product: { select: { id: true, name: true } },
                variant: { select: { id: true, attribute: true, value: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!table) throw new AppError('Table not found', 404);
    res.json({ success: true, data: table });
  } catch (error) { next(error); }
};

/** POST /api/tables */
const create = async (req, res, next) => {
  try {
    const table = await prisma.table.create({
      data: req.body,
      include: { floor: { select: { id: true, name: true } } },
    });
    res.status(201).json({ success: true, data: table });
  } catch (error) { next(error); }
};

/** PUT /api/tables/:id */
const update = async (req, res, next) => {
  try {
    const table = await prisma.table.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: { floor: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: table });
  } catch (error) { next(error); }
};

/** DELETE /api/tables/:id */
const remove = async (req, res, next) => {
  try {
    await prisma.table.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (error) { next(error); }
};

/** PUT /api/tables/:id/status */
const updateStatus = async (req, res, next) => {
  try {
    const table = await prisma.table.update({
      where: { id: parseInt(req.params.id) },
      data: { status: req.body.status },
    });
    res.json({ success: true, data: table });
  } catch (error) { next(error); }
};

module.exports = { getAll, getByFloor, getById, create, update, remove, updateStatus };
