const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { getIO } = require('../../config/socket');

const DEFAULT_SETTINGS = {
  isEnabled: false,
  mode: 'online_ordering',
  payAtCounter: true,
  backgroundColor: '#95416a',
  backgroundImages: [],
};

const DEFAULT_CATEGORY_COLORS = ['#e84393', '#f97316', '#22c55e', '#38bdf8', '#a855f7'];

function toSafeImages(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string');
}

function getFrontendBaseUrl(req) {
  return process.env.SELF_ORDER_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
}

function buildSelfOrderUrl(req, token) {
  return `${getFrontendBaseUrl(req).replace(/\/$/, '')}/s/${token}`;
}

function normalizePageSettings(req, tokenRecord, settings) {
  return {
    restaurantName: 'Odoo POS Cafe',
    logo: null,
    backgroundImages: toSafeImages(settings.backgroundImages),
    backgroundColor: settings.backgroundColor || '#95416a',
    tableId: tokenRecord.tableId,
    tableName: `Table ${tokenRecord.table.tableNumber}`,
    mode: settings.mode,
  };
}

function generateRandomToken(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i += 1) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

async function createUniquePermanentToken() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = generateRandomToken(8);
    const exists = await prisma.selfOrderToken.findUnique({ where: { token } });
    if (!exists) return token;
  }

  // Fallback in the very unlikely case of collisions.
  return uuidv4().replace(/-/g, '').slice(0, 8);
}

async function getOrCreateSettings() {
  const existing = await prisma.selfOrderSettings.findFirst();
  if (existing) return existing;

  return prisma.selfOrderSettings.create({
    data: DEFAULT_SETTINGS,
  });
}

async function getLatestOpenSessionId() {
  const session = await prisma.posSession.findFirst({
    where: { status: 'open' },
    orderBy: { openedAt: 'desc' },
    select: { id: true },
  });

  return session?.id || null;
}

async function mapPermanentTokens(req) {
  const records = await prisma.selfOrderToken.findMany({
    where: {
      isPermanent: true,
      table: { isActive: true },
    },
    include: {
      table: { select: { id: true, tableNumber: true } },
    },
    orderBy: { table: { tableNumber: 'asc' } },
  });

  return records.map((record) => ({
    tableId: record.tableId,
    tableName: `Table ${record.table.tableNumber}`,
    token: record.token,
    url: record.url || buildSelfOrderUrl(req, record.token),
  }));
}

/**
 * Generate auto-incremented order number: ORD-YYYY-XXXX
 */
async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderNumber.split('-').pop());
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

/**
 * Validate self-order token
 */
async function validateToken(token) {
  const tokenRecord = await prisma.selfOrderToken.findUnique({
    where: { token },
    include: {
      table: true,
      session: true,
    },
  });

  if (!tokenRecord) throw new AppError('Invalid self-order token', 404);
  if (!tokenRecord.isPermanent && tokenRecord.isUsed) {
    throw new AppError('This self-order token has already been used', 400);
  }
  if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
    throw new AppError('Self-order token has expired', 400);
  }
  if (tokenRecord.session && tokenRecord.session.status !== 'open') {
    throw new AppError('The POS session is no longer active', 400);
  }
  if (!tokenRecord.table?.isActive) {
    throw new AppError('Table is inactive', 400);
  }

  return tokenRecord;
}

const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      success: true,
      data: {
        isEnabled: settings.isEnabled,
        mode: settings.mode,
        payAtCounter: true,
        backgroundColor: settings.backgroundColor || '#95416a',
        backgroundImages: toSafeImages(settings.backgroundImages),
      },
    });
  } catch (error) { next(error); }
};

const saveSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    const { isEnabled, mode, backgroundColor } = req.body;

    const updated = await prisma.selfOrderSettings.update({
      where: { id: settings.id },
      data: {
        isEnabled,
        mode,
        payAtCounter: true,
        backgroundColor: backgroundColor || settings.backgroundColor || '#95416a',
      },
    });

    res.json({
      success: true,
      data: {
        isEnabled: updated.isEnabled,
        mode: updated.mode,
        payAtCounter: true,
        backgroundColor: updated.backgroundColor || '#95416a',
        backgroundImages: toSafeImages(updated.backgroundImages),
      },
    });
  } catch (error) { next(error); }
};

const uploadBackgroundImages = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    const files = Array.isArray(req.files) ? req.files : [];

    if (!files.length) {
      throw new AppError('At least one image file is required', 400);
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadedUrls = files.map((file) => `${baseUrl}/uploads/self-order-backgrounds/${file.filename}`);
    const existingImages = toSafeImages(settings.backgroundImages);

    await prisma.selfOrderSettings.update({
      where: { id: settings.id },
      data: {
        backgroundImages: [...existingImages, ...uploadedUrls],
      },
    });

    res.status(201).json({
      success: true,
      images: uploadedUrls,
    });
  } catch (error) { next(error); }
};

const removeBackgroundImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body || {};
    if (!imageUrl) {
      throw new AppError('imageUrl is required', 400);
    }

    const settings = await getOrCreateSettings();
    const existingImages = toSafeImages(settings.backgroundImages);

    if (!existingImages.includes(imageUrl)) {
      throw new AppError('Background image not found', 404);
    }

    const updatedImages = existingImages.filter((img) => img !== imageUrl);

    await prisma.selfOrderSettings.update({
      where: { id: settings.id },
      data: { backgroundImages: updatedImages },
    });

    // Best-effort local file cleanup for uploaded assets.
    try {
      const parsed = new URL(imageUrl);
      const pathname = parsed.pathname || '';
      if (pathname.startsWith('/uploads/self-order-backgrounds/')) {
        const filename = path.basename(pathname);
        const filePath = path.join(process.cwd(), 'uploads', 'self-order-backgrounds', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      // Ignore file delete errors to avoid blocking settings updates.
    }

    res.json({
      success: true,
      data: {
        backgroundImages: updatedImages,
      },
    });
  } catch (error) { next(error); }
};

const generateTokensForAllTables = async (req, res, next) => {
  try {
    const tables = await prisma.table.findMany({
      where: { isActive: true },
      orderBy: { tableNumber: 'asc' },
      select: { id: true, tableNumber: true },
    });

    const latestOpenSessionId = await getLatestOpenSessionId();

    for (const table of tables) {
      const existing = await prisma.selfOrderToken.findFirst({
        where: { tableId: table.id, isPermanent: true },
      });

      if (existing) {
        const expectedUrl = buildSelfOrderUrl(req, existing.token);
        if (existing.url !== expectedUrl) {
          await prisma.selfOrderToken.update({
            where: { id: existing.id },
            data: { url: expectedUrl },
          });
        }
        continue;
      }

      const token = await createUniquePermanentToken();
      await prisma.selfOrderToken.create({
        data: {
          token,
          tableId: table.id,
          sessionId: latestOpenSessionId,
          isPermanent: true,
          isUsed: false,
          url: buildSelfOrderUrl(req, token),
        },
      });
    }

    const tokens = await mapPermanentTokens(req);
    res.status(201).json({ success: true, tokens });
  } catch (error) { next(error); }
};

const getAllTableTokens = async (req, res, next) => {
  try {
    const tokens = await mapPermanentTokens(req);
    res.json({ success: true, tokens });
  } catch (error) { next(error); }
};

const regenerateTokenForTable = async (req, res, next) => {
  try {
    const tableId = parseInt(req.params.tableId, 10);
    if (Number.isNaN(tableId)) throw new AppError('Invalid table id', 400);

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true, tableNumber: true, isActive: true },
    });

    if (!table || !table.isActive) {
      throw new AppError('Active table not found', 404);
    }

    const token = await createUniquePermanentToken();
    const url = buildSelfOrderUrl(req, token);
    const latestOpenSessionId = await getLatestOpenSessionId();
    const existing = await prisma.selfOrderToken.findFirst({
      where: { tableId, isPermanent: true },
    });

    let record;
    if (existing) {
      record = await prisma.selfOrderToken.update({
        where: { id: existing.id },
        data: {
          token,
          url,
          expiresAt: null,
          isUsed: false,
          sessionId: latestOpenSessionId,
        },
      });
    } else {
      record = await prisma.selfOrderToken.create({
        data: {
          token,
          url,
          tableId,
          sessionId: latestOpenSessionId,
          isPermanent: true,
          isUsed: false,
        },
      });
    }

    res.status(201).json({
      success: true,
      token: {
        tableId,
        tableName: `Table ${table.tableNumber}`,
        token: record.token,
        url: record.url || url,
      },
    });
  } catch (error) { next(error); }
};

