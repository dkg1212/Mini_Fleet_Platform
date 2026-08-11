const Ride = require('../models/Ride');
const User = require('../models/User');

const getMetrics = async () => {
  const [
    totalRides,
    requestedRides,
    activeRides,
    completedRides,
    cancelledRides,
    revenueResult
  ] = await Promise.all([
    Ride.countDocuments({}),
    Ride.countDocuments({ status: 'REQUESTED' }),
    Ride.countDocuments({ status: { $in: ['ACCEPTED', 'DRIVER_ARRIVING', 'STARTED'] } }),
    Ride.countDocuments({ status: 'COMPLETED' }),
    Ride.countDocuments({ status: 'CANCELLED' }),
    Ride.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$estimatedFare' }
        }
      }
    ])
  ]);

  return {
    totalRides,
    requestedRides,
    activeRides,
    completedRides,
    cancelledRides,
    completedRevenue: revenueResult[0]?.total || 0
  };
};

const listUsers = async (role) => {
  const query = role ? { role } : {};

  return User.find(query)
    .select('name email role')
    .sort({ name: 1 });
};

module.exports = {
  getMetrics,
  listUsers
};
