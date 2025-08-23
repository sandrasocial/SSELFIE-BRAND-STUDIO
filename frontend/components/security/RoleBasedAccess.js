import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const RoleBasedAccess = ({ 
  children, 
  requiredRoles = [], 
  fallback = null 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  const hasRequiredRole = () => {
    if (!isAuthenticated || !user || !user.roles) return false;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.some(role => user.roles.includes(role));
  };

  return hasRequiredRole() ? children : fallback;
};

// Higher order component for role-based route protection
export const withRoleProtection = (WrappedComponent, requiredRoles = []) => {
  return function WithRoleProtectionWrapper(props) {
    const { user, isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      // Redirect to login or show unauthorized message
      return <div>Please log in to access this feature.</div>;
    }

    const hasAccess = requiredRoles.some(role => user?.roles?.includes(role));
    
    if (!hasAccess) {
      return <div>You don't have permission to access this feature.</div>;
    }

    return <WrappedComponent {...props} />;
  };
};