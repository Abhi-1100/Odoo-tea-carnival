const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

// Import route modules
const authRoutes = require('./modules/auth/auth.routes');
const categoryRoutes = require('./modules/categories/categories.routes');
const productRoutes = require('./modules/products/products.routes');
const paymentMethodRoutes = require('./modules/paymentMethods/paymentMethods.routes');
const floorRoutes = require('./modules/floors/floors.routes');
const tableRoutes = require('./modules/tables/tables.routes');
const sessionRoutes = require('./modules/sessions/sessions.routes');
const orderRoutes = require('./modules/orders/orders.routes');
const orderItemRoutes = require('./modules/orderItems/orderItems.routes');
const paymentRoutes = require('./modules/payments/payments.routes');
const kitchenRoutes = require('./modules/kitchen/kitchen.routes');
const customerDisplayRoutes = require('./modules/customerDisplay/customerDisplay.routes');
const selfOrderRoutes = require('./modules/selfOrder/selfOrder.routes');
const reportRoutes = require('./modules/reports/reports.routes');

const app = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'POS Cafe API is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/customer-display', customerDisplayRoutes);
app.use('/api/self-order', selfOrderRoutes);
app.use('/api/reports', reportRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    code: 404,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(errorHandler);

module.exports = app;
