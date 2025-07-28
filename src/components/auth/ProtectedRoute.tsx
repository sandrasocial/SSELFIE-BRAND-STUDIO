import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  // For now, we'll just render the children
  // In a real app, this would check authentication status
  return <>{children}</>;
};

export default ProtectedRoute;