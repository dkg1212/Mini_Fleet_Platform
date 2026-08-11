import api from './api.js';

export const loginRequest = async (credentials) => {
  const response = await api.post('/auth/login', credentials);

  return response.data.data;
};
