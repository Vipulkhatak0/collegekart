import axios from 'axios';

// Base URL for REST calls, e.g. http://localhost:5000/api
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Base URL for the socket.io connection — same host as the API, without the /api suffix.
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('ck_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralize the common "message the server sent back" extraction so components
// can just do: catch (err) { toast.error(getErrorMessage(err)) }
export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';

export default api;
