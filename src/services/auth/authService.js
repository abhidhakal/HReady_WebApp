import api from '/src/api/api.js';

/**
 * Authentication Service
 * Handles all authentication-related API calls and business logic
 */

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password: password
    });
    
    const data = response.data;
    
    // Store authentication data
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data._id);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userName', data.name);
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

// Logout user
export const logoutUser = async (navigate, onSuccess = null, onError = null) => {
  try {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Call server to invalidate token
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Server logout successful');
    }
  } catch (error) {
    console.error('Server logout error:', error);
    if (onError) onError(error);
  } finally {
    // Clear all client-side data
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to login
    navigate('/login', { replace: true });
    
    if (onSuccess) onSuccess();
  }
};

// Get current user data
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const endpoint = localStorage.getItem('role') === 'admin' ? '/admins/me' : '/employees/me';
    const response = await api.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Change password
export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get user token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get user role
export const getUserRole = () => {
  return localStorage.getItem('role');
};

// Get user ID
export const getUserId = () => {
  return localStorage.getItem('userId');
};

// Get user name
export const getUserName = () => {
  return localStorage.getItem('userName');
};

// Clear all authentication data
export const clearAuthData = () => {
  localStorage.clear();
  sessionStorage.clear();
};

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
}; 