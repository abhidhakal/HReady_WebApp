import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { secureLogout } from '/src/auth/authService.js';
import api from '/src/api/api.js';

/**
 * useAuth - Centralized authentication hook
 * Provides all authentication-related state and functions
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  // Get user role from localStorage
  const getStoredUserRole = useCallback(() => {
    return localStorage.getItem('role');
  }, []);

  // Get user ID from localStorage
  const getStoredUserId = useCallback(() => {
    return localStorage.getItem('userId');
  }, []);

  // Get user name from localStorage
  const getStoredUserName = useCallback(() => {
    return localStorage.getItem('userName');
  }, []);

  // Check if token exists and is valid
  const checkTokenValidity = useCallback(() => {
    const token = getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }, [getToken]);

  // Initialize authentication state
  const initializeAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserId(null);
      setUserName(null);
      setLoading(false);
      return;
    }

    // Check if token is valid
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token expired, clear it
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
        setUserId(null);
        setUserName(null);
        setLoading(false);
        return;
      }

      // Token is valid, set authenticated state
      setIsAuthenticated(true);
      setUserRole(localStorage.getItem('role'));
      setUserId(localStorage.getItem('userId'));
      setUserName(localStorage.getItem('userName'));
      setLoading(false);
    } catch (error) {
      // Invalid token, clear everything
      localStorage.clear();
      setIsAuthenticated(false);
      setUserRole(null);
      setUserId(null);
      setUserName(null);
      setLoading(false);
    }
  }, []); // No dependencies needed since we access localStorage directly

  // Login function
  const login = useCallback(async (email, password, navigate) => {
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      const data = res.data;

      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data._id);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.name);

      // Update state
      setIsAuthenticated(true);
      setUserRole(data.role);
      setUserId(data._id);
      setUserName(data.name);

      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }, []);

  // Logout function
  const logout = useCallback(async (navigate, onSuccess = null, onError = null) => {
    await secureLogout(navigate, onSuccess, onError);
    
    // Clear state
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUserName(null);
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return userRole === role;
  }, [userRole]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return userRole === 'admin';
  }, [userRole]);

  // Check if user is employee
  const isEmployee = useCallback(() => {
    return userRole === 'employee';
  }, [userRole]);

  // Get user data from API (for profile info)
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const endpoint = localStorage.getItem('role') === 'admin' ? '/admins/me' : '/employees/me';
      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []); // No dependencies needed since we access localStorage directly

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []); // Remove initializeAuth dependency to prevent infinite loops

  return {
    // State
    isAuthenticated,
    userRole,
    userId,
    userName,
    loading,
    
    // Functions
    getToken,
    getStoredUserRole,
    getStoredUserId,
    getStoredUserName,
    checkTokenValidity,
    initializeAuth,
    login,
    logout,
    hasRole,
    isAdmin,
    isEmployee,
    fetchUserData,
  };
} 