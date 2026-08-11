const { getHealth } = require('../src/controllers/healthController');

const createMockResponse = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe('GET /api/health', () => {
  it('returns the API health response', () => {
    const res = createMockResponse();

    getHealth({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Fleet API is running'
    });
  });
});
