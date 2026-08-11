const { authorize } = require('../src/middleware/authMiddleware');

const runAuthorize = (role) => {
  const req = {
    user: {
      id: '507f1f77bcf86cd799439011',
      role
    }
  };
  const res = {};
  const next = jest.fn();

  authorize('ADMIN')(req, res, next);

  return next;
};

describe('admin authorization', () => {
  it('allows admin to access metrics', () => {
    const next = runAuthorize('ADMIN');

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects customer from admin metrics', () => {
    const next = runAuthorize('CUSTOMER');

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403
    }));
  });

  it('rejects driver from admin metrics', () => {
    const next = runAuthorize('DRIVER');

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403
    }));
  });
});
