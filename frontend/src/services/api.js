import axios from 'axios';

// Use relative URL for API calls so it works in both local and preview environments
const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;