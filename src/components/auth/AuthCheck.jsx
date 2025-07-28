import React from 'react';
import { useAuth } from '/src/hooks/useAuth.js';

const AuthCheck = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
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

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Access Denied</h3>
        <p>You don't have permission to access this page.</p>
        <p>Required role: {requiredRole}</p>
        <p>Current role: {userRole}</p>
        <button onClick={() => window.location.href = '/login'}>
          Go to Login
        </button>
      </div>
    );
  }

  return children;
};

export default AuthCheck; 