const { z } = require('zod');

const updateStageSchema = z.object({
  stage: z.enum(['to_cook', 'preparing', 'completed']),
});

module.exports = { updateStageSchema };
