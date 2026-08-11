const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return process.env.JWT_SECRET;
};

const generateToken = (user) => jwt.sign(
  {
    userId: user.id,
    role: user.role
  },
  getJwtSecret(),
  {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
);

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  generateToken,
  verifyToken
};

