import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';

export default function TestLogin() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleClearSession = async () => {
    try {
      await fetch('/api/clear-session', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Clear session failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-light mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
          Authentication Test
        </h1>
        
        <div className="space-y-4 mb-8">
          <div className="p-4 border rounded-lg text-left">
            <h3 className="font-medium mb-2">Authentication Status</h3>
            <p><strong>Loading:</strong> {isLoading.toString()}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated.toString()}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>Email:</strong> {user?.email || 'None'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {!isAuthenticated && (
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-2 px-4 hover:bg-gray-800"
            >
              Login as Test User
            </button>
          )}
          
          {isAuthenticated && (
            <div className="space-y-4">
              <Link href="/workspace">
                <button className="w-full bg-black text-white py-2 px-4 hover:bg-gray-800">
                  Go to Workspace
                </button>
              </Link>
              
              <button
                onClick={handleClearSession}
                className="w-full bg-gray-300 text-black py-2 px-4 hover:bg-gray-400"
              >
                Clear Session
              </button>
            </div>
          )}
          
          <Link href="/">
            <button className="w-full border border-black py-2 px-4 hover:bg-gray-100">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}