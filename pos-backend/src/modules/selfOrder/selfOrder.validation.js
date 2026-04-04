const { z } = require('zod');

const generateTokenSchema = z.object({
  tableId: z.number().int().positive('Table ID is required'),
  sessionId: z.number().int().positive('Session ID is required'),
});

const selfOrderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().optional().default(''),
});

const placeOrderSchema = z.object({
  items: z.array(selfOrderItemSchema).min(1, 'At least one item is required'),
});

module.exports = { generateTokenSchema, placeOrderSchema };
