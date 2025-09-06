import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';

export default function AuthSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('✅ OAuth: Received authorization code');

        // Exchange code for token through our backend
        const response = await fetch('/api/auth/oauth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to exchange OAuth code');
        }

        const data = await response.json();
        console.log('✅ OAuth: Token exchange successful');

        // Store the token for future requests
        if (data.token) {
          localStorage.setItem('stack-auth-token', data.token);
        }

        setStatus('success');
        setMessage('Authentication successful! Redirecting...');

        toast({
          title: "Welcome to SSELFIE Studio!",
          description: "Successfully logged in!",
        });

        // Redirect to workspace after 2 seconds
        setTimeout(() => {
          setLocation('/workspace');
        }, 2000);

      } catch (error: any) {
        console.error('❌ OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');

        toast({
          title: "Login Failed",
          description: error.message || 'Authentication failed',
          variant: "destructive",
        });

        // Redirect to login after 3 seconds on error
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [setLocation, toast]);

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