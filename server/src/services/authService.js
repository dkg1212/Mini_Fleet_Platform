const bcrypt = require('bcryptjs');

const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/jwt');

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  return {
    token: generateToken(user),
    user: formatUser(user)
  };
};

module.exports = {
  loginUser
};
