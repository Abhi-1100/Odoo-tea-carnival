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
    const id = parseInt(req.params.id);

    const linked = await prisma.table.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            orders: true,
            selfOrderTokens: true,
          },
        },
      },
    });

    if (!linked) throw new AppError('Table not found', 404);

    const hasLinks = (linked._count.orders || 0) > 0 || (linked._count.selfOrderTokens || 0) > 0;

    if (hasLinks) {
      await prisma.table.update({
        where: { id },
        data: { isActive: false },
      });

      return res.json({
        success: true,
        message: 'Table has linked history and was archived instead of deleted',
      });
    }

    await prisma.table.delete({ where: { id } });
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

/** POST /api/tables/bulk-action */
const bulkAction = async (req, res, next) => {
  try {
    const { action, ids, floorId } = req.body;

    if (action === 'delete') {
      const tables = await prisma.table.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          _count: {
            select: {
              orders: true,
              selfOrderTokens: true,
            },
          },
        },
      });

      const archiveIds = tables
        .filter((table) => (table._count.orders || 0) > 0 || (table._count.selfOrderTokens || 0) > 0)
        .map((table) => table.id);

      const deleteIds = tables
        .filter((table) => (table._count.orders || 0) === 0 && (table._count.selfOrderTokens || 0) === 0)
        .map((table) => table.id);

      let deletedCount = 0;
      let archivedCount = 0;

      if (deleteIds.length > 0) {
        const deleted = await prisma.table.deleteMany({
          where: { id: { in: deleteIds } },
        });
        deletedCount = deleted.count;
      }

      if (archiveIds.length > 0) {
        const archived = await prisma.table.updateMany({
          where: { id: { in: archiveIds } },
          data: { isActive: false },
        });
        archivedCount = archived.count;
      }

      return res.json({
        success: true,
        message: archivedCount > 0
          ? `Deleted ${deletedCount} table(s), archived ${archivedCount} linked table(s)`
          : `Deleted ${deletedCount} table(s)`,
        data: { deletedCount, archivedCount },
      });
    }

    if (action === 'duplicate') {
      const sourceTables = await prisma.table.findMany({
        where: { id: { in: ids } },
        orderBy: { id: 'asc' },
      });

      if (sourceTables.length === 0) {
        throw new AppError('No tables found to duplicate', 404);
      }

      const targetFloorId = floorId || sourceTables[0].floorId;
      const existingTables = await prisma.table.findMany({
        where: { floorId: targetFloorId },
        select: { tableNumber: true },
      });
      const usedNumbers = new Set(existingTables.map((t) => t.tableNumber));

      const duplicateData = sourceTables.map((table) => {
        let suffix = 1;
        let candidate = `${table.tableNumber}-copy`;
        while (usedNumbers.has(candidate)) {
          suffix += 1;
          candidate = `${table.tableNumber}-copy-${suffix}`;
        }
        usedNumbers.add(candidate);

        return {
          floorId: targetFloorId,
          tableNumber: candidate,
          seats: table.seats,
          status: 'available',
          appointmentResource: table.appointmentResource,
          isActive: table.isActive,
        };
      });

      const created = await prisma.$transaction(
        duplicateData.map((data) => prisma.table.create({ data }))
      );

      return res.status(201).json({
        success: true,
        message: `Duplicated ${created.length} table(s)`,
        data: created,
      });
    }

    throw new AppError('Unsupported bulk action', 400);
  } catch (error) { next(error); }
};

module.exports = { getAll, getByFloor, getById, create, update, remove, updateStatus, bulkAction };
