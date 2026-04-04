const { z } = require('zod');

const createFloorSchema = z.object({
  name: z.string().min(1, 'Floor name is required').max(100),
  isActive: z.boolean().optional().default(true),
});

const updateFloorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createFloorSchema, updateFloorSchema };
