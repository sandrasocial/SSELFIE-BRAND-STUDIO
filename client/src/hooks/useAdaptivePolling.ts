// Adaptive Polling Hook for Training Status
// Implements smart polling strategy with progress-based intervals

import { useEffect, useRef, useCallback } from 'react';
import { AdaptivePollingConfig, DEFAULT_ADAPTIVE_POLLING } from '../types/training.js';

interface UseAdaptivePollingOptions {
  enabled: boolean;
  onPoll: () => Promise<void>;
  config?: AdaptivePollingConfig;
  progress?: number;
}

export const useAdaptivePolling = ({
  enabled,
  onPoll,
  config = DEFAULT_ADAPTIVE_POLLING,
  progress = 0
}: UseAdaptivePollingOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollRef = useRef<number>(0);

  // Calculate polling interval based on progress
  const getPollingInterval = useCallback((currentProgress: number): number => {
    const thresholds = Object.keys(config.progressThresholds)
      .map(Number)
      .sort((a, b) => b - a); // Sort descending

    for (const threshold of thresholds) {
      if (currentProgress >= threshold) {
        return Math.min(config.progressThresholds[threshold], config.maxInterval);
      }
    }

    return config.initialInterval;
  }, [config]);

  // Start or restart polling with current interval
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const interval = getPollingInterval(progress);

    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      
      // Prevent multiple simultaneous polls
      if (now - lastPollRef.current < 1000) {
        return;
      }

      lastPollRef.current = now;
      
      try {
        await onPoll();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }, [progress, getPollingInterval, onPoll]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Effect to manage polling lifecycle
  useEffect(() => {
    if (enabled && onPoll) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling, onPoll]);

  // Effect to adjust interval when progress changes
  useEffect(() => {
    if (enabled && intervalRef.current) {
      const currentInterval = getPollingInterval(progress);
      
      // Only restart if interval should change significantly (>20% difference)
      const oldInterval = config.progressThresholds[
        Object.keys(config.progressThresholds)
          .map(Number)
          .sort((a, b) => b - a)
          .find(threshold => progress >= threshold) || 0
      ] || config.initialInterval;

      if (Math.abs(currentInterval - oldInterval) / oldInterval > 0.2) {
        startPolling();
      }
    }
  }, [progress, enabled, startPolling, getPollingInterval, config]);

  return {
    isPolling: intervalRef.current !== null,
    currentInterval: getPollingInterval(progress),
    startPolling,
    stopPolling
  };
};