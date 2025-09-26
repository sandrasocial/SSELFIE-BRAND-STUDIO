import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useStackApp, useUser } from '@stackframe/react';
import { PageLoader } from '../components/PageLoader';

/**
 * OAuth Callback Component - Definitive Fix
 * 
 * This component handles the OAuth callback from Stack Auth providers.
 * It processes the authorization code and completes the authentication flow
 * without requiring page refreshes.
 */
export default function OAuthCallback(): JSX.Element {
  const app = useStackApp();
  const user = useUser();
  const [, setLocation] = useLocation();
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
    const processOAuthCallback = async () => {
      // Prevent double processing
      if (hasProcessedCallback.current) return;
      
      console.log('🔄 OAuth Callback: Starting authentication process at:', new Date().toISOString());
      console.log('🔍 OAuth Callback: Current URL:', window.location.href);
      console.log('🔍 OAuth Callback: Search params:', window.location.search);
      
      // Check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has('code');
      const hasState = urlParams.has('state');
      const hasError = urlParams.has('error');
      
      if (hasError) {
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        console.error('❌ OAuth Callback: OAuth error received:', error, errorDescription);
        setLocation('/handler/sign-in');
        return;
      }
      
      if (!hasCode || !hasState) {
        console.log('❌ OAuth Callback: Missing required OAuth parameters, redirecting to sign-in');
        setLocation('/handler/sign-in');
        return;
      }
      
      hasProcessedCallback.current = true;
      
      try {
        console.log('🔐 OAuth Callback: Processing OAuth callback with Stack Auth...');
        
        // Use Stack Auth's built-in OAuth callback handler
        const result = await app.callOAuthCallback();
        
        console.log('✅ OAuth Callback: Stack Auth callback processed successfully:', result);
        
        // Wait a moment for the authentication state to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we're now authenticated
        const currentUser = app.getUser();
        if (currentUser) {
          console.log('✅ OAuth Callback: User authenticated successfully:', currentUser.id);
          setLocation('/auth-success');
        } else {
          console.log('⚠️ OAuth Callback: Callback processed but no user found, checking again...');
          
          // Wait a bit more and try again
          setTimeout(() => {
            const retryUser = app.getUser();
            if (retryUser) {
              console.log('✅ OAuth Callback: User found on retry:', retryUser.id);
              setLocation('/auth-success');
            } else {
              console.log('❌ OAuth Callback: Still no user after retry, redirecting to sign-in');
              setLocation('/handler/sign-in');
            }
          }, 2000);
        }
        
      } catch (error) {
        console.error('❌ OAuth Callback: Authentication failed:', error);
        hasProcessedCallback.current = false; // Allow retry
        
        // Wait before redirecting to give user time to see what happened
        setTimeout(() => {
          setLocation('/handler/sign-in');
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [app, setLocation]);

  // If user is already authenticated (from previous session), redirect immediately
  useEffect(() => {
    if (user && !hasProcessedCallback.current) {
      console.log('✅ OAuth Callback: User already authenticated, redirecting to app');
      setLocation('/auth-success');
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <PageLoader />
        <p className="text-gray-600 mt-4">
          Completing authentication...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Processing your sign-in with Stack Auth
        </p>
      </div>
    </div>
  );
}



