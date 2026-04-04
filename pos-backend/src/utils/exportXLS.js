const ExcelJS = require('exceljs');

/**
 * Export sales report as XLS
 * @param {import('express').Response} res - Express response
 * @param {object} data - Report data
 */
async function exportSalesReportXLS(res, data) {
  const { title, period, totalSales, orders } = data;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'POS Cafe System';
  workbook.created = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 },
  ];

  // Style header row
  summarySheet.getRow(1).font = { bold: true, size: 12 };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  summarySheet.addRow({ metric: 'Report Title', value: title });
  summarySheet.addRow({ metric: 'Period', value: period });
  summarySheet.addRow({ metric: 'Generated At', value: new Date().toLocaleString() });
  summarySheet.addRow({ metric: 'Total Sales', value: totalSales.toFixed(2) });
  summarySheet.addRow({ metric: 'Total Orders', value: orders.length });
  summarySheet.addRow({
    metric: 'Average Order Value',
    value: orders.length > 0 ? (totalSales / orders.length).toFixed(2) : '0.00',
  });

  // Orders Sheet
  const ordersSheet = workbook.addWorksheet('Orders');
  ordersSheet.columns = [
    { header: 'Order #', key: 'orderNumber', width: 20 },
    { header: 'Table', key: 'table', width: 12 },
    { header: 'Cashier', key: 'cashier', width: 18 },
    { header: 'Order Type', key: 'orderType', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
    { header: 'Tax', key: 'tax', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Payment Method', key: 'paymentMethod', width: 18 },
    { header: 'Date', key: 'date', width: 18 },
  ];

  // Style header row
  ordersSheet.getRow(1).font = { bold: true, size: 11 };
  ordersSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  ordersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add order rows
  orders.forEach((order) => {
    ordersSheet.addRow({
      orderNumber: order.orderNumber,
      table: order.table?.tableNumber || '-',
      cashier: order.createdByUser?.name || '-',
      orderType: order.orderType,
      status: order.status,
      subtotal: Number(order.subtotal).toFixed(2),
      tax: Number(order.taxAmount).toFixed(2),
      total: Number(order.totalAmount).toFixed(2),
      paymentMethod: order.payments?.[0]?.paymentMethod?.name || '-',
      date: new Date(order.createdAt).toLocaleString(),
    });
  });

  // Auto-filter
  ordersSheet.autoFilter = {
    from: 'A1',
    to: `J${orders.length + 1}`,
  };

  // Alternate row colors for readability
  for (let i = 2; i <= orders.length + 1; i++) {
    if (i % 2 === 0) {
      ordersSheet.getRow(i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F7FB' },
      };
    }
  }

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename=sales-report-${period}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportSalesReportXLS };
