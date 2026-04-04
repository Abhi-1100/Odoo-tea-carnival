const { z } = require('zod');

const openSessionSchema = z.object({
  terminalName: z.string().min(1, 'Terminal name is required').max(100),
  openingCash: z.number().min(0).optional().default(0),
});

const closeSessionSchema = z.object({
  closingCash: z.number().min(0, 'Closing cash is required'),
  notes: z.string().optional(),
});

module.exports = { openSessionSchema, closeSessionSchema };
