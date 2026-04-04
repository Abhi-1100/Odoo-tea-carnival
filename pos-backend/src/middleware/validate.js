const { ZodError } = require('zod');

/**
 * Request validation middleware factory using Zod
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Request property to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // Replace with parsed (cleaned) data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          code: 422,
          errors: fieldErrors,
        });
      }
      next(error);
    }
  };
};

module.exports = validate;
