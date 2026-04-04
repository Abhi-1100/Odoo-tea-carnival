const { z } = require('zod');

const generateTokenSchema = z.object({
  tableId: z.number().int().positive('Table ID is required'),
  sessionId: z.number().int().positive('Session ID is required'),
});

const selfOrderItemSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().nullable().optional(),
  addons: z.array(z.number().int().positive()).optional().default([]),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().positive().optional(),
  notes: z.string().optional().default(''),
});

const placeOrderSchema = z.object({
  customerName: z.string().max(100).optional().default(''),
  items: z.array(selfOrderItemSchema).min(1, 'At least one item is required'),
  totalAmount: z.number().positive().optional(),
});

const updateSettingsSchema = z.object({
  isEnabled: z.boolean(),
  mode: z.enum(['online_ordering', 'qr_menu']),
  payAtCounter: z.boolean().optional().default(true),
  backgroundColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).optional(),
});

module.exports = { generateTokenSchema, placeOrderSchema, updateSettingsSchema };
