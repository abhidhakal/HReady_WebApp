import React from 'react';
import AuthCheck from '/src/components/auth/AuthCheck.jsx';

const AdminRoute = ({ children }) => {
  return (
    <AuthCheck requiredRole="admin">
      {children}
    </AuthCheck>
  );
};

export default AdminRoute; 