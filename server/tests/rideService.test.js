const AppError = require('../src/utils/AppError');

jest.mock('../src/models/Ride');
jest.mock('../src/models/RideHistory');
jest.mock('../src/utils/bookingId', () => ({
  generateBookingId: jest.fn(() => 'FLT-20260812-ABCD')
}));

const Ride = require('../src/models/Ride');
const RideHistory = require('../src/models/RideHistory');
const rideService = require('../src/services/rideService');

const customerId = '507f1f77bcf86cd799439011';
const otherCustomerId = '507f1f77bcf86cd799439012';
const driverOneId = '507f1f77bcf86cd799439013';
const driverTwoId = '507f1f77bcf86cd799439014';

const createRideData = {
  pickup: 'Tezpur University',
  destination: 'Tezpur Airport',
  estimatedDistance: 12,
  requestedTime: new Date('2026-08-12T10:30:00.000Z'),
  notes: 'Please call when arriving'
};

const buildRide = (overrides = {}) => ({
  _id: 'ride-id-1',
  bookingId: 'FLT-20260812-ABCD',
  customerId,
  driverId: null,
  pickup: 'Tezpur University',
  destination: 'Tezpur Airport',
  estimatedDistance: 12,
  estimatedFare: 280,
  status: 'REQUESTED',
  requestedTime: new Date('2026-08-12T10:30:00.000Z'),
  save: jest.fn().mockResolvedValue(undefined),
  ...overrides
});

describe('rideService customer ride APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('customer creates a valid ride', async () => {
    const createdRide = buildRide();

    Ride.findOne.mockResolvedValue(null);
    Ride.create.mockResolvedValue(createdRide);
    RideHistory.create.mockResolvedValue({});

    const result = await rideService.createRide({
      customerId,
      rideData: createRideData,
      idempotencyKey: 'unique-value'
    });

    expect(result.ride).toBe(createdRide);
    expect(result.wasCreated).toBe(true);
    expect(Ride.create).toHaveBeenCalledWith(expect.objectContaining({
      bookingId: 'FLT-20260812-ABCD',
      customerId,
      status: 'REQUESTED',
      estimatedFare: 280,
      idempotencyKey: 'unique-value'
    }));
    expect(RideHistory.create).toHaveBeenCalledWith({
      rideId: createdRide._id,
      previousStatus: null,
      newStatus: 'REQUESTED',
      changedBy: customerId
    });
  });

  it('missing required field is rejected by create ride validation', () => {
    const { createRideSchema } = require('../src/validators/rideValidators');

    const result = createRideSchema.safeParse({
      destination: 'Tezpur Airport',
      estimatedDistance: 12,
      requestedTime: '2026-08-12T10:30:00.000Z'
    });

    expect(result.success).toBe(false);
  });

  it('invalid distance is rejected by create ride validation', () => {
    const { createRideSchema } = require('../src/validators/rideValidators');

    const result = createRideSchema.safeParse({
      pickup: 'Tezpur University',
      destination: 'Tezpur Airport',
      estimatedDistance: 0,
      requestedTime: '2026-08-12T10:30:00.000Z'
    });

    expect(result.success).toBe(false);
  });

  it('calculates fare correctly when creating a ride', async () => {
    Ride.findOne.mockResolvedValue(null);
    Ride.create.mockResolvedValue(buildRide());
    RideHistory.create.mockResolvedValue({});

    await rideService.createRide({
      customerId,
      rideData: {
        ...createRideData,
        estimatedDistance: 12.345
      },
      idempotencyKey: undefined
    });

    expect(Ride.create).toHaveBeenCalledWith(expect.objectContaining({
      estimatedFare: 285.18
    }));
  });

  it('customer cannot access another customer ride', async () => {
    Ride.findById.mockResolvedValue(buildRide({ customerId: otherCustomerId }));

    await expect(rideService.getRideById({
      rideId: 'ride-id-1',
      user: {
        id: customerId,
        role: 'CUSTOMER'
      }
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 403
    }));
  });

  it('customer can see own ride history', async () => {
    const ride = buildRide();
    const history = [
      {
        rideId: ride._id,
        previousStatus: null,
        newStatus: 'REQUESTED',
        changedBy: customerId
      }
    ];
    const sort = jest.fn().mockResolvedValue(history);

    Ride.findById.mockResolvedValue(ride);
    RideHistory.find.mockReturnValue({ sort });

    const result = await rideService.getRideHistory({
      rideId: ride._id,
      user: {
        id: customerId,
        role: 'CUSTOMER'
      }
    });

    expect(result).toEqual(history);
    expect(RideHistory.find).toHaveBeenCalledWith({ rideId: ride._id });
    expect(sort).toHaveBeenCalledWith({ createdAt: 1 });
  });

  it('customer cannot see another customer ride history', async () => {
    Ride.findById.mockResolvedValue(buildRide({ customerId: otherCustomerId }));

    await expect(rideService.getRideHistory({
      rideId: 'ride-id-1',
      user: {
        id: customerId,
        role: 'CUSTOMER'
      }
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 403
    }));

    expect(RideHistory.find).not.toHaveBeenCalled();
  });

  it('customer can cancel before STARTED', async () => {
    const ride = buildRide({ status: 'DRIVER_ARRIVING' });

    Ride.findById.mockResolvedValue(ride);
    RideHistory.create.mockResolvedValue({});

    const cancelledRide = await rideService.cancelRide({
      rideId: 'ride-id-1',
      user: {
        id: customerId,
        role: 'CUSTOMER'
      }
    });

    expect(cancelledRide.status).toBe('CANCELLED');
    expect(ride.save).toHaveBeenCalled();
    expect(RideHistory.create).toHaveBeenCalledWith({
      rideId: ride._id,
      previousStatus: 'DRIVER_ARRIVING',
      newStatus: 'CANCELLED',
      changedBy: customerId
    });
  });

  it('customer cannot cancel STARTED ride', async () => {
    Ride.findById.mockResolvedValue(buildRide({ status: 'STARTED' }));

    await expect(rideService.cancelRide({
      rideId: 'ride-id-1',
      user: {
        id: customerId,
        role: 'CUSTOMER'
      }
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 409
    }));
  });

  it('completed ride cannot be cancelled', async () => {
    Ride.findById.mockResolvedValue(buildRide({ status: 'COMPLETED' }));

    await expect(rideService.cancelRide({
      rideId: 'ride-id-1',
      user: {
        id: customerId,
        role: 'CUSTOMER'
      }
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 409
    }));
  });

  it('duplicate idempotency key does not create a second booking', async () => {
    const existingRide = buildRide({ idempotencyKey: 'unique-value' });

    Ride.findOne.mockResolvedValue(existingRide);

    const result = await rideService.createRide({
      customerId,
      rideData: createRideData,
      idempotencyKey: 'unique-value'
    });

    expect(result.ride).toBe(existingRide);
    expect(result.wasCreated).toBe(false);
    expect(Ride.create).not.toHaveBeenCalled();
    expect(RideHistory.create).not.toHaveBeenCalled();
  });

  it('uses AppError for customer ownership failures', async () => {
    Ride.findById.mockResolvedValue(buildRide({ customerId: otherCustomerId }));

    await expect(rideService.cancelRide({
      rideId: 'ride-id-1',
      user: {
        id: customerId,
        role: 'CUSTOMER'
      }
    })).rejects.toBeInstanceOf(AppError);
  });
});

