const { z } = require('zod');

const toggleSchema = z.object({});

const upiSchema = z.object({
  upiId: z.string().min(1, 'UPI ID is required').max(100),
});

module.exports = { toggleSchema, upiSchema };
