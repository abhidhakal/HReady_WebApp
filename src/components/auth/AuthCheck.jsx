import React, { useEffect, useState } from 'react';
import api from '/src/api/api.js';

const AuthCheck = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Try to get user info
        const response = await api.get('/admins/me');
        setUserRole(response.data.role);
        
        if (requiredRole && response.data.role !== requiredRole) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="full-screen">
        <div className="dashboard-container">
          <div className="loading-spinner">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Authentication Required</h3>
        <p>Please log in to access this page.</p>
        <p>Required role: {requiredRole || 'Any authenticated user'}</p>
        <p>Current role: {userRole || 'Not logged in'}</p>
        <button onClick={() => window.location.href = '/login'}>
          Go to Login
        </button>
      </div>
    );
  }

  return children;
};

export default AuthCheck; 