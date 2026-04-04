const { z } = require('zod');

const phoneRegex = /^\+?[0-9][0-9\s-]{7,20}$/;

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(100),
  email: z.string().email('Invalid email').max(150).optional().or(z.literal('')),
  phone: z.string().min(8).max(30).regex(phoneRegex, 'Invalid phone number'),
  addressLine1: z.string().max(150).optional(),
  addressLine2: z.string().max(150).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  isActive: z.boolean().optional().default(true),
});

const updateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email').max(150).optional().or(z.literal('')),
  phone: z.string().min(8).max(30).regex(phoneRegex, 'Invalid phone number').optional(),
  addressLine1: z.string().max(150).optional(),
  addressLine2: z.string().max(150).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createCustomerSchema, updateCustomerSchema };
