const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { login } = require('../src/controllers/authController');
const { authenticate, authorize } = require('../src/middleware/authMiddleware');
const User = require('../src/models/User');

jest.mock('../src/models/User');

const createMockResponse = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

const mockFindUser = (user) => {
  User.findOne.mockReturnValue({
    select: jest.fn().mockResolvedValue(user)
  });
};

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    jest.clearAllMocks();
  });

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('Customer@123', 10);
    const req = {
      body: {
        email: 'customer@example.com',
        password: 'Customer@123'
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    mockFindUser({
      id: '507f1f77bcf86cd799439011',
      name: 'Customer User',
      email: 'customer@example.com',
      password: passwordHash,
      role: 'CUSTOMER'
    });

    await login(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    const responseBody = res.json.mock.calls[0][0];

    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe('Login successful');
    expect(responseBody.data.user).toEqual({
      id: '507f1f77bcf86cd799439011',
      name: 'Customer User',
      email: 'customer@example.com',
      role: 'CUSTOMER'
    });
    expect(responseBody.data.user.password).toBeUndefined();

    const decoded = jwt.verify(responseBody.data.token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe('507f1f77bcf86cd799439011');
    expect(decoded.role).toBe('CUSTOMER');
  });

  it('rejects a wrong password', async () => {
    const passwordHash = await bcrypt.hash('Customer@123', 10);
    const req = {
      body: {
        email: 'customer@example.com',
        password: 'WrongPassword'
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    mockFindUser({
      id: '507f1f77bcf86cd799439011',
      name: 'Customer User',
      email: 'customer@example.com',
      password: passwordHash,
      role: 'CUSTOMER'
    });

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401
    }));
  });

  it('rejects an unknown user', async () => {
    const req = {
      body: {
        email: 'unknown@example.com',
        password: 'Customer@123'
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    mockFindUser(null);

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401
    }));
  });
});

describe('auth middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('rejects a missing token', () => {
    const req = { headers: {} };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401
    }));
  });

  it('rejects an invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token'
      }
    };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401
    }));
  });

  it('rejects an expired token', () => {
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
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401
    }));
  });

  it('rejects an authenticated user with the wrong role', () => {
    const req = {
      user: {
        id: '507f1f77bcf86cd799439011',
        role: 'DRIVER'
      }
    };
    const next = jest.fn();

    authorize('CUSTOMER')(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403
    }));
  });
});