const downloadQrPdf = async (req, res, next) => {
  try {
    let tokens = await mapPermanentTokens(req);
    if (!tokens.length) {
      const tables = await prisma.table.findMany({
        where: { isActive: true },
        orderBy: { tableNumber: 'asc' },
        select: { id: true },
      });
      const latestOpenSessionId = await getLatestOpenSessionId();

      for (const table of tables) {
        const token = await createUniquePermanentToken();
        await prisma.selfOrderToken.create({
          data: {
            token,
            tableId: table.id,
            sessionId: latestOpenSessionId,
            isPermanent: true,
            isUsed: false,
            url: buildSelfOrderUrl(req, token),
          },
        });
      }

      tokens = await mapPermanentTokens(req);
    }

    if (!tokens.length) {
      throw new AppError('No active tables available to generate QR codes', 400);
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="table-qr-codes.pdf"');

    doc.pipe(res);
    doc.fontSize(18).font('Helvetica-Bold').text('Self Ordering QR Codes', { align: 'center' });
    doc.moveDown(0.6);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.2);

    for (let i = 0; i < tokens.length; i += 1) {
      const item = tokens[i];
      const qrDataUrl = await QRCode.toDataURL(item.url, { width: 220, margin: 1 });
      const qrBase64 = qrDataUrl.split(',')[1];
      const qrBuffer = Buffer.from(qrBase64, 'base64');

      if (i > 0) doc.addPage();

      doc.fontSize(20).fillColor('#111111').font('Helvetica-Bold').text(item.tableName, 40, 50);
      doc.image(qrBuffer, 160, 120, { width: 280, height: 280 });
      doc.moveDown(19);
      doc.fontSize(12).fillColor('#333333').font('Helvetica').text(item.url, { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(10).fillColor('#666666').text('Scan this QR on mobile will open a URL in mobile browser', {
        align: 'center',
      });
    }

    doc.end();
  } catch (error) { next(error); }
};

const validateTokenAndGetInfo = async (req, res, next) => {
  try {
    const tokenRecord = await validateToken(req.params.token);
    const settings = await getOrCreateSettings();
    const activeSession = await prisma.posSession.findFirst({
      where: { status: 'open' },
      orderBy: { openedAt: 'desc' },
      select: { id: true },
    });

    res.json({
      success: true,
      valid: true,
      tableId: tokenRecord.tableId,
      tableName: `Table ${tokenRecord.table.tableNumber}`,
      sessionId: tokenRecord.sessionId || activeSession?.id || null,
      mode: settings.mode,
      payAtCounter: true,
      backgroundColor: settings.backgroundColor || '#95416a',
      backgroundImages: toSafeImages(settings.backgroundImages),
    });
  } catch (error) { next(error); }
};

const getPageSettings = async (req, res, next) => {
  try {
    const tokenRecord = await validateToken(req.params.token);
    const settings = await getOrCreateSettings();

    res.json({
      success: true,
      data: normalizePageSettings(req, tokenRecord, settings),
    });
  } catch (error) { next(error); }
};

/** POST /api/self-order/generate-token — Auth required */
const generateToken = async (req, res, next) => {
  try {
    const { tableId, sessionId } = req.body;

    // Validate session is open
    const session = await prisma.posSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'open') {
      throw new AppError('Session is not open', 400);
    }

    // Validate table exists
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) throw new AppError('Table not found', 404);

    // Generate unique token
    const token = uuidv4();

    // Set expiry to 4 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);

    const tokenRecord = await prisma.selfOrderToken.create({
      data: {
        token,
        tableId,
        sessionId,
        expiresAt,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        token: tokenRecord.token,
        tableId,
        sessionId,
        expiresAt: tokenRecord.expiresAt,
        selfOrderUrl: `/self-order?token=${tokenRecord.token}`,
      },
    });
  } catch (error) { next(error); }
};

/** GET /api/self-order/session/:token — No auth */
const getSession = async (req, res, next) => {
  try {
    const tokenRecord = await validateToken(req.params.token);
    const settings = await getOrCreateSettings();
    const activeSession = await prisma.posSession.findFirst({
      where: { status: 'open' },
      orderBy: { openedAt: 'desc' },
      select: { id: true, terminalName: true },
    });

    res.json({
      success: true,
      data: {
        tableId: tokenRecord.tableId,
        tableNumber: tokenRecord.table.tableNumber,
        sessionId: tokenRecord.sessionId || activeSession?.id || null,
        terminalName: tokenRecord.session?.terminalName || activeSession?.terminalName || null,
        mode: settings.mode,
      },
    });
  } catch (error) { next(error); }
};

/** GET /api/self-order/products/:token — No auth */
const getProducts = async (req, res, next) => {
  try {
    // Validate the token first
    await validateToken(req.params.token);

    const categoriesRaw = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true },
    });

    const categories = categoriesRaw.map((category, index) => ({
      id: category.id,
      name: category.name,
      color: DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length],
    }));

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        variants: { where: { isActive: true } },
      },
      orderBy: { name: 'asc' },
    });

    const mappedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      categoryId: product.categoryId,
      image: null,
      emoji: '🍽️',
      variants: product.variants.map((variant) => ({
        id: variant.id,
        attribute: variant.attribute,
        value: variant.value,
        extraPrice: Number(variant.extraPrice),
      })),
      addons: [
        { id: 1, name: 'Extra Cheese', price: 1.0 },
        { id: 2, name: 'Extra Sausage', price: 1.5 },
        { id: 3, name: 'Wheat Bun', price: 0.5 },
      ],
    }));

    res.json({ success: true, categories, products: mappedProducts });
  } catch (error) { next(error); }
};

