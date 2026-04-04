const { z } = require('zod');

const variantSchema = z.object({
  attribute: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  extraPrice: z.number().min(0).default(0),
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(150),
  categoryId: z.number().int().positive().optional().nullable(),
  price: z.number().positive('Price must be positive'),
  unit: z.string().max(50).optional().default('piece'),
  taxPercent: z.number().min(0).max(100).optional().default(0),
  description: z.string().optional(),
  sendToKitchen: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  variants: z.array(variantSchema).optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  price: z.number().positive().optional(),
  unit: z.string().max(50).optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  sendToKitchen: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(variantSchema).optional(),
});

module.exports = { createProductSchema, updateProductSchema };
