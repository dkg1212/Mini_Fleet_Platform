const rideService = require('../services/rideService');

const createRide = async (req, res, next) => {
  try {
    const { ride, wasCreated } = await rideService.createRide({
      customerId: req.user.id,
      rideData: req.body,
      idempotencyKey: req.headers['idempotency-key']
    });

    res.status(wasCreated ? 201 : 200).json({
      success: true,
      message: wasCreated ? 'Ride created successfully' : 'Ride already exists for this idempotency key',
      data: { ride }
    });
  } catch (error) {
    next(error);
  }
};

const listRides = async (req, res, next) => {
  try {
    const rides = await rideService.listRides(req.user, req.query);

    res.status(200).json({
      success: true,
      message: 'Rides retrieved successfully',
      data: { rides }
    });
  } catch (error) {
    next(error);
  }
};

const listAvailableRides = async (req, res, next) => {
  try {
    const rides = await rideService.listAvailableRides(req.user);

    res.status(200).json({
      success: true,
      message: 'Available rides retrieved successfully',
      data: { rides }
    });
  } catch (error) {
    next(error);
  }
};

const listAssignedRides = async (req, res, next) => {
  try {
    const rides = await rideService.listAssignedRides(req.user);

    res.status(200).json({
      success: true,
      message: 'Assigned rides retrieved successfully',
      data: { rides }
    });
  } catch (error) {
    next(error);
  }
};

const getRide = async (req, res, next) => {
  try {
    const ride = await rideService.getRideById({
      rideId: req.params.id,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Ride retrieved successfully',
      data: { ride }
    });
  } catch (error) {
    next(error);
  }
};

const getRideHistory = async (req, res, next) => {
  try {
    const history = await rideService.getRideHistory({
      rideId: req.params.id,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Ride history retrieved successfully',
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};

const acceptRide = async (req, res, next) => {
  try {
    const ride = await rideService.acceptRide({
      rideId: req.params.id,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Ride accepted successfully',
      data: { ride }
    });
  } catch (error) {
    next(error);
  }
};

const updateRideStatus = async (req, res, next) => {
  try {
    const ride = await rideService.updateRideStatus({
      rideId: req.params.id,
      user: req.user,
      nextStatus: req.body.status
    });

    res.status(200).json({
      success: true,
      message: 'Ride status updated successfully',
      data: { ride }
    });
  } catch (error) {
    next(error);
  }
};

const cancelRide = async (req, res, next) => {
  try {
    const ride = await rideService.cancelRide({
      rideId: req.params.id,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully',
      data: { ride }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  acceptRide,
  cancelRide,
  createRide,
  getRide,
  getRideHistory,
  listAssignedRides,
  listAvailableRides,
  listRides,
  updateRideStatus
};
