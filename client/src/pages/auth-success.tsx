// Remove unnecessary redirect logic. Rely on Stack to set the cookie.
// On completion, simply redirect to the home page (which will run SmartHome)
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { PageLoader } from '../components/PageLoader.js';

interface GlobalWithStackAuth {
  stackAuth?: unknown;
}

export default function AuthSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // 🔍 ENHANCED DEBUG: Check Stack Auth state and cookies
    
    // Check if Stack Auth is available
    let stackAuthReady = false;
    try {
      // Try to access Stack Auth instance
      const globalWithStack = (window as GlobalWithStackAuth) || (globalThis as GlobalWithStackAuth);
      const stackAuth = globalWithStack.stackAuth;
      stackAuthReady = !!stackAuth;
    } catch (error) {
    }
    
    // 🔥 CRITICAL FIX: Wait longer for Stack Auth to complete token creation
    // Stack Auth needs time to exchange OAuth code for access tokens
    let attempts = 0;
    const maxAttempts = 20; // Check every 500ms for 10 seconds (increased from 4s)
    
    const checkAuthAndRedirect = () => {
      attempts++;
      
      // 🔥 CRITICAL: Check specifically for stack-access tokens (not just any stack cookie)
      // OAuth cookies (stack-oauth-outer, stack-oauth-inner) are temporary
      // We need to wait for the permanent stack-access token to be created
      const hasStackAccessToken = document.cookie.includes('stack-access');
      const hasOAuthCookies = document.cookie.includes('stack-oauth-outer') || 
                             document.cookie.includes('stack-oauth-inner');
      
      
      // ✅ SUCCESS: Access token created
      if (hasStackAccessToken) {
        setLocation('/', { replace: true });
      } 
      // ⏳ WAITING: OAuth in progress
      else if (hasOAuthCookies && attempts < maxAttempts) {
        setTimeout(checkAuthAndRedirect, 500);
      }
      // ⚠️ TIMEOUT: Redirect anyway after max attempts
      else if (attempts >= maxAttempts) {
        console.warn('⚠️ Timeout reached, redirecting without access token confirmation');
        setLocation('/', { replace: true });
      }
      // 🔄 RETRY: Keep waiting
      else {
        setTimeout(checkAuthAndRedirect, 500);
      }
    };
    
    // Start checking after initial 1 second delay (give Stack Auth time to process)
    setTimeout(checkAuthAndRedirect, 1000);
    
  }, [setLocation]);
  
  return <PageLoader />; // Show loading while waiting for the redirect
}