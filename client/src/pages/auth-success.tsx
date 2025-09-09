import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';

export default function AuthSuccess() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Stack Auth handles authentication internally
    // Once user is authenticated, redirect to workspace
    if (isAuthenticated && user) {
      toast({
        title: "Welcome to SSELFIE Studio!",
        description: "Successfully logged in!",
      });

      // Redirect to workspace
      setTimeout(() => {
        setLocation('/workspace');
      }, 1500);
    }
  }, [isAuthenticated, user, setLocation, toast]);

  // Show loading while Stack Auth processes authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">SSELFIE Studio</h1>
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-600">Completing authentication...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">SSELFIE Studio</h1>
          
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-green-600 font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="text-red-600 font-medium">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}