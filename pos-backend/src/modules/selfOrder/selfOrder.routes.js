const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const {
	generateToken,
	getSession,
	getProducts,
	placeOrder,
	getSettings,
	saveSettings,
	uploadBackgroundImages,
	removeBackgroundImage,
	generateTokensForAllTables,
	getAllTableTokens,
	regenerateTokenForTable,
	downloadQrPdf,
	validateTokenAndGetInfo,
	getPageSettings,
	trackOrder,
	getOrderHistory,
	createRazorpayOrderForSelfOrder,
	verifyRazorpayPaymentForSelfOrder,
} = require('./selfOrder.controller');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
	generateTokenSchema,
	placeOrderSchema,
	updateSettingsSchema,
	createSelfOrderRazorpayOrderSchema,
	verifySelfOrderRazorpayPaymentSchema,
} = require('./selfOrder.validation');

const uploadDir = path.join(process.cwd(), 'uploads', 'self-order-backgrounds');
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		fs.mkdirSync(uploadDir, { recursive: true });
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
		cb(null, `${Date.now()}-${safeName}`);
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (!file.mimetype.startsWith('image/')) {
			return cb(new Error('Only image files are allowed'));
		}
		cb(null, true);
	},
	limits: { fileSize: 15 * 1024 * 1024 },
});

// Admin settings / QR management
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, validate(updateSettingsSchema), saveSettings);
router.post('/settings/background', authenticate, upload.array('images', 8), uploadBackgroundImages);
router.delete('/settings/background', authenticate, removeBackgroundImage);
router.post('/generate-tokens', authenticate, generateTokensForAllTables);
router.get('/tokens', authenticate, getAllTableTokens);
router.post('/tokens/:tableId/regenerate', authenticate, regenerateTokenForTable);
router.get('/download-qr-pdf', authenticate, downloadQrPdf);

// Auth required
router.post('/generate-token', authenticate, validate(generateTokenSchema), generateToken);

// No auth required (token-based)
router.get('/page-settings/:token', getPageSettings);
router.get('/validate/:token', validateTokenAndGetInfo);
router.get('/session/:token', getSession);
router.get('/products/:token', getProducts);
router.post('/place-order/:token', validate(placeOrderSchema), placeOrder);
router.post('/razorpay/create-order/:token', validate(createSelfOrderRazorpayOrderSchema), createRazorpayOrderForSelfOrder);
router.post('/razorpay/verify/:token', validate(verifySelfOrderRazorpayPaymentSchema), verifyRazorpayPaymentForSelfOrder);
router.get('/track/:orderId', trackOrder);
router.get('/history/:token', getOrderHistory);

module.exports = router;
