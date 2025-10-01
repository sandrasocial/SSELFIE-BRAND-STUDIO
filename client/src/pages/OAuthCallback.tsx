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

  useEffect(() => {
    if (ranRef.current) return;
    if (!hasCallbackParams()) {
      console.log('🔄 OAuthCallback: No callback params, redirecting to sign-in');
      setLocation('/handler/sign-in');
      return;
    }
    ranRef.current = true;

    console.log('🔄 OAuthCallback: Processing OAuth callback...');
    
    (async () => {
      try {
        setStatus('working');
        console.log('🔄 OAuthCallback: Calling app.callOAuthCallback()...');
        const hasRedirected = await app.callOAuthCallback();
        console.log('🔄 OAuthCallback: callOAuthCallback result:', hasRedirected);
        setStatus('done');
        if (!hasRedirected) {
          console.log('🔄 OAuthCallback: No automatic redirect, manually redirecting to /auth-success');
          setLocation('/auth-success');
        } else {
          console.log('✅ OAuthCallback: Stack Auth handled redirect automatically');
        }
      } catch (err) {
        console.error('❌ OAuth callback failed:', err);
        setStatus('error');
        setLocation('/handler/sign-in');
      }
    })();
  }, [app, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <PageLoader />
        <p className="text-gray-600 mt-4">
          {status === 'error' ? 'Authentication failed…' : 'Completing authentication…'}
        </p>
      </div>
    </div>
  );
}