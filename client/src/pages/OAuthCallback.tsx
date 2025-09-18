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



