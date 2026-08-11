const Ride = require('../models/Ride');
const RideHistory = require('../models/RideHistory');
const AppError = require('../utils/AppError');
const { generateBookingId } = require('../utils/bookingId');
const {
  calculateEstimatedFare,
  isValidStatusTransition
} = require('./rideRulesService');

const DUPLICATE_KEY_ERROR = 11000;
const DRIVER_STATUS_UPDATES = ['DRIVER_ARRIVING', 'STARTED', 'COMPLETED'];

const getId = (value) => value && value.toString();

const createHistory = async ({ rideId, previousStatus, newStatus, changedBy }) => {
  await RideHistory.create({
    rideId,
    previousStatus,
    newStatus,
    changedBy
  });
};

const findExistingIdempotentRide = async (customerId, idempotencyKey) => {
  if (!idempotencyKey) {
    return null;
  }

  return Ride.findOne({ customerId, idempotencyKey });
};

const buildAdminRideQuery = (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.driver) {
    query.driverId = filters.driver;
  }

  if (filters.customer) {
    query.customerId = filters.customer;
  }

  if (filters.dateFrom || filters.dateTo) {
    query.requestedTime = {};

    if (filters.dateFrom) {
      query.requestedTime.$gte = filters.dateFrom;
    }

    if (filters.dateTo) {
      query.requestedTime.$lte = filters.dateTo;
    }
  }

  return query;
};

const createRide = async ({ customerId, rideData, idempotencyKey }) => {
  const existingRide = await findExistingIdempotentRide(customerId, idempotencyKey);

  if (existingRide) {
    return {
      ride: existingRide,
      wasCreated: false
    };
  }

  const estimatedFare = calculateEstimatedFare(rideData.estimatedDistance);

  try {
    const ride = await Ride.create({
      bookingId: generateBookingId(rideData.requestedTime),
      customerId,
      driverId: null,
      pickup: rideData.pickup,
      destination: rideData.destination,
      estimatedDistance: rideData.estimatedDistance,
      estimatedFare,
      status: 'REQUESTED',
      requestedTime: rideData.requestedTime,
      notes: rideData.notes,
      idempotencyKey
    });

    await createHistory({
      rideId: ride._id,
      previousStatus: null,
      newStatus: 'REQUESTED',
      changedBy: customerId
    });

    return {
      ride,
      wasCreated: true
    };
  } catch (error) {
    if (error.code === DUPLICATE_KEY_ERROR && idempotencyKey) {
      const duplicateRide = await findExistingIdempotentRide(customerId, idempotencyKey);

      if (duplicateRide) {
        return {
          ride: duplicateRide,
          wasCreated: false
        };
      }
    }

    throw error;
  }
};

const listRides = async (user, filters = {}) => {
  if (user.role === 'CUSTOMER') {
    return Ride.find({ customerId: user.id }).sort({ createdAt: -1 });
  }

  if (user.role === 'ADMIN') {
    return Ride.find(buildAdminRideQuery(filters))
      .select('bookingId customerId driverId pickup destination requestedTime estimatedFare status')
      .populate('customerId', 'name email role')
      .populate('driverId', 'name email role')
      .sort({ requestedTime: -1 });
  }

  if (user.role === 'DRIVER') {
    return Ride.find({ driverId: user.id }).sort({ createdAt: -1 });
  }

  throw new AppError(403, 'You are not authorized to access this resource');
};

const listAvailableRides = async (user) => {
  if (user.role !== 'DRIVER') {
    throw new AppError(403, 'Only drivers can view available rides');
  }

  return Ride.find({
    status: 'REQUESTED',
    driverId: null
  })
    .select('bookingId pickup destination requestedTime estimatedFare customerId')
    .populate('customerId', 'name')
    .sort({ requestedTime: 1 });
};

const listAssignedRides = async (user) => {
  if (user.role !== 'DRIVER') {
    throw new AppError(403, 'Only drivers can view assigned rides');
  }

  return Ride.find({ driverId: user.id })
    .populate('customerId', 'name email role')
    .sort({ createdAt: -1 });
};

const getRideById = async ({ rideId, user }) => {
  const query = Ride.findById(rideId);
  const ride = typeof query.populate === 'function'
    ? await query
      .populate('customerId', 'name email role')
      .populate('driverId', 'name email role')
    : await query;

  if (!ride) {
    throw new AppError(404, 'Ride not found');
  }

  if (user.role === 'ADMIN') {
    return ride;
  }

  if (user.role === 'CUSTOMER' && getId(ride.customerId) === user.id) {
    return ride;
  }

  if (user.role === 'DRIVER' && ride.driverId && getId(ride.driverId) === user.id) {
    return ride;
  }

  throw new AppError(403, 'You are not authorized to access this ride');
};

const getRideHistory = async ({ rideId, user }) => {
  await getRideById({ rideId, user });

  return RideHistory.find({ rideId }).sort({ createdAt: 1 });
};

const acceptRide = async ({ rideId, user }) => {
  if (user.role !== 'DRIVER') {
    throw new AppError(403, 'Only drivers can accept rides');
  }

  const ride = await Ride.findOneAndUpdate(
    {
      _id: rideId,
      status: 'REQUESTED',
      driverId: null
    },
    {
      $set: {
        driverId: user.id,
        status: 'ACCEPTED'
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!ride) {
    throw new AppError(409, 'Ride is no longer available.');
  }

  await createHistory({
    rideId: ride._id,
    previousStatus: 'REQUESTED',
    newStatus: 'ACCEPTED',
    changedBy: user.id
  });

  return ride;
};

const updateRideStatus = async ({ rideId, user, nextStatus }) => {
  if (user.role !== 'DRIVER') {
    throw new AppError(403, 'Only drivers can update ride status');
  }

  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(404, 'Ride not found');
  }

  if (!ride.driverId || getId(ride.driverId) !== user.id) {
    throw new AppError(403, 'Only the assigned driver can update this ride');
  }

  if (!DRIVER_STATUS_UPDATES.includes(nextStatus) || !isValidStatusTransition(ride.status, nextStatus)) {
    throw new AppError(409, `Invalid status transition from ${ride.status} to ${nextStatus}`);
  }

  const previousStatus = ride.status;
  ride.status = nextStatus;
  await ride.save();

  await createHistory({
    rideId: ride._id,
    previousStatus,
    newStatus: nextStatus,
    changedBy: user.id
  });

  return ride;
};

const cancelRide = async ({ rideId, user }) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(404, 'Ride not found');
  }

  if (getId(ride.customerId) !== user.id) {
    throw new AppError(403, 'You are not authorized to cancel this ride');
  }

  if (!isValidStatusTransition(ride.status, 'CANCELLED')) {
    throw new AppError(409, 'Ride cannot be cancelled after it has started');
  }

  const previousStatus = ride.status;
  ride.status = 'CANCELLED';
  await ride.save();

  await createHistory({
    rideId: ride._id,
    previousStatus,
    newStatus: 'CANCELLED',
    changedBy: user.id
  });

  return ride;
};

module.exports = {
  acceptRide,
  buildAdminRideQuery,
  cancelRide,
  createRide,
  getRideById,
  getRideHistory,
  listAssignedRides,
  listAvailableRides,
  updateRideStatus,
  listRides
};
