import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import * as stackAuth from '@stackframe/react';
import { PageLoader } from '../components/PageLoader.js';

// Apply ESM workaround for Stack Auth
const { useStackApp } = (stackAuth as any).default || stackAuth;

function hasCallbackParams() {
  const p = new URLSearchParams(window.location.search);
  return p.has('code') && p.has('state');
}

export default function OAuthCallback() {
  const app = useStackApp();
  const [, setLocation] = useLocation();
  const ranRef = useRef(false);
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (ranRef.current) return;
    if (!hasCallbackParams()) {
      console.log('🔄 OAuthCallback: No callback params, redirecting to sign-in');
      setLocation('/handler/sign-in');
      return;
    }
    ranRef.current = true;

    console.log('🔄 OAuthCallback: Processing OAuth callback...');
    console.log('🔍 URL params:', window.location.search);
    console.log('🔍 Current cookies before callback:', document.cookie.substring(0, 200));
    
    (async () => {
      try {
        setStatus('working');
        console.log('🔄 OAuthCallback: Calling app.callOAuthCallback()...');
        
        // 🔥 CRITICAL: Call Stack Auth's OAuth callback handler
        // This exchanges the authorization code for access tokens
        const hasRedirected = await app.callOAuthCallback();
        
        console.log('🔄 OAuthCallback: callOAuthCallback result:', hasRedirected);
        console.log('🔍 Current cookies after callback:', document.cookie.substring(0, 200));
        
        setStatus('done');
        
        // 🔥 NEW: Wait a moment for tokens to be fully set before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!hasRedirected) {
          console.log('🔄 OAuthCallback: No automatic redirect, manually redirecting to /auth-success');
          setLocation('/auth-success');
        } else {
          console.log('✅ OAuthCallback: Stack Auth handled redirect automatically');
        }
      } catch (err) {
        console.error('❌ OAuth callback failed:', err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Error details:', {
          message: errorMsg,
          stack: err instanceof Error ? err.stack : undefined,
          url: window.location.href,
          cookies: document.cookie.substring(0, 200)
        });
        
        setErrorMessage(errorMsg);
        setStatus('error');
        
        // 🔥 NEW: More graceful error handling
        // Wait a bit and try to redirect to sign-in with error message
        setTimeout(() => {
          setLocation('/handler/sign-in?error=oauth_callback_failed');
        }, 2000);
      }
    })();
  }, [app, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <PageLoader />
        <p className="text-gray-600 mt-4">
          {status === 'error' 
            ? `Authentication failed: ${errorMessage || 'Please try again'}` 
            : 'Completing authentication…'}
        </p>
        {status === 'error' && (
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to sign-in page...
          </p>
        )}
      </div>
    </div>
  );
}