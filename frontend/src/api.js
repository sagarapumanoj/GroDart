import axios from 'axios';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || ''}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('grodart_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e.response?.data?.message || 'Could not reach the server. Check your connection and try again';
export const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
export default api;
