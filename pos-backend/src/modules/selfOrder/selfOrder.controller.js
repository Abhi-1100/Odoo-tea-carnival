const { v4: uuidv4 } = require('uuid');
const prisma = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { getIO } = require('../../config/socket');

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
  if (tokenRecord.isUsed) throw new AppError('This self-order token has already been used', 400);
  if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
    throw new AppError('Self-order token has expired', 400);
  }
  if (tokenRecord.session.status !== 'open') {
    throw new AppError('The POS session is no longer active', 400);
  }

  return tokenRecord;
}

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

    res.json({
      success: true,
      data: {
        tableId: tokenRecord.tableId,
        tableNumber: tokenRecord.table.tableNumber,
        sessionId: tokenRecord.sessionId,
        terminalName: tokenRecord.session.terminalName,
      },
    });
  } catch (error) { next(error); }
};

/** GET /api/self-order/products/:token — No auth */
const getProducts = async (req, res, next) => {
  try {
    // Validate the token first
    await validateToken(req.params.token);

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        variants: { where: { isActive: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: products });
  } catch (error) { next(error); }
};

/** POST /api/self-order/place-order/:token — No auth */
const placeOrder = async (req, res, next) => {
  try {
    const tokenRecord = await validateToken(req.params.token);
    const { items } = req.body;

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

      return {
        productId: item.productId,
        variantId: null,
        quantity: item.quantity,
        unitPrice: Number(product.price),
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
        sessionId: tokenRecord.sessionId,
        tableId: tokenRecord.tableId,
        selfOrderTokenId: tokenRecord.id,
        orderType: 'self_order',
        status: 'sent_to_kitchen',
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

    // Mark token as used
    await prisma.selfOrderToken.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true },
    });

    res.status(201).json({
      success: true,
      orderNumber: order.orderNumber,
      tableId: tokenRecord.tableId,
      status: order.status,
      message: 'Your order has been placed successfully!',
    });
  } catch (error) { next(error); }
};

module.exports = { generateToken, getSession, getProducts, placeOrder };
