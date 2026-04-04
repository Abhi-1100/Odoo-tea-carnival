const { z } = require('zod');

const reportQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sessionId: z.string().optional(),
  responsibleId: z.string().optional(),
  productId: z.string().optional(),
});

module.exports = { reportQuerySchema };
