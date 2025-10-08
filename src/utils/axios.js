import axios from 'axios';

// Get API URL with fallback
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const fallbackUrl = 'https://teamtrack-backend-wwo6.onrender.com/api';
  
  console.log('Environment VITE_API_URL:', envUrl);
  console.log('Using API URL:', envUrl || fallbackUrl);
  
  return envUrl || fallbackUrl;
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
