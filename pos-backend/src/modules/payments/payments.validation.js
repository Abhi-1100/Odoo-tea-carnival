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

module.exports = { processPaymentSchema, confirmUPISchema };
