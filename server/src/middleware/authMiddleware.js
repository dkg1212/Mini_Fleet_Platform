const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    return next();
  } catch (error) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'You are not authorized to access this resource'));
  }

  return next();
};

module.exports = {
  authenticate,
  authorize
};
