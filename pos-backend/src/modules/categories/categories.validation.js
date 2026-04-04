const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#(?:[0-9a-f]{3}){1,2}$/i, 'Invalid hex color').optional().default('#0891B2'),
  isActive: z.boolean().optional().default(true),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#(?:[0-9a-f]{3}){1,2}$/i, 'Invalid hex color').optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
