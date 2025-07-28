import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    
    // Handle auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
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
