import api from './api.js';

export const getRides = async (params = {}) => {
  const response = await api.get('/rides', { params });

  return response.data.data.rides;
};

export const getRide = async (rideId) => {
  const response = await api.get(`/rides/${rideId}`);

  return response.data.data.ride;
};

export const getRideHistory = async (rideId) => {
  const response = await api.get(`/rides/${rideId}/history`);

  return response.data.data.history;
};

export const getAvailableRides = async () => {
  const response = await api.get('/rides/available');

  return response.data.data.rides;
};

export const getAssignedRides = async () => {
  const response = await api.get('/rides/assigned');

  return response.data.data.rides;
};

export const createRide = async (rideData, idempotencyKey) => {
  const response = await api.post('/rides', rideData, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  });

  return response.data.data.ride;
};

export const cancelRide = async (rideId) => {
  const response = await api.post(`/rides/${rideId}/cancel`);

  return response.data.data.ride;
};

export const acceptRide = async (rideId) => {
  const response = await api.post(`/rides/${rideId}/accept`);

  return response.data.data.ride;
};

export const updateRideStatus = async (rideId, status) => {
  const response = await api.patch(`/rides/${rideId}/status`, { status });

  return response.data.data.ride;
};
