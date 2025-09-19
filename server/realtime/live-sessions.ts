/**
 * Live Sessions Realtime Handler
 * Socket.IO implementation for Stage Mode real-time synchronization
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Logger } from '../utils/logger';
import { db } from '../db';
import { liveEvents } from '../../shared/schema';
import { LIVE_SOCKET_ENABLED } from '../env';

const logger = new Logger('LiveSessionsRealtime');

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

export interface SessionSocketData {
  sessionId?: string;
  userId?: string;
  role?: 'presenter' | 'audience';
}

class LiveSessionsManager {
  private io: SocketIOServer | null = null;
  private sessionStates: Map<string, SessionState> = new Map();
  private reactionCounts: Map<string, Map<string, number>> = new Map();

  initialize(httpServer: HTTPServer): void {
    if (!LIVE_SOCKET_ENABLED) {
      logger.info('Live Socket disabled via LIVE_SOCKET_ENABLED environment variable');
      return;
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ["https://sselfie.com", "https://www.sselfie.com"]
          : ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Create live namespace
    const liveNamespace = this.io.of('/live');

    liveNamespace.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('Live Sessions Socket.IO server initialized on namespace /live');
  }

  private handleConnection(socket: Socket): void {
    const socketData = socket.data as SessionSocketData;
    logger.info('New live session connection', { socketId: socket.id });

    // Handle joining a session room
    socket.on('join-session', async (data: { sessionId: string; role?: 'presenter' | 'audience' }) => {
      try {
        const { sessionId, role = 'audience' } = data;

        // Validate session exists
        const session = await this.validateSession(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Join the session room
        const roomName = `session-${sessionId}`;
        await socket.join(roomName);

        // Store session data
        socketData.sessionId = sessionId;
        socketData.role = role;

        // Send current state to new joiner
        const currentState = this.sessionStates.get(sessionId) || {};
        socket.emit('state:current', currentState);

        // Send current reaction counts
        const reactions = this.reactionCounts.get(sessionId) || new Map();
        socket.emit('reactions:current', Object.fromEntries(reactions));

        // Broadcast join to room (for presence indicators)
        socket.to(roomName).emit('user:joined', { role, socketId: socket.id });

        logger.info('Socket joined session', { sessionId, role, socketId: socket.id });

        // Track join event
        await this.trackEvent(sessionId, 'session_join', { role, socketId: socket.id });

      } catch (error) {
        logger.error('Error joining session', { error: error.message });
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle state updates (presenter only)
    socket.on('state:update', async (newState: SessionState) => {
      try {
        const { sessionId, role } = socketData;

        if (!sessionId || role !== 'presenter') {
          socket.emit('error', { message: 'Unauthorized state update' });
          return;
        }

        // Update stored state
        const currentState = this.sessionStates.get(sessionId) || {};
        const updatedState = {
          ...currentState,
          ...newState,
          timestamp: Date.now(),
        };
        
        this.sessionStates.set(sessionId, updatedState);

        // Broadcast to all clients in the session room
        const roomName = `session-${sessionId}`;
        socket.to(roomName).emit('state:updated', updatedState);

        logger.info('State updated and broadcast', { sessionId, state: updatedState });

        // Track state change event
        await this.trackEvent(sessionId, 'state_change', newState);

      } catch (error) {
        logger.error('Error updating state', { error: error.message });
        socket.emit('error', { message: 'Failed to update state' });
      }
    });

    // Handle reactions (audience)
    socket.on('reaction', async (reactionData: Omit<ReactionData, 'timestamp'>) => {
      try {
        const { sessionId } = socketData;

        if (!sessionId) {
          socket.emit('error', { message: 'Not in a session' });
          return;
        }

        const { emoji } = reactionData;
        const fullReactionData: ReactionData = {
          ...reactionData,
          sessionId,
          timestamp: Date.now(),
        };

        // Update reaction counts
        const sessionReactions = this.reactionCounts.get(sessionId) || new Map();
        const currentCount = sessionReactions.get(emoji) || 0;
        sessionReactions.set(emoji, currentCount + 1);
        this.reactionCounts.set(sessionId, sessionReactions);

        // Broadcast reaction to session room
        const roomName = `session-${sessionId}`;
        this.io?.of('/live').to(roomName).emit('reaction:new', fullReactionData);
        
        // Send updated counts
        this.io?.of('/live').to(roomName).emit('reactions:updated', Object.fromEntries(sessionReactions));

        logger.info('Reaction sent', { sessionId, emoji, newCount: currentCount + 1 });

        // Track reaction event
        await this.trackEvent(sessionId, 'reaction', { emoji, socketId: socket.id });

      } catch (error) {
        logger.error('Error handling reaction', { error: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      try {
        const { sessionId, role } = socketData;

        if (sessionId) {
          // Broadcast leave to room
          const roomName = `session-${sessionId}`;
          socket.to(roomName).emit('user:left', { role, socketId: socket.id });

          logger.info('Socket disconnected from session', { sessionId, role, socketId: socket.id, reason });

          // Track disconnect event
          await this.trackEvent(sessionId, 'session_leave', { role, reason, socketId: socket.id });
        }

      } catch (error) {
        logger.error('Error handling disconnect', { error: error.message });
      }
    });

    // Handle reconnection
    socket.on('reconnect', () => {
      logger.info('Socket reconnected', { socketId: socket.id });
    });
  }

  private async validateSession(sessionId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: 'id' })
        .from({ liveSessions: 'live_sessions' })
        .where(eq('id', sessionId))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      logger.error('Session validation failed', { sessionId, error: error.message });
      return false;
    }
  }

  private async trackEvent(sessionId: string, eventType: string, meta: any = {}): Promise<void> {
    try {
      await db.insert(liveEvents).values({
        sessionId,
        eventType,
        meta: typeof meta === 'object' ? meta : { data: meta },
      });
    } catch (error) {
      logger.error('Failed to track event', { sessionId, eventType, error: error.message });
      // Don't throw - event tracking shouldn't break real-time functionality
    }
  }

  // Public methods for external use
  public getSessionState(sessionId: string): SessionState | null {
    return this.sessionStates.get(sessionId) || null;
  }

  public getReactionCounts(sessionId: string): Record<string, number> {
    const reactions = this.reactionCounts.get(sessionId) || new Map();
    return Object.fromEntries(reactions);
  }

  public updateState(sessionId: string, state: SessionState): void {
    if (!this.io) return;

    this.sessionStates.set(sessionId, { ...state, timestamp: Date.now() });
    const roomName = `session-${sessionId}`;
    this.io.of('/live').to(roomName).emit('state:updated', state);
  }

  public getActiveConnections(): number {
    return this.io?.of('/live').sockets.size || 0;
  }
}

// Singleton instance
export const liveSessionsManager = new LiveSessionsManager();

// Helper function to import this as eq from drizzle-orm
import { eq } from 'drizzle-orm';

export default liveSessionsManager;