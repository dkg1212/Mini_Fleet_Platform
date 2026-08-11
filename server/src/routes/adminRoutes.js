const express = require('express');

const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { adminUsersQuerySchema } = require('../validators/adminValidators');

const router = express.Router();

router.get('/metrics', authenticate, authorize('ADMIN'), adminController.getMetrics);
router.get(
  '/users',
  authenticate,
  authorize('ADMIN'),
  validateRequest(adminUsersQuerySchema, 'query'),
  adminController.listUsers
);

module.exports = router;
