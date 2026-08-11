const { loginUser } = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const data = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};

