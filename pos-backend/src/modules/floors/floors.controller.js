const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

/** GET /api/floors — with tables */
const getAll = async (req, res, next) => {
  try {
    const floors = await prisma.floor.findMany({
      include: {
        tables: {
          orderBy: { tableNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: floors });
  } catch (error) { next(error); }
};

/** POST /api/floors */
const create = async (req, res, next) => {
  try {
    const { name, isActive, createDefaultTables = true } = req.body;
    const floor = await prisma.floor.create({
      data: {
        name,
        isActive,
        tables: createDefaultTables
          ? {
              create: [101, 102, 103, 104, 105].map((tableNo) => ({
                tableNumber: String(tableNo),
                seats: 5,
                appointmentResource: `Table ${tableNo} (Seating 5)`,
                isActive: true,
              })),
            }
          : undefined,
      },
      include: {
        tables: {
          orderBy: { tableNumber: 'asc' },
        },
      },
    });
    res.status(201).json({ success: true, data: floor });
  } catch (error) { next(error); }
};

/** PUT /api/floors/:id */
const update = async (req, res, next) => {
  try {
    const floor = await prisma.floor.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ success: true, data: floor });
  } catch (error) { next(error); }
};

/** DELETE /api/floors/:id */
const remove = async (req, res, next) => {
  try {
    await prisma.floor.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Floor deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = { getAll, create, update, remove };
