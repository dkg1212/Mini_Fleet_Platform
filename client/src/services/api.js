import axios from 'axios';

const apiBaseUrl = (() => {
  const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  if (configuredUrl.endsWith('/api')) {
    return configuredUrl;
  }

  return `${configuredUrl.replace(/\/$/, '')}/api`;
})();

const api = axios.create({
  baseURL: apiBaseUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
