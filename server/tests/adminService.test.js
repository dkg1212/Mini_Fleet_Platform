jest.mock('../src/models/Ride');

const Ride = require('../src/models/Ride');
const adminService = require('../src/services/adminService');

describe('adminService metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('admin can access metrics data from database counts', async () => {
    Ride.countDocuments
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1);
    Ride.aggregate.mockResolvedValue([{ _id: null, total: 1250 }]);

    const metrics = await adminService.getMetrics();

    expect(metrics).toEqual({
      totalRides: 10,
      requestedRides: 2,
      activeRides: 3,
      completedRides: 4,
      cancelledRides: 1,
      completedRevenue: 1250
    });
    expect(Ride.countDocuments).toHaveBeenNthCalledWith(3, {
      status: { $in: ['ACCEPTED', 'DRIVER_ARRIVING', 'STARTED'] }
    });
  });

  it('completed revenue is calculated from completed rides only', async () => {
    Ride.countDocuments.mockResolvedValue(0);
    Ride.aggregate.mockResolvedValue([{ _id: null, total: 530.75 }]);

    const metrics = await adminService.getMetrics();

    expect(metrics.completedRevenue).toBe(530.75);
    expect(Ride.aggregate).toHaveBeenCalledWith([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$estimatedFare' }
        }
      }
    ]);
  });
});
