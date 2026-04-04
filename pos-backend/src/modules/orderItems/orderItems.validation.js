const { z } = require('zod');

const addItemSchema = z.object({
  orderId: z.number().int().positive('Order ID is required'),
  productId: z.number().int().positive('Product ID is required'),
  variantId: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().positive('Unit price is required'),
  notes: z.string().optional().default(''),
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

module.exports = { addItemSchema, updateItemSchema };
