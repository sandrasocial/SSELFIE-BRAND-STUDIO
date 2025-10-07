import React, { useEffect, useState } from 'react';

// OAuth Callback Debug Component - Helps identify where 404s are occurring
const OAuthCallbackDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      currentUrl: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      cookies: document.cookie,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    setDebugInfo(info);

    // Log to console for debugging
    console.log('🔍 OAuth Callback Debug Info:', info);

    // Try to extract OAuth parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (code) {
      console.log('✅ OAuth code found:', code.substring(0, 20) + '...');
    }
    if (state) {
      console.log('✅ OAuth state found:', state.substring(0, 20) + '...');
    }
    if (error) {
      console.error('❌ OAuth error found:', error);
    }

    // Check if Stack Auth is available
    try {
      // Try to access Stack Auth instance
      import('../../../../stack/client.js').then(({ stackClientApp }) => {
        console.log('✅ Stack Auth client available:', !!stackClientApp);
        if (stackClientApp) {
          // Try to get current user
          stackClientApp.getUser().then((user: any) => {
            console.log('👤 Current user:', user ? 'Authenticated' : 'Not authenticated');
          }).catch((err: any) => {
            console.log('👤 User check failed:', err.message);
          });
        }
      }).catch((err: any) => {
        console.error('❌ Stack Auth client import failed:', err);
      });
    } catch (error) {
      console.error('❌ Stack Auth client error:', error);
    }    // Redirect to auth-success after collecting debug info
    const timer = setTimeout(() => {
      console.log('🔄 Redirecting to /auth-success...');
      window.location.href = '/auth-success';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">OAuth Callback Debug</h1>
        <p className="text-gray-600 mb-4">
          Debugging OAuth callback flow. Check console for detailed logs.
        </p>
        
        <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-auto">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            This page will automatically redirect to /auth-success in 3 seconds...
          </p>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>If you see this page, the OAuth callback route is working.</p>
          <p>If you get a 404 after this, the issue is in the subsequent redirect.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackDebug;