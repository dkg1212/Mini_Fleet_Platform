const AppError = require('../utils/AppError');

const validateRequest = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return next(new AppError(400, result.error.errors[0].message));
  }

  req[source] = result.data;
  return next();
};

module.exports = validateRequest;
