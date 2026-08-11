const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(404, 'Route not found'));
};

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let errorMessage = error.message;

  if (error.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid resource ID';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation failed';
  }

  if (error.code === 11000) {
    statusCode = 409;
    errorMessage = 'Duplicate resource';
  }

  const message = statusCode === 500
    ? 'Internal server error'
    : errorMessage;

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  errorHandler,
  notFound
};
