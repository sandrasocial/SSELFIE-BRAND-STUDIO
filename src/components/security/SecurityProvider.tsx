import React from 'react';
import { CSRFProvider } from '@/lib/security/csrf';
import { SessionManager } from './SessionManager';
import { RateLimitNotification } from './RateLimitNotification';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [showRateLimit, setShowRateLimit] = React.useState(false);
  const [rateLimitTime, setRateLimitTime] = React.useState(0);

  const handleSessionExpired = () => {
    // Redirect to login or handle session expiration
    window.location.href = '/auth/login';
  };

  const handleRateLimit = (remainingTime: number) => {
    setRateLimitTime(remainingTime);
    setShowRateLimit(true);
  };

  return (
    <CSRFProvider>
      <SessionManager
        timeoutMinutes={30}
        onSessionExpired={handleSessionExpired}
      />
      <RateLimitNotification
        isVisible={showRateLimit}
        remainingTime={rateLimitTime}
        onClose={() => setShowRateLimit(false)}
      />
      {children}
    </CSRFProvider>
  );
};