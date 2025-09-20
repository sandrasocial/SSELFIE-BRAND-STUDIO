/**
 * useSocket Hook
 * Manages Socket.IO connections for Stage Mode real-time features
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

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

export interface SocketEvents {
  // Server to client events
  'state:current': (state: SessionState) => void;
  'state:updated': (state: SessionState) => void;
  'reactions:current': (counts: Record<string, number>) => void;
  'reactions:updated': (counts: Record<string, number>) => void;
  'reaction:new': (reaction: ReactionData) => void;
  'user:joined': (data: { role: string; socketId: string }) => void;
  'user:left': (data: { role: string; socketId: string }) => void;
  'error': (error: { message: string }) => void;
  
  // Client to server events
  'join-session': (data: { sessionId: string; role?: 'presenter' | 'audience' }) => void;
  'state:update': (state: SessionState) => void;
  'reaction': (data: { emoji: string; sessionId: string }) => void;
}

interface UseSocketOptions {
  sessionId: string;
  role?: 'presenter' | 'audience';
  enabled?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
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
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>({});
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    const socketUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://sselfie.com'
      : 'ws://localhost:3001';

    const socket = io(`${socketUrl}/live`, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔄 Socket connected, joining session:', sessionId);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      reconnectAttempts.current = 0;

      // Join the session room
      socket.emit('join-session', { sessionId, role });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      setIsConnecting(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnecting(false);
      setError(`Connection failed: ${error.message}`);
      
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Failed to connect after multiple attempts. Please refresh the page.');
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setError(null);
      reconnectAttempts.current = 0;
      
      // Rejoin session after reconnection
      socket.emit('join-session', { sessionId, role });
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnect error:', error);
      setError('Reconnection failed. Please refresh the page.');
    });

    // Session-specific event handlers
    socket.on('state:current', (state: SessionState) => {
      console.log('📊 Received current state:', state);
      setSessionState(state);
    });

    socket.on('state:updated', (state: SessionState) => {
      console.log('📊 State updated:', state);
      setSessionState(prev => ({ ...prev, ...state }));
    });

    socket.on('reactions:current', (counts: Record<string, number>) => {
      console.log('🎭 Received current reactions:', counts);
      setReactionCounts(counts);
    });

    socket.on('reactions:updated', (counts: Record<string, number>) => {
      console.log('🎭 Reactions updated:', counts);
      setReactionCounts(counts);
    });

    socket.on('reaction:new', (reaction: ReactionData) => {
      console.log('🎭 New reaction:', reaction);
      // Optional: Show temporary reaction animation
    });

    socket.on('user:joined', (data) => {
      console.log('👋 User joined:', data);
    });

    socket.on('user:left', (data) => {
      console.log('👋 User left:', data);
    });

    socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
      setError(error.message);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [sessionId, role, enabled]);

  // Emit state update (presenter only)
  const emitStateUpdate = useCallback((state: Partial<SessionState>) => {
    if (socketRef.current && isConnected && role === 'presenter') {
      console.log('📤 Emitting state update:', state);
      socketRef.current.emit('state:update', state);
    }
  }, [isConnected, role]);

  // Emit reaction (audience)
  const emitReaction = useCallback((emoji: ReactionData['emoji']) => {
    if (socketRef.current && isConnected) {
      console.log('📤 Emitting reaction:', emoji);
      socketRef.current.emit('reaction', { emoji, sessionId });
    }
  }, [isConnected, sessionId]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
      setIsConnecting(true);
      setError(null);
    }
  }, []);

  return {
    socket: socketRef.current,
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