import api from './api.js';

export const getAdminMetrics = async () => {
  const response = await api.get('/admin/metrics');

  return response.data.data;
};