/** POST /api/self-order/place-order/:token — No auth */
const placeOrder = async (req, res, next) => {
  try {
    const tokenRecord = await validateToken(req.params.token);
    const settings = await getOrCreateSettings();

    if (!settings.isEnabled) {
      throw new AppError('Self ordering is disabled', 400);
    }
    if (settings.mode !== 'online_ordering') {
      throw new AppError('Ordering is disabled in QR Menu mode', 400);
    }

    let sessionId = tokenRecord.sessionId;
    if (!sessionId) {
      const activeSession = await prisma.posSession.findFirst({
        where: { status: 'open' },
        orderBy: { openedAt: 'desc' },
        select: { id: true },
      });

      sessionId = activeSession?.id || null;
    }

    if (!sessionId) {
      throw new AppError('No active POS session found', 400);
    }

    const { items, customerName } = req.body;

    // Fetch product details for pricing
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    });

    const productMap = {};
    products.forEach((p) => { productMap[p.id] = p; });

    // Build order items with prices
    const orderItems = items.map((item) => {
      const product = productMap[item.productId];
      if (!product) throw new AppError(`Product ${item.productId} not found or inactive`, 400);

      const variantId = item.variantId || null;
      const variant = variantId ? product.variants.find((v) => v.id === variantId) : null;
      const unitPrice = item.unitPrice || (Number(product.price) + Number(variant?.extraPrice || 0));

      return {
        productId: item.productId,
        variantId,
        quantity: item.quantity,
        unitPrice: Number(unitPrice),
        notes: item.notes || '',
      };
    });

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    for (const item of orderItems) {
      const product = productMap[item.productId];
      const lineTotal = item.quantity * Number(item.unitPrice);
      subtotal += lineTotal;
      taxAmount += lineTotal * (Number(product.taxPercent) / 100);
    }
    const totalAmount = subtotal + taxAmount;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        sessionId,
        tableId: tokenRecord.tableId,
        selfOrderTokenId: tokenRecord.id,
        orderType: 'self_order',
        status: 'sent_to_kitchen',
        notes: customerName ? `Customer: ${customerName}` : null,
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        items: { create: orderItems },
      },
      include: { items: { include: { product: { select: { id: true, name: true, sendToKitchen: true } } } } },
    });

    // Mark table as occupied
    await prisma.table.update({
      where: { id: tokenRecord.tableId },
      data: { status: 'occupied' },
    });

    // Create kitchen ticket for items where sendToKitchen = true
    const kitchenItems = order.items.filter((item) => item.product.sendToKitchen);
    if (kitchenItems.length > 0) {
      const ticket = await prisma.kitchenTicket.create({
        data: {
          orderId: order.id,
          ticketNumber: order.orderNumber,
          stage: 'to_cook',
          items: {
            create: kitchenItems.map((item) => ({
              orderItemId: item.id,
              productName: item.product.name,
              variantInfo: null,
              quantity: item.quantity,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              table: { select: { id: true, tableNumber: true } },
            },
          },
        },
      });

      // Emit to kitchen
      try {
        const io = getIO();
        io.of('/kitchen').emit('new_kitchen_order', ticket);
      } catch (e) { /* socket not available */ }
    }

    if (!tokenRecord.isPermanent) {
      await prisma.selfOrderToken.update({
        where: { id: tokenRecord.id },
        data: { isUsed: true },
      });
    }

    res.status(201).json({
      success: true,
      orderNumber: `#${order.orderNumber}`,
      orderId: order.id,
      tableId: tokenRecord.tableId,
      tableName: `Table ${tokenRecord.table.tableNumber}`,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      message: 'Your order has been placed successfully!',
    });
  } catch (error) { next(error); }
};

const trackOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (Number.isNaN(orderId)) throw new AppError('Invalid order id', 400);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        kitchenTickets: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) throw new AppError('Order not found', 404);

    const ticket = order.kitchenTickets[0] || null;
    const items = (ticket?.items || []).map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      status: item.isPrepared ? 'completed' : ticket?.stage || 'to_cook',
    }));

    res.json({
      success: true,
      orderId: order.id,
      orderNumber: `#${order.orderNumber}`,
      items,
      overallStatus: order.status,
      kitchenStage: ticket?.stage || 'to_cook',
    });
  } catch (error) { next(error); }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const tokenRecord = await validateToken(req.params.token);

    const orders = await prisma.order.findMany({
      where: {
        tableId: tokenRecord.tableId,
        orderType: 'self_order',
      },
      include: {
        kitchenTickets: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { stage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      orders: orders.map((order) => ({
        orderId: order.id,
        orderNumber: `#${order.orderNumber}`,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        kitchenStage: order.kitchenTickets[0]?.stage || 'to_cook',
        createdAt: order.createdAt,
      })),
    });
  } catch (error) { next(error); }
};

module.exports = {
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
};
