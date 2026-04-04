const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');

/** GET /api/customers */
const getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: customers });
  } catch (error) { next(error); }
};

/** GET /api/customers/:id */
const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Customer not found', 404);
    res.json({ success: true, data: customer });
  } catch (error) { next(error); }
};

/** POST /api/customers */
const create = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      email: req.body.email?.trim() || null,
      phone: req.body.phone?.trim(),
      country: req.body.country?.trim() || 'India',
    };

    const customer = await prisma.customer.create({ data: payload });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    if (error?.code === 'P2002') {
      return next(new AppError('Email or phone already exists', 409));
    }
    next(error);
  }
};

/** PUT /api/customers/:id */
const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const payload = {
      ...req.body,
      ...(req.body.email !== undefined ? { email: req.body.email?.trim() || null } : {}),
      ...(req.body.phone !== undefined ? { phone: req.body.phone?.trim() } : {}),
      ...(req.body.country !== undefined ? { country: req.body.country?.trim() || 'India' } : {}),
    };

    const customer = await prisma.customer.update({
      where: { id },
      data: payload,
    });

    res.json({ success: true, data: customer });
  } catch (error) {
    if (error?.code === 'P2025') {
      return next(new AppError('Customer not found', 404));
    }
    if (error?.code === 'P2002') {
      return next(new AppError('Email or phone already exists', 409));
    }
    next(error);
  }
};

/** DELETE /api/customers/:id */
const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.customer.delete({ where: { id } });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    if (error?.code === 'P2025') {
      return next(new AppError('Customer not found', 404));
    }
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
