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
    
    // 🔧 CRITICAL FIX: Increased timeout from 1s to 4s for better OAuth stability
    let attempts = 0;
    const maxAttempts = 8; // Check every 500ms for 4 seconds
    
    const checkAuthAndRedirect = () => {
      attempts++;
      console.log(`🔄 Auth check attempt ${attempts}/${maxAttempts}`);
      console.log('🔍 Cookies now:', document.cookie);
      
      // Check for Stack Auth cookies specifically
      const hasStackCookie = document.cookie.includes('stack-') || 
                           document.cookie.includes('auth') ||
                           localStorage.getItem('stack-auth') ||
                           sessionStorage.getItem('stack-auth');
      
      console.log('🔍 Has Stack Auth data:', hasStackCookie);
      
      if (hasStackCookie || attempts >= maxAttempts) {
        console.log('✅ Auth state ready or timeout reached, redirecting to application root');
        console.log('🎯 Final redirect - SmartHome will handle user routing');
        setLocation('/', { replace: true });
      } else {
        console.log('⏳ Waiting for Stack Auth cookies, retrying in 500ms...');
        setTimeout(checkAuthAndRedirect, 500);
      }
    };
    
    // Start checking after initial 500ms delay
    setTimeout(checkAuthAndRedirect, 500);
    
  }, [setLocation]);
  
  return <PageLoader />; // Show loading while waiting for the redirect
}