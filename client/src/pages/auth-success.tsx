// Remove unnecessary redirect logic. Rely on Stack to set the cookie.
// On completion, simply redirect to the home page (which will run SmartHome)
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { PageLoader } from '../components/PageLoader.js';

export default function AuthSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // 🔍 ENHANCED DEBUG: Check Stack Auth state and cookies
    console.log('🔍 Auth success page loaded at:', new Date().toISOString());
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Current cookies:', document.cookie);
    console.log('🔍 LocalStorage keys:', Object.keys(localStorage));
    console.log('🔍 SessionStorage keys:', Object.keys(sessionStorage));
    
    // Check if Stack Auth is available
    let stackAuthReady = false;
    try {
      // Try to access Stack Auth instance
      const stackAuth = (window as any).stackAuth || (globalThis as any).stackAuth;
      stackAuthReady = !!stackAuth;
      console.log('🔍 Stack Auth instance available:', stackAuthReady);
    } catch (error) {
      console.log('🔍 Stack Auth check failed:', error);
    }
    
    // 🔥 CRITICAL FIX: Wait longer for Stack Auth to complete token creation
    // Stack Auth needs time to exchange OAuth code for access tokens
    let attempts = 0;
    const maxAttempts = 20; // Check every 500ms for 10 seconds (increased from 4s)
    
    const checkAuthAndRedirect = () => {
      attempts++;
      console.log(`🔄 Auth check attempt ${attempts}/${maxAttempts}`);
      console.log('🔍 Cookies now:', document.cookie.substring(0, 200));
      
      // 🔥 CRITICAL: Check specifically for stack-access tokens (not just any stack cookie)
      // OAuth cookies (stack-oauth-outer, stack-oauth-inner) are temporary
      // We need to wait for the permanent stack-access token to be created
      const hasStackAccessToken = document.cookie.includes('stack-access');
      const hasOAuthCookies = document.cookie.includes('stack-oauth-outer') || 
                             document.cookie.includes('stack-oauth-inner');
      
      console.log('🔍 Has Stack Access Token:', hasStackAccessToken);
      console.log('🔍 Has OAuth Cookies:', hasOAuthCookies);
      
      // ✅ SUCCESS: Access token created
      if (hasStackAccessToken) {
        console.log('✅ Stack Access Token detected! Auth complete.');
        console.log('🎯 Redirecting to app - avoiding home route to prevent loops');
        setLocation('/app', { replace: true });
      } 
      // ⏳ WAITING: OAuth in progress
      else if (hasOAuthCookies && attempts < maxAttempts) {
        console.log('⏳ OAuth cookies present, waiting for access token creation...');
        setTimeout(checkAuthAndRedirect, 500);
      }
      // ⚠️ TIMEOUT: Redirect anyway after max attempts
      else if (attempts >= maxAttempts) {
        console.warn('⚠️ Timeout reached, redirecting without access token confirmation');
        console.log('🔍 This may indicate OAuth token exchange failed - redirecting to app anyway');
        setLocation('/app', { replace: true });
      }
      // 🔄 RETRY: Keep waiting
      else {
        console.log('⏳ Waiting for Stack Auth cookies, retrying in 500ms...');
        setTimeout(checkAuthAndRedirect, 500);
      }
    };
    
    // Start checking after initial 1 second delay (give Stack Auth time to process)
    setTimeout(checkAuthAndRedirect, 1000);
    
  }, [setLocation]);
  
  return <PageLoader />; // Show loading while waiting for the redirect
}