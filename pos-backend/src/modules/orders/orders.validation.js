const { z } = require('zod');

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().positive(),
  notes: z.string().optional().default(''),
});

const createOrderSchema = z.object({
  sessionId: z.number().int().positive('Session ID is required'),
  tableId: z.number().int().positive().optional().nullable(),
  customerId: z.number().int().positive().optional().nullable(),
  orderType: z.enum(['dine_in', 'self_order', 'takeaway']).optional().default('dine_in'),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

const updateOrderSchema = z.object({
  tableId: z.number().int().positive().optional().nullable(),
  orderType: z.enum(['dine_in', 'self_order', 'takeaway']).optional(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'confirmed', 'sent_to_kitchen', 'completed', 'cancelled']),
});

module.exports = { createOrderSchema, updateOrderSchema, updateStatusSchema };
