const { z } = require('zod');

const processPaymentSchema = z.object({
  orderId: z.number().int().positive('Order ID is required'),
  method: z.enum(['cash', 'digital', 'upi']),
  amountPaid: z.number().positive('Amount paid is required'),
  upiRef: z.string().optional(),
});

const confirmUPISchema = z.object({
  orderId: z.number().int().positive('Order ID is required'),
  upiRef: z.string().min(1, 'UPI reference is required'),
});

const createRazorpayOrderSchema = z.object({
  amount: z.number().positive('Amount is required'),
  currency: z.string().optional().default('INR'),
  receipt: z.string().optional(),
});

const verifyRazorpayPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

module.exports = {
  processPaymentSchema,
  confirmUPISchema,
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
};
