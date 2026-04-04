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
  payment: z
    .object({
      method: z.enum(['cash', 'digital', 'upi']).default('digital'),
      amountPaid: z.number().positive(),
      reference: z.string().optional(),
      status: z.enum(['pending', 'confirmed', 'failed', 'refunded']).default('confirmed'),
    })
    .optional(),
});

const updateSettingsSchema = z.object({
  isEnabled: z.boolean(),
  mode: z.enum(['online_ordering', 'qr_menu']),
  payAtCounter: z.boolean().optional().default(true),
  backgroundColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).optional(),
});

const createSelfOrderRazorpayOrderSchema = z.object({
  amount: z.number().positive('Amount is required'),
  currency: z.string().optional().default('INR'),
});

const verifySelfOrderRazorpayPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

module.exports = {
  generateTokenSchema,
  placeOrderSchema,
  updateSettingsSchema,
  createSelfOrderRazorpayOrderSchema,
  verifySelfOrderRazorpayPaymentSchema,
};
