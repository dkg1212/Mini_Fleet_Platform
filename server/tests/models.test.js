const mongoose = require('mongoose');

const Ride = require('../src/models/Ride');
const RideHistory = require('../src/models/RideHistory');
const User = require('../src/models/User');

describe('Mongoose models', () => {
  it('compiles the User, Ride, and RideHistory models', () => {
    expect(User.modelName).toBe('User');
    expect(Ride.modelName).toBe('Ride');
    expect(RideHistory.modelName).toBe('RideHistory');
  });

  it('keeps user passwords out of normal JSON responses', () => {
    const user = new User({
      name: 'Test Customer',
      email: 'TEST@EXAMPLE.COM',
      password: 'hashed-password',
      role: 'CUSTOMER'
    });

    const json = user.toJSON();

    expect(json.password).toBeUndefined();
    expect(user.email).toBe('test@example.com');
  });

  it('defines required Ride indexes', () => {
    const indexes = Ride.schema.indexes();

    expect(indexes).toEqual(
      expect.arrayContaining([
        [{ bookingId: 1 }, expect.objectContaining({ unique: true })],
        [{ status: 1 }, expect.any(Object)],
        [{ customerId: 1 }, expect.any(Object)],
        [{ driverId: 1 }, expect.any(Object)],
        [{ requestedTime: 1 }, expect.any(Object)],
        [
          { customerId: 1, idempotencyKey: 1 },
          expect.objectContaining({
            unique: true,
            partialFilterExpression: expect.any(Object)
          })
        ]
      ])
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
});
