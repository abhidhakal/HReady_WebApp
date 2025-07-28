import React from 'react';
import AuthCheck from '/src/components/auth/AuthCheck.jsx';

const EmployeeRoute = ({ children }) => {
  return (
    <AuthCheck requiredRole="employee">
      {children}
    </AuthCheck>
  );
};

export default EmployeeRoute; 