// Remove unnecessary redirect logic. Rely on Stack to set the cookie.
// On completion, simply redirect to the home page (which will run SmartHome)
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { PageLoader } from '../components/PageLoader.js';

export default function AuthSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Navigate to the main app entry point.
    // The SmartHome component (at the root '/') will handle the final redirect 
    // to /simple-training or /app after checking the user model.
    console.log('✅ Auth successful, redirecting to application root');
    setLocation('/', { replace: true });
  }, [setLocation]);
  
  return <PageLoader />; // Show loading while waiting for the redirect
}