const express = require('express');

const rideController = require('../controllers/rideController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  adminRideFiltersSchema,
  createRideSchema,
  rideIdParamSchema,
  updateRideStatusSchema
} = require('../validators/rideValidators');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .post(authorize('CUSTOMER'), validateRequest(createRideSchema), rideController.createRide)
  .get(validateRequest(adminRideFiltersSchema, 'query'), rideController.listRides);

router.get('/available', authorize('DRIVER'), rideController.listAvailableRides);
router.get('/assigned', authorize('DRIVER'), rideController.listAssignedRides);
router.get('/:id', validateRequest(rideIdParamSchema, 'params'), rideController.getRide);
router.get('/:id/history', validateRequest(rideIdParamSchema, 'params'), rideController.getRideHistory);
router.post('/:id/accept', validateRequest(rideIdParamSchema, 'params'), authorize('DRIVER'), rideController.acceptRide);
router.patch('/:id/status', validateRequest(rideIdParamSchema, 'params'), authorize('DRIVER'), validateRequest(updateRideStatusSchema), rideController.updateRideStatus);
router.post('/:id/cancel', validateRequest(rideIdParamSchema, 'params'), authorize('CUSTOMER'), rideController.cancelRide);

module.exports = router;
