const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { exportSalesReportPDF } = require('../../utils/exportPDF');
const { exportSalesReportXLS } = require('../../utils/exportXLS');

const REPORT_ORDER_STATUSES = ['confirmed', 'sent_to_kitchen', 'completed'];

/**
 * Build date filter from period/custom dates
 */
function buildDateFilter(query) {
  const { period, startDate, endDate } = query;
  const now = new Date();

  if (period === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { gte: start, lt: end };
  }

  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { gte: start, lte: now };
  }

  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { gte: start, lte: now };
  }

  if (period === 'custom' && startDate && endDate) {
    return { gte: new Date(startDate), lte: new Date(endDate) };
  }

  return undefined;
}

/** GET /api/reports/dashboard */
const getDashboard = async (req, res, next) => {
  try {
    const dateFilter = buildDateFilter(req.query);
    const where = {};
    if (dateFilter) where.createdAt = dateFilter;

    // Total sales & orders
    const orders = await prisma.order.findMany({
      where: { ...where, status: { in: REPORT_ORDER_STATUSES } },
      select: { totalAmount: true, createdAt: true },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Top product
    const topProductResult = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { ...where, status: { in: REPORT_ORDER_STATUSES } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 1,
    });

    let topProduct = 'N/A';
    if (topProductResult.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: topProductResult[0].productId },
      });
      topProduct = product?.name || 'N/A';
    }

    // Payment breakdown
    const paymentBreakdown = { cash: 0, digital: 0, upi: 0 };
    const payments = await prisma.payment.findMany({
      where: {
        status: 'confirmed',
        order: { ...where, status: { in: REPORT_ORDER_STATUSES } },
      },
      include: { paymentMethod: { select: { type: true } } },
    });

    payments.forEach((p) => {
      paymentBreakdown[p.paymentMethod.type] += Number(p.amountPaid);
    });

    // Sales by day
    const salesByDay = {};
    orders.forEach((o) => {
      const date = o.createdAt.toISOString().split('T')[0];
      salesByDay[date] = (salesByDay[date] || 0) + Number(o.totalAmount);
    });

    const salesByDayArray = Object.entries(salesByDay)
      .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        topProduct,
        paymentBreakdown,
        salesByDay: salesByDayArray,
      },
    });
  } catch (error) { next(error); }
};

/** GET /api/reports/sales */
const getSalesReport = async (req, res, next) => {
  try {
    const dateFilter = buildDateFilter(req.query);
    const where = { status: { in: REPORT_ORDER_STATUSES } };
    if (dateFilter) where.createdAt = dateFilter;
    if (req.query.sessionId) where.sessionId = parseInt(req.query.sessionId);

    const orders = await prisma.order.findMany({
      where,
      include: {
        payments: { include: { paymentMethod: { select: { name: true, type: true } } } },
        table: { select: { tableNumber: true } },
        createdByUser: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    res.json({
      success: true,
      data: {
        totalSales: Math.round(totalSales * 100) / 100,
        count: orders.length,
        orders,
      },
    });
  } catch (error) { next(error); }
};

/** GET /api/reports/orders */
const getOrdersReport = async (req, res, next) => {
  try {
    const dateFilter = buildDateFilter(req.query);
    const where = {};
    if (dateFilter) where.createdAt = dateFilter;
    if (req.query.sessionId) where.sessionId = parseInt(req.query.sessionId);
    if (req.query.responsibleId) where.createdBy = parseInt(req.query.responsibleId);

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: { select: { tableNumber: true } },
        createdByUser: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};

/** GET /api/reports/products */
const getProductsReport = async (req, res, next) => {
  try {
    const dateFilter = buildDateFilter(req.query);
    const orderWhere = { status: { in: REPORT_ORDER_STATUSES } };
    if (dateFilter) orderWhere.createdAt = dateFilter;

    const productSales = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: orderWhere },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
    });

    // Calculate revenue per product from individual items
    const productRevenueMap = {};
    const allItems = await prisma.orderItem.findMany({
      where: { order: orderWhere },
      select: { productId: true, quantity: true, unitPrice: true },
    });
    allItems.forEach((item) => {
      const revenue = Number(item.quantity) * Number(item.unitPrice);
      productRevenueMap[item.productId] = (productRevenueMap[item.productId] || 0) + revenue;
    });

    // Enrich with product names
    const productIds = productSales.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: { select: { name: true } } },
    });

    const productMap = {};
    products.forEach((p) => { productMap[p.id] = p; });

    const report = productSales.map((ps) => ({
      productId: ps.productId,
      productName: productMap[ps.productId]?.name || 'Unknown',
      category: productMap[ps.productId]?.category?.name || 'Uncategorized',
      totalQuantity: ps._sum.quantity || 0,
      totalRevenue: Math.round((productRevenueMap[ps.productId] || 0) * 100) / 100,
    }));

    res.json({ success: true, data: report });
  } catch (error) { next(error); }
};

/** GET /api/reports/export/pdf */
const exportPDF = async (req, res, next) => {
  try {
    const dateFilter = buildDateFilter(req.query);
    const where = { status: { in: REPORT_ORDER_STATUSES } };
    if (dateFilter) where.createdAt = dateFilter;

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: { select: { tableNumber: true } },
        createdByUser: { select: { name: true } },
        payments: { include: { paymentMethod: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    await exportSalesReportPDF(res, {
      title: 'Sales Report',
      period: req.query.period || 'custom',
      totalSales,
      orders,
    });
  } catch (error) { next(error); }
};

/** GET /api/reports/export/xls */
const exportXLS = async (req, res, next) => {
  try {
    const dateFilter = buildDateFilter(req.query);
    const where = { status: { in: REPORT_ORDER_STATUSES } };
    if (dateFilter) where.createdAt = dateFilter;

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: { select: { tableNumber: true } },
        createdByUser: { select: { name: true } },
        payments: { include: { paymentMethod: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    await exportSalesReportXLS(res, {
      title: 'Sales Report',
      period: req.query.period || 'custom',
      totalSales,
      orders,
    });
  } catch (error) { next(error); }
};

module.exports = { getDashboard, getSalesReport, getOrdersReport, getProductsReport, exportPDF, exportXLS };
