const { z } = require('zod');

const createTableSchema = z.object({
  floorId: z.number().int().positive('Floor ID is required'),
  tableNumber: z.string().min(1, 'Table number is required').max(20),
  seats: z.number().int().positive().optional().default(2),
  isActive: z.boolean().optional().default(true),
  appointmentResource: z.string().max(100).optional().nullable(),
});

const updateTableSchema = z.object({
  floorId: z.number().int().positive().optional(),
  tableNumber: z.string().min(1).max(20).optional(),
  seats: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  appointmentResource: z.string().max(100).optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(['available', 'occupied', 'reserved']),
});

const bulkActionSchema = z.object({
  action: z.enum(['duplicate', 'delete']),
  ids: z.array(z.number().int().positive()).min(1, 'Select at least one table'),
  floorId: z.number().int().positive().optional(),
});

module.exports = { createTableSchema, updateTableSchema, updateStatusSchema, bulkActionSchema };
