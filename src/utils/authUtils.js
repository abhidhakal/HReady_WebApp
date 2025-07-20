import api from '../api/axios';

/**
 * Enhanced logout function with server-side token invalidation
 * @param {Function} navigate - React Router navigate function
 * @param {Function} onSuccess - Optional callback on successful logout
 * @param {Function} onError - Optional callback on logout error
 */
export const secureLogout = async (navigate, onSuccess = null, onError = null) => {
  try {
    const token = localStorage.getItem('token');
    
    if (token) {
      // 1. Call server to invalidate token
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Server logout successful');
    }
  } catch (error) {
    console.error('Server logout error:', error);
    // Continue with client-side cleanup even if server call fails
    if (onError) onError(error);
  } finally {
    // 2. Clear all client-side data
    localStorage.clear();
    sessionStorage.clear();
    
    // 3. Clear any cached data or state
    // This could include clearing React Query cache, Redux store, etc.
    
    // 4. Navigate to login with replace to prevent back navigation
    navigate('/login', { replace: true });
    
    if (onSuccess) onSuccess();
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get current user token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get current user role
 * @returns {string|null}
 */
export const getUserRole = () => {
  return localStorage.getItem('role');
};

/**
 * Get current user ID
 * @returns {string|null}
 */
export const getUserId = () => {
  return localStorage.getItem('userId');
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * Check if token is expired (basic check)
 * @param {string} token - JWT token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true; // Consider expired if we can't decode
  }
}; 