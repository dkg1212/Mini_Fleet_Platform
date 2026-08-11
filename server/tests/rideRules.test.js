const {
  calculateEstimatedFare,
  isValidStatusTransition
} = require('../src/services/rideRulesService');

describe('ride business rules', () => {
  it('allows valid status transitions', () => {
    expect(isValidStatusTransition('REQUESTED', 'ACCEPTED')).toBe(true);
    expect(isValidStatusTransition('ACCEPTED', 'DRIVER_ARRIVING')).toBe(true);
    expect(isValidStatusTransition('DRIVER_ARRIVING', 'STARTED')).toBe(true);
    expect(isValidStatusTransition('STARTED', 'COMPLETED')).toBe(true);
    expect(isValidStatusTransition('REQUESTED', 'CANCELLED')).toBe(true);
    expect(isValidStatusTransition('ACCEPTED', 'CANCELLED')).toBe(true);
    expect(isValidStatusTransition('DRIVER_ARRIVING', 'CANCELLED')).toBe(true);
  });

  it('rejects invalid status transitions', () => {
    expect(isValidStatusTransition('REQUESTED', 'COMPLETED')).toBe(false);
    expect(isValidStatusTransition('ACCEPTED', 'COMPLETED')).toBe(false);
    expect(isValidStatusTransition('STARTED', 'ACCEPTED')).toBe(false);
    expect(isValidStatusTransition('COMPLETED', 'STARTED')).toBe(false);
    expect(isValidStatusTransition('STARTED', 'CANCELLED')).toBe(false);
    expect(isValidStatusTransition('COMPLETED', 'CANCELLED')).toBe(false);
    expect(isValidStatusTransition('CANCELLED', 'REQUESTED')).toBe(false);
  });

  it('calculates estimated fare with the platform fare rules', () => {
    expect(calculateEstimatedFare(0.1)).toBe(101.5);
    expect(calculateEstimatedFare(10)).toBe(250);
    expect(calculateEstimatedFare(12.345)).toBe(285.18);
  });
});

