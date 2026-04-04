const { z } = require('zod');

const updateStageSchema = z.object({
  stage: z.enum(['to_cook', 'preparing', 'completed']),
});

const markItemPreparedSchema = z.object({
  isPrepared: z.boolean().optional().default(true),
});

module.exports = { updateStageSchema, markItemPreparedSchema };
