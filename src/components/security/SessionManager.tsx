import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/toast';

interface SessionManagerProps {
  timeoutMinutes?: number;
  onSessionExpired: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  timeoutMinutes = 30,
  onSessionExpired,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeoutMinutes * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const resetTimers = () => {
      setTimeRemaining(timeoutMinutes * 60);
      setShowWarning(false);
    };

    const startTimers = () => {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 300 && !showWarning) { // Show warning 5 minutes before expiry
            setShowWarning(true);
          }
          return prev - 1;
        });
      }, 1000);

      timeout = setTimeout(() => {
        onSessionExpired();
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "error",
        });
      }, timeoutMinutes * 60 * 1000);
    };

    const handleActivity = () => {
      clearInterval(interval);
      clearTimeout(timeout);
      resetTimers();
      startTimers();
    };

    startTimers();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [timeoutMinutes, onSessionExpired]);

  return (
    <>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Session Expiring Soon
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your session will expire in {Math.floor(timeRemaining / 60)}:
                {String(timeRemaining % 60).padStart(2, '0')}
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Continue Session
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};