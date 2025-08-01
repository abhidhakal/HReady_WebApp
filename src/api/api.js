import axios from 'axios';

// Environment detection for API base URL
const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

const baseURL = isTest ? process.env.VITE_API_BASE_URL : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('API Base URL:', baseURL);
console.log('Is Test Environment:', isTest);

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 second timeout for slow Render responses
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', config.url, 'Token:', token.substring(0, 20) + '...');
    } else {
      console.log('Request without token:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle auth errors - only logout for auth-related endpoints or if token is clearly invalid
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if this is an auth-related endpoint
      const isAuthEndpoint = originalRequest.url.includes('/auth/') || 
                            originalRequest.url.includes('/login') ||
                            originalRequest.url.includes('/logout');
      
      // Only logout for auth endpoints or if we get a clear "token invalid" message
      // But don't redirect if we're already on the login page (prevents infinite redirects)
      if ((isAuthEndpoint || 
          error.response.data?.message?.toLowerCase().includes('token') ||
          error.response.data?.message?.toLowerCase().includes('unauthorized') ||
          error.response.data?.message?.toLowerCase().includes('forbidden')) &&
          !window.location.pathname.includes('/login')) {
        console.log('Auth error detected, logging out user');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // For other endpoints, just reject the error without logging out
      console.log('Non-auth 401/403 error, not logging out:', originalRequest.url);
      return Promise.reject(error);
    }
    
    // Handle timeout and network errors with retry logic
    if ((error.code === 'ECONNABORTED' || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Retry once after 2 seconds for timeout/network errors
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('Retrying request:', originalRequest.url);
          resolve(api(originalRequest));
        }, 2000);
      });
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check if API is ready
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 10000 });
    return response.status === 200;
  } catch (error) {
    console.log('API health check failed:', error.message);
    return false;
  }
};

export default api;
