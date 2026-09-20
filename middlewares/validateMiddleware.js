const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware factory to validate request body/query/params using Joi schemas in NightZone
 * @param {Object} schema - Joi validation schema
 * @param {string} source - 'body' | 'query' | 'params' (default 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));

      return ApiResponse.error(res, 'Validation error', 422, errorDetails);
    }

    req[source] = value;
    next();
  };
};

module.exports = {
  validate
};