describe('rideService driver ride APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('driver can see available ride', async () => {
    const availableRide = buildRide({
      customerId: {
        name: 'Customer User'
      }
    });
    const sort = jest.fn().mockResolvedValue([availableRide]);
    const populate = jest.fn(() => ({ sort }));
    const select = jest.fn(() => ({ populate }));

    Ride.find.mockReturnValue({ select });

    const rides = await rideService.listAvailableRides({
      id: driverOneId,
      role: 'DRIVER'
    });

    expect(rides).toEqual([availableRide]);
    expect(Ride.find).toHaveBeenCalledWith({
      status: 'REQUESTED',
      driverId: null
    });
    expect(select).toHaveBeenCalledWith('bookingId pickup destination requestedTime estimatedFare customerId');
    expect(populate).toHaveBeenCalledWith('customerId', 'name');
  });

  it('non-driver cannot accept', async () => {
    await expect(rideService.acceptRide({
      rideId: 'ride-id-1',
      user: {
        id: customerId,
        role: 'CUSTOMER'
      }
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 403
    }));

    expect(Ride.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('driver can accept', async () => {
    const acceptedRide = buildRide({
      driverId: driverOneId,
      status: 'ACCEPTED'
    });

    Ride.findOneAndUpdate.mockResolvedValue(acceptedRide);
    RideHistory.create.mockResolvedValue({});

    const ride = await rideService.acceptRide({
      rideId: 'ride-id-1',
      user: {
        id: driverOneId,
        role: 'DRIVER'
      }
    });

    expect(ride).toBe(acceptedRide);
    expect(Ride.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: 'ride-id-1',
        status: 'REQUESTED',
        driverId: null
      },
      {
        $set: {
          driverId: driverOneId,
          status: 'ACCEPTED'
        }
      },
      {
        new: true,
        runValidators: true
      }
    );
    expect(RideHistory.create).toHaveBeenCalledWith({
      rideId: acceptedRide._id,
      previousStatus: 'REQUESTED',
      newStatus: 'ACCEPTED',
      changedBy: driverOneId
    });
  });

  it('second driver cannot accept same ride', async () => {
    const acceptedRide = buildRide({
      driverId: driverOneId,
      status: 'ACCEPTED'
    });

    Ride.findOneAndUpdate
      .mockResolvedValueOnce(acceptedRide)
      .mockResolvedValueOnce(null);
    RideHistory.create.mockResolvedValue({});

    const results = await Promise.allSettled([
      rideService.acceptRide({
        rideId: 'ride-id-1',
        user: {
          id: driverOneId,
          role: 'DRIVER'
        }
      }),
      rideService.acceptRide({
        rideId: 'ride-id-1',
        user: {
          id: driverTwoId,
          role: 'DRIVER'
        }
      })
    ]);

    const successes = results.filter((result) => result.status === 'fulfilled');
    const conflicts = results.filter((result) => (
      result.status === 'rejected' && result.reason.statusCode === 409
    ));

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(1);
    expect(successes[0].value.driverId).toBe(driverOneId);
    expect(successes[0].value.status).toBe('ACCEPTED');
    expect(Ride.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(RideHistory.create).toHaveBeenCalledTimes(1);
  });

  it('assigned driver can update status', async () => {
    const ride = buildRide({
      driverId: driverOneId,
      status: 'ACCEPTED'
    });

    Ride.findById.mockResolvedValue(ride);
    RideHistory.create.mockResolvedValue({});

    const updatedRide = await rideService.updateRideStatus({
      rideId: 'ride-id-1',
      user: {
        id: driverOneId,
        role: 'DRIVER'
      },
      nextStatus: 'DRIVER_ARRIVING'
    });

    expect(updatedRide.status).toBe('DRIVER_ARRIVING');
    expect(ride.save).toHaveBeenCalled();
    expect(RideHistory.create).toHaveBeenCalledWith({
      rideId: ride._id,
      previousStatus: 'ACCEPTED',
      newStatus: 'DRIVER_ARRIVING',
      changedBy: driverOneId
    });
  });

  it('another driver cannot update that ride', async () => {
    Ride.findById.mockResolvedValue(buildRide({
      driverId: driverOneId,
      status: 'ACCEPTED'
    }));

    await expect(rideService.updateRideStatus({
      rideId: 'ride-id-1',
      user: {
        id: driverTwoId,
        role: 'DRIVER'
      },
      nextStatus: 'DRIVER_ARRIVING'
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 403
    }));
  });

  it('invalid transition rejected', async () => {
    Ride.findById.mockResolvedValue(buildRide({
      driverId: driverOneId,
      status: 'ACCEPTED'
    }));

    await expect(rideService.updateRideStatus({
      rideId: 'ride-id-1',
      user: {
        id: driverOneId,
        role: 'DRIVER'
      },
      nextStatus: 'COMPLETED'
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 409
    }));
  });

  it('completed ride cannot change status', async () => {
    Ride.findById.mockResolvedValue(buildRide({
      driverId: driverOneId,
      status: 'COMPLETED'
    }));

    await expect(rideService.updateRideStatus({
      rideId: 'ride-id-1',
      user: {
        id: driverOneId,
        role: 'DRIVER'
      },
      nextStatus: 'STARTED'
    })).rejects.toEqual(expect.objectContaining({
      statusCode: 409
    }));
  });
});

describe('rideService admin ride filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const runAdminList = async (filters) => {
    const rides = [buildRide()];
    const sort = jest.fn().mockResolvedValue(rides);
    const populateDriver = jest.fn(() => ({ sort }));
    const populateCustomer = jest.fn(() => ({ populate: populateDriver }));
    const select = jest.fn(() => ({ populate: populateCustomer }));

    Ride.find.mockReturnValue({ select });

    const result = await rideService.listRides({
      id: '507f1f77bcf86cd799439099',
      role: 'ADMIN'
    }, filters);

    return {
      populateCustomer,
      populateDriver,
      result,
      select,
      sort
    };
  };

  it('status filter works', async () => {
    await runAdminList({ status: 'COMPLETED' });

    expect(Ride.find).toHaveBeenCalledWith({
      status: 'COMPLETED'
    });
  });

  it('driver filter works', async () => {
    await runAdminList({ driver: driverOneId });

    expect(Ride.find).toHaveBeenCalledWith({
      driverId: driverOneId
    });
  });

  it('customer filter works', async () => {
    await runAdminList({ customer: customerId });

    expect(Ride.find).toHaveBeenCalledWith({
      customerId
    });
  });

  it('date filter works', async () => {
    const dateFrom = new Date('2026-08-01T00:00:00.000Z');
    const dateTo = new Date('2026-08-12T00:00:00.000Z');

    await runAdminList({ dateFrom, dateTo });

    expect(Ride.find).toHaveBeenCalledWith({
      requestedTime: {
        $gte: dateFrom,
        $lte: dateTo
      }
    });
  });

  it('admin results include customer and driver details', async () => {
    const { populateCustomer, populateDriver, select } = await runAdminList({});

    expect(select).toHaveBeenCalledWith('bookingId customerId driverId pickup destination requestedTime estimatedFare status');
    expect(populateCustomer).toHaveBeenCalledWith('customerId', 'name email role');
    expect(populateDriver).toHaveBeenCalledWith('driverId', 'name email role');
  });
});
