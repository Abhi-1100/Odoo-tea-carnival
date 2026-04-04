const express = require('express');
const router = express.Router();
const {
  getDashboard, getSalesReport, getOrdersReport,
  getProductsReport, exportPDF, exportXLS,
} = require('./reports.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/sales', getSalesReport);
router.get('/orders', getOrdersReport);
router.get('/products', getProductsReport);
router.get('/export/pdf', exportPDF);
router.get('/export/xls', exportXLS);

module.exports = router;
