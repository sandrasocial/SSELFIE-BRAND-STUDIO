import { useEffect, useRef } from 'react';

interface CleanupFunction {
  (): void;
}

/**
 * Custom hook for managing component cleanup and preventing memory leaks
 */
export const useMemoryCleanup = () => {
  const cleanupFunctions = useRef<CleanupFunction[]>([]);
  const timeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const intervals = useRef<Set<ReturnType<typeof setInterval>>>(new Set());

  const addCleanup = (fn: CleanupFunction) => {
    cleanupFunctions.current.push(fn);
  };

  const createTimeout = (fn: () => void, delay: number): ReturnType<typeof setTimeout> => {
    const timeout = setTimeout(() => {
      timeouts.current.delete(timeout);
      fn();
    }, delay);
    timeouts.current.add(timeout);
    return timeout;
  };

  const createInterval = (fn: () => void, delay: number): ReturnType<typeof setInterval> => {
    const interval = setInterval(fn, delay);
    intervals.current.add(interval);
    return interval;
  };

  const clearTimeoutSafe = (timeout: ReturnType<typeof setTimeout>) => {
    clearTimeout(timeout);
    timeouts.current.delete(timeout);
  };

  const clearIntervalSafe = (interval: ReturnType<typeof setInterval>) => {
    clearInterval(interval);
    intervals.current.delete(interval);
  };

  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeouts.current.forEach(timeout => clearTimeout(timeout));
      timeouts.current.clear();

      // Clear all intervals
      intervals.current.forEach(interval => clearInterval(interval));
      intervals.current.clear();

      // Run all cleanup functions
      cleanupFunctions.current.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.warn('Cleanup function error:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, []);

  return {
    addCleanup,
    createTimeout,
    createInterval,
    clearTimeout: clearTimeoutSafe,
    clearInterval: clearIntervalSafe,
  };
};

export default useMemoryCleanup;