const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

/** GET /api/products */
const getAll = async (req, res, next) => {
  try {
    const { search, categoryId, isActive } = req.query;
    const where = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        variants: { where: { isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: products });
  } catch (error) { next(error); }
};

/** GET /api/products/:id */
const getById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: { select: { id: true, name: true } },
        variants: true,
      },
    });

    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
};

/** POST /api/products */
const create = async (req, res, next) => {
  try {
    const { variants, ...productData } = req.body;

    const product = await prisma.product.create({
      data: {
        ...productData,
        variants: variants?.length
          ? { create: variants }
          : undefined,
      },
      include: { variants: true, category: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) { next(error); }
};

/** PUT /api/products/:id */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { variants, ...productData } = req.body;

    // Update product fields
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: productData,
    });

    // Replace variants if provided
    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: parseInt(id) } });
      if (variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((v) => ({ ...v, productId: parseInt(id) })),
        });
      }
    }

    // Fetch updated product with relations
    const updated = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { variants: true, category: { select: { id: true, name: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

/** DELETE /api/products/:id */
const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // If a product has order history, keep referential integrity by soft-archiving.
    const linkedOrderItems = await prisma.orderItem.count({ where: { productId: id } });

    if (linkedOrderItems > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return res.json({
        success: true,
        message: 'Product has order history and was archived instead of deleted',
      });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) { next(error); }
};

/** GET /api/products/category/:categoryId */
const getByCategory = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: parseInt(req.params.categoryId),
        isActive: true,
      },
      include: { variants: { where: { isActive: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: products });
  } catch (error) { next(error); }
};

module.exports = { getAll, getById, create, update, remove, getByCategory };
