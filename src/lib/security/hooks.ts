import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/toast';

export const useSecureForm = (csrfToken: string) => {
  const secureSubmit = async (url: string, data: any) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        toast({
          title: 'Too Many Attempts',
          description: 'Please try again later.',
          variant: 'error',
        });
        return { error: 'RATE_LIMITED', retryAfter };
      }

      return await response.json();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'error',
      });
      return { error };
    }
  };

  return { secureSubmit };
};

export const useSessionTimeout = (timeoutMinutes: number = 30) => {
  const [isActive, setIsActive] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(timeoutMinutes * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const resetTimer = () => {
      setTimeRemaining(timeoutMinutes * 60);
      setIsActive(true);
    };

    const startTimer = () => {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            setIsActive(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    startTimer();

    const handleActivity = () => {
      resetTimer();
      clearInterval(interval);
      startTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [timeoutMinutes]);

  return { isActive, timeRemaining };
};