import axios from 'axios';
import authService from '../services/authService';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await authService.refreshToken();
        
        // Retry the original request with new token
        const user = authService.getCurrentUser();
        originalRequest.headers.Authorization = `Bearer ${user.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 