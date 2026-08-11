const jwt = require('jsonwebtoken');

const { authenticate, authorize } = require('../src/middleware/authMiddleware');
const {
  adminRideFiltersSchema,
  createRideSchema,
  rideIdParamSchema,
  updateRideStatusSchema
} = require('../src/validators/rideValidators');

const runAuthenticate = (authorization) => {
  const req = {
    headers: {}
  };
  const res = {};
  const next = jest.fn();

  if (authorization) {
    req.headers.authorization = authorization;
  }

  authenticate(req, res, next);

  return {
    next,
    req
  };
};

describe('security audit middleware and validation', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('missing JWT is rejected', () => {
    const { next } = runAuthenticate();

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401
    }));
  });

  it('invalid JWT is rejected', () => {
    const { next } = runAuthenticate('Bearer invalid-token');

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401
    }));
  });

  it('expired JWT is rejected', () => {
    const token = jwt.sign(
      {
        userId: '507f1f77bcf86cd799439011',
        role: 'CUSTOMER'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '-1s'
      }
    );

    const { next } = runAuthenticate(`Bearer ${token}`);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401
    }));
  });

  it('wrong role is rejected', () => {
    const req = {
      user: {
        id: '507f1f77bcf86cd799439011',
        role: 'CUSTOMER'
      }
    };
    const next = jest.fn();

    authorize('ADMIN')(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403
    }));
  });

  it('valid JWT sets only server-trusted user identity from token payload', () => {
    const token = jwt.sign(
      {
        userId: '507f1f77bcf86cd799439011',
        role: 'DRIVER'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    const { next, req } = runAuthenticate(`Bearer ${token}`);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({
      id: '507f1f77bcf86cd799439011',
      role: 'DRIVER'
    });
  });

  it('invalid ObjectId is rejected', () => {
    const result = rideIdParamSchema.safeParse({
      id: 'not-an-object-id'
    });

    expect(result.success).toBe(false);
  });

  it('missing fields are rejected', () => {
    const result = createRideSchema.safeParse({
      pickup: 'Tezpur University',
      estimatedDistance: 12,
      requestedTime: '2026-08-12T10:30:00.000Z'
    });

    expect(result.success).toBe(false);
  });

  it('invalid distance is rejected', () => {
    const result = createRideSchema.safeParse({
      pickup: 'Tezpur University',
      destination: 'Tezpur Airport',
      estimatedDistance: -1,
      requestedTime: '2026-08-12T10:30:00.000Z'
    });

    expect(result.success).toBe(false);
  });

  it('invalid date is rejected', () => {
    const result = createRideSchema.safeParse({
      pickup: 'Tezpur University',
      destination: 'Tezpur Airport',
      estimatedDistance: 12,
      requestedTime: 'not-a-date'
    });

    expect(result.success).toBe(false);
  });

  it('invalid status is rejected', () => {
    const result = updateRideStatusSchema.safeParse({
      status: 'FLYING'
    });

    expect(result.success).toBe(false);
  });

  it('invalid admin filter ObjectId is rejected', () => {
    const result = adminRideFiltersSchema.safeParse({
      driver: 'bad-id'
    });

    expect(result.success).toBe(false);
  });

  it('invalid admin date range is rejected', () => {
    const result = adminRideFiltersSchema.safeParse({
      dateFrom: '2026-08-12',
      dateTo: '2026-08-01'
    });

    expect(result.success).toBe(false);
  });
});
