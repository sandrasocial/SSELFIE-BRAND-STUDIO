/**
 * useSocket Hook
 * Vercel-compatible real-time features using polling instead of WebSockets
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface SessionState {
  currentSlide?: number;
  showPoll?: boolean;
  showQR?: boolean;
  showCTA?: boolean;
  timestamp?: number;
}

export interface ReactionData {
  emoji: '👏' | '🔥' | '💖' | '✨' | '💯';
  sessionId: string;
  timestamp: number;
}

interface UseSocketOptions {
  sessionId: string;
  role?: 'presenter' | 'audience';
  enabled?: boolean;
}

interface UseSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sessionState: SessionState;
  reactionCounts: Record<string, number>;
  emitStateUpdate: (state: Partial<SessionState>) => void;
  emitReaction: (emoji: ReactionData['emoji']) => void;
  reconnect: () => void;
}

export function useSocket({ 
  sessionId, 
  role = 'audience', 
  enabled = true 
}: UseSocketOptions): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>({});
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Polling-based real-time updates
  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Simulate connection
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      reconnectAttempts.current = 0;
    }, 1000);

    // Start polling for updates
    const startPolling = () => {
      pollingInterval.current = setInterval(async () => {
        try {
          // Poll for session state updates
          const response = await fetch(`/api/live-sessions/${sessionId}/state`);
          if (response.ok) {
            const data = await response.json();
            if (data.state) {
              setSessionState(data.state);
            }
            if (data.reactions) {
              setReactionCounts(data.reactions);
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000); // Poll every 2 seconds
    };

    startPolling();

    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [sessionId, role, enabled]);

  // Emit state update (presenter only)
  const emitStateUpdate = useCallback(async (state: Partial<SessionState>) => {
    if (!isConnected || role !== 'presenter') {
      return;
    }

    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });

      if (!response.ok) {
        throw new Error('Failed to update state');
      }
    } catch (error) {
      console.error('State update error:', error);
      setError('Failed to update state');
    }
  }, [isConnected, role, sessionId]);

  // Emit reaction (audience)
  const emitReaction = useCallback(async (emoji: ReactionData['emoji']) => {
    if (!isConnected) {
      return;
    }

    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });

      if (!response.ok) {
        throw new Error('Failed to send reaction');
      }
    } catch (error) {
      console.error('Reaction error:', error);
    }
  }, [isConnected, sessionId]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    setIsConnecting(true);
    setError(null);
    
    // Simulate reconnection
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttempts.current = 0;
    }, 1000);
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    sessionState,
    reactionCounts,
    emitStateUpdate,
    emitReaction,
    reconnect,
  };
}