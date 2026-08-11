const adminService = require('../services/adminService');

const getMetrics = async (req, res, next) => {
  try {
    const metrics = await adminService.getMetrics();

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await adminService.listUsers(req.query.role);

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetrics,
  listUsers
};
