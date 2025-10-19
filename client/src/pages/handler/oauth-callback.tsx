import React, { useEffect } from "react";
// ⚠️ CRITICAL: Import stackClientApp lazily to avoid circular dependency

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
        const errorDescription = urlParams.get('error_description');

        console.log('📋 OAuth Parameters:', {
          code: code ? code.substring(0, 20) + '...' : null,
          state: state ? state.substring(0, 20) + '...' : null,
          error,
          errorDescription,
          fullURL: window.location.href
        });

        if (error) {
          console.error('❌ OAuth error from provider:', error, errorDescription);
          window.location.href = `/handler/sign-in?error=oauth_failed&details=${encodeURIComponent(error + ': ' + (errorDescription || ''))}`;
          return;
        }

        if (!code) {
          console.error('❌ No OAuth code found - this usually means:');
          console.error('   1. OAuth redirect URI not whitelisted in Stack Auth dashboard');
          console.error('   2. User cancelled OAuth flow');
          console.error('   3. OAuth provider error');
          console.error('   Current URL:', window.location.href);
          window.location.href = '/handler/sign-in?error=no_code&url=' + encodeURIComponent(window.location.href);
          return;
        }

        console.log('✅ OAuth code found, processing with Stack Auth...');

        // Lazy load stackClientApp
        const { stackClientApp } = await import("../../../../stack/client");

        // Use Stack Auth to process the OAuth callback
        if (stackClientApp && typeof stackClientApp.callOAuthCallback === 'function') {
          console.log('🔄 Calling Stack Auth OAuth callback...');
          console.log('🔍 Current cookies BEFORE callback:', document.cookie);

          await stackClientApp.callOAuthCallback();
          console.log('✅ Stack Auth OAuth callback processed');

          // Check cookies immediately after callback
          console.log('🔍 Current cookies AFTER callback:', document.cookie);

          // Check if user is authenticated
          const user = await stackClientApp.getUser();
          console.log('🔍 User after OAuth callback:', user ? 'AUTHENTICATED ✅' : 'NOT AUTHENTICATED ❌');

          if (user) {
            console.log('🔍 User details:', { id: user.id, email: user.primaryEmail });
          }

          // Wait a moment for cookies to be set, then redirect to auth-success
          setTimeout(() => {
            console.log('🔍 Current cookies BEFORE redirect:', document.cookie);
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