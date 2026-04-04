const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

/** GET /api/floors — with tables */
const getAll = async (req, res, next) => {
  try {
    const floors = await prisma.floor.findMany({
      where: { isActive: true },
      include: {
        tables: {
          where: { isActive: true },
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
    const floorId = parseInt(req.params.id);

    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      select: {
        id: true,
        tables: { select: { id: true } },
      },
    });

    if (!floor) throw new AppError('Floor not found', 404);

    const tableIds = floor.tables.map((t) => t.id);

    if (tableIds.length > 0) {
      const [orderCount, tokenCount] = await Promise.all([
        prisma.order.count({ where: { tableId: { in: tableIds } } }),
        prisma.selfOrderToken.count({ where: { tableId: { in: tableIds } } }),
      ]);

      if (orderCount > 0 || tokenCount > 0) {
        await prisma.$transaction([
          prisma.floor.update({ where: { id: floorId }, data: { isActive: false } }),
          prisma.table.updateMany({ where: { floorId }, data: { isActive: false } }),
        ]);

        return res.json({
          success: true,
          message: 'Floor has linked history and was archived instead of deleted',
        });
      }
    }

    await prisma.floor.delete({ where: { id: floorId } });
    res.json({ success: true, message: 'Floor deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = { getAll, create, update, remove };
