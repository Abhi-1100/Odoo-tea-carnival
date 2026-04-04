const { z } = require('zod');

const toggleSchema = z.object({});

const UPI_REGEX = /^[a-zA-Z0-9._-]{2,100}@[a-zA-Z][a-zA-Z0-9.-]{1,80}$/;
const BLOCKED_HANDLES = new Set(['fake', 'test', 'demo', 'example', 'temp', 'invalid']);

const upiSchema = z.object({
  upiId: z
    .string()
    .trim()
    .min(1, 'UPI ID is required')
    .max(120)
    .regex(UPI_REGEX, 'Invalid UPI ID format (use format like name@bank)')
    .refine((value) => {
      const handle = value.split('@')[1]?.toLowerCase() || '';
      return !BLOCKED_HANDLES.has(handle);
    }, 'UPI handle appears invalid'),
});

module.exports = { toggleSchema, upiSchema };
