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
    const floor = await prisma.floor.create({ data: req.body });
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
