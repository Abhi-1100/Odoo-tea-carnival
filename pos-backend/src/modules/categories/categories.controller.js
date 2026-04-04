const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

/** GET /api/categories */
const getAll = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: { where: { isActive: true }, select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};

/** POST /api/categories */
const create = async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
};

/** PUT /api/categories/:id */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
};

/** DELETE /api/categories/:id */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = { getAll, create, update, remove };
