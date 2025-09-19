/**
 * useLiveSession Hook
 * Fetches and manages live session data for Stage Mode
 */

import { useQuery } from '@tanstack/react-query';

export interface LiveSession {
  id: string;
  title: string;
  deckUrl?: string;
  mentiUrl?: string;
  ctaUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseLiveSessionOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useLiveSession(sessionId: string | undefined, options: UseLiveSessionOptions = {}) {
  const { enabled = true, refetchInterval = 30000 } = options;

  return useQuery({
    queryKey: ['/api/live/session', sessionId],
    queryFn: async (): Promise<LiveSession> => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const response = await fetch(`/api/live/session/${sessionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error('Failed to load session');
      }

      const data = await response.json();
      return data.data.session as LiveSession;
    },
    enabled: enabled && !!sessionId,
    refetchInterval,
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: (failureCount, error) => {
      // Don't retry on 404s
      if (error instanceof Error && error.message === 'Session not found') {
        return false;
      }
      return failureCount < 3;
    },
  });
}