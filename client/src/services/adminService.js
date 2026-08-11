import api from './api.js';

export const getAdminMetrics = async () => {
  const response = await api.get('/admin/metrics');

  return response.data.data;
};

export const getAdminUsers = async (role) => {
  const response = await api.get('/admin/users', {
    params: role ? { role } : {}
  });

  return response.data.data.users;
};
