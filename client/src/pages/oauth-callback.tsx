import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useStackApp } from '@stackframe/react';

function hasCallbackParams() {
  const p = new URLSearchParams(window.location.search);
  return p.has('code') && p.has('state');
}

export default function OAuthCallback(): JSX.Element {
  const app = useStackApp();
  const [, setLocation] = useLocation();
  const ranRef = useRef(false);
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (ranRef.current) return;
    if (!hasCallbackParams()) {
      setLocation('/handler/sign-in');
      return;
    }
    ranRef.current = true;

    (async () => {
      try {
        setStatus('working');
        const hasRedirected = await app.callOAuthCallback();
        setStatus('done');
        if (!hasRedirected) setLocation('/auth-success');
      } catch (err) {
        console.error('OAuth callback failed:', err);
        setStatus('error');
        setLocation('/handler/sign-in');
      }
    })();
  }, [app, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {status === 'error' ? 'Authentication failed…' : 'Completing authentication…'}
        </p>
      </div>
    </div>
  );
}


