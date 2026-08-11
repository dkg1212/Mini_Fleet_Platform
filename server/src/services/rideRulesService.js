const { RIDE_STATUSES } = require('../utils/rideStatuses');

const STATUS_TRANSITIONS = {
  REQUESTED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['DRIVER_ARRIVING', 'CANCELLED'],
  DRIVER_ARRIVING: ['STARTED', 'CANCELLED'],
  STARTED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
};

const FARE_RULES = {
  baseFare: 100,
  ratePerKm: 15
};

const isValidStatusTransition = (currentStatus, nextStatus) => {
  if (!RIDE_STATUSES.includes(currentStatus) || !RIDE_STATUSES.includes(nextStatus)) {
    return false;
  }

  return STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
};

const calculateEstimatedFare = (estimatedDistance) => {
  const fare = FARE_RULES.baseFare + estimatedDistance * FARE_RULES.ratePerKm;

  return Math.round(fare * 100) / 100;
};

module.exports = {
  FARE_RULES,
  STATUS_TRANSITIONS,
  calculateEstimatedFare,
  isValidStatusTransition
};

