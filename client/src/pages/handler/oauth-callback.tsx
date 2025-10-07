import React, { useEffect } from "react";
import { stackClientApp } from "../../../../stack/client.js";

// OAuth Callback Handler - Processes Google OAuth callback and redirects
const OAuthCallback: React.FC = () => {
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        console.log('🔍 Processing OAuth callback:', window.location.href);
        
        // Extract OAuth parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          console.error('❌ OAuth error:', error);
          window.location.href = '/handler/sign-in?error=oauth_failed';
          return;
        }

        if (!code) {
          console.error('❌ No OAuth code found');
          window.location.href = '/handler/sign-in?error=no_code';
          return;
        }

        console.log('✅ OAuth code found, processing with Stack Auth...');

        // Use Stack Auth to process the OAuth callback
        if (stackClientApp && typeof stackClientApp.callOAuthCallback === 'function') {
          await stackClientApp.callOAuthCallback();
          console.log('✅ Stack Auth OAuth callback processed');
          
          // Wait a moment for cookies to be set, then redirect to auth-success
          setTimeout(() => {
            window.location.href = '/auth-success';
          }, 1000);
        } else {
          console.error('❌ Stack Auth client not available or missing callOAuthCallback method');
          // Fallback: redirect to auth-success anyway
          window.location.href = '/auth-success';
        }
      } catch (error) {
        console.error('❌ OAuth callback processing failed:', error);
        // Fallback: redirect to auth-success anyway, let auth-success handle the result
        window.location.href = '/auth-success';
      }
    };

    // Process the callback after a short delay to ensure DOM is ready
    setTimeout(processOAuthCallback, 500);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Processing authentication...</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;