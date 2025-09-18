import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';

export default function AuthSuccess() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // After OAuth callback, land here briefly and then route to home
    const timer = setTimeout(() => {
      setLocation('/');
    }, 500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isAuthenticated ? 'Signing you in…' : 'Completing authentication…'}
        </p>
      </div>
    </div>
  );
}