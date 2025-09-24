import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useStackApp } from '@stackframe/react';
import { PageLoader } from '../components/PageLoader';

function hasCallbackParams() {
  const p = new URLSearchParams(window.location.search);
  return p.has('code') && p.has('state');
}

export default function OAuthCallback(): JSX.Element {
  const app = useStackApp();
  const [, setLocation] = useLocation();
  const ranRef = useRef(false);
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (ranRef.current) return;
    
    // ✅ DIAGNOSTIC LOG: OAuth callback component loaded
    console.log('🔄 OAuth callback component loaded at:', new Date().toISOString());
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 URL parameters:', Object.fromEntries(new URLSearchParams(window.location.search)));
    
    if (!hasCallbackParams()) {
      console.log('❌ No OAuth callback parameters found, redirecting to sign-in');
      setLocation('/handler/sign-in');
      return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    setDebugInfo({
      code: urlParams.has('code') ? 'present' : 'missing',
      state: urlParams.has('state') ? 'present' : 'missing',
      error: urlParams.get('error') || 'none',
      fullParams: Object.fromEntries(urlParams)
    });
    
    console.log('✅ OAuth callback parameters found:', {
      hasCode: urlParams.has('code'),
      hasState: urlParams.has('state'),
      error: urlParams.get('error'),
      allParams: Object.fromEntries(urlParams)
    });
    
    ranRef.current = true;

    (async () => {
      try {
        setStatus('working');
        console.log('🔐 About to call app.callOAuthCallback() at:', new Date().toISOString());
        
        // Enhanced callback handling with better error detection
        const hasRedirected = await app.callOAuthCallback();
        
        console.log('✅ app.callOAuthCallback() completed:', { hasRedirected });
        setStatus('done');
        
        // Give Stack Auth a moment to set the cookies/tokens
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to verify the authentication was successful
        try {
          const user = app.getUser();
          console.log('🔍 User after OAuth callback:', { user: !!user, userId: user?.id });
          
          if (user) {
            console.log('✅ User authenticated successfully, redirecting to /auth-success');
            if (!hasRedirected) setLocation('/auth-success');
          } else {
            console.log('⚠️ OAuth callback completed but no user found, waiting then checking again');
            // Wait a bit more and try again
            setTimeout(async () => {
              const retryUser = app.getUser();
              if (retryUser) {
                console.log('✅ User found on retry, redirecting to /auth-success');
                setLocation('/auth-success');
              } else {
                console.log('❌ Still no user after retry, redirecting to sign-in');
                setLocation('/handler/sign-in');
              }
            }, 1000);
          }
        } catch (userCheckError) {
          console.log('⚠️ Error checking user status:', userCheckError);
          if (!hasRedirected) setLocation('/auth-success');
        }
        
      } catch (err) {
        console.error('❌ OAuth callback failed at:', new Date().toISOString(), err);
        setStatus('error');
        
        // Enhanced error handling - try to extract useful error information
        if (err instanceof Error) {
          console.error('❌ Error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
          });
        }
        
        // Give it one more chance after a delay
        setTimeout(() => {
          console.log('🔄 Retrying OAuth callback after error...');
          setLocation('/handler/sign-in');
        }, 2000);
      }
    })();
  }, [app, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <PageLoader />
        <p className="text-gray-600 mt-4">
          {status === 'error' ? 'Authentication failed, retrying…' : 'Completing authentication…'}
        </p>
        {status === 'working' && (
          <p className="text-sm text-gray-500 mt-2">
            Processing OAuth callback...
          </p>
        )}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}



