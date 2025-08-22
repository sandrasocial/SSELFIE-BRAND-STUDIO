import { describe, it, expect, beforeEach } from 'jest';
import { SessionManager } from '../src/auth/session';
import { Redis } from 'ioredis';

describe('Session Security', () => {
  let sessionManager;
  let mockRedis;

  beforeEach(() => {
    mockRedis = new Redis();
    sessionManager = new SessionManager(mockRedis);
  });

  describe('Session Creation', () => {
    it('should create sessions with secure defaults', async () => {
      const session = await sessionManager.createSession({
        userId: '123',
        userAgent: 'test-browser'
      });

      expect(session).toHaveProperty('id');
      expect(session.expiresAt).toBeDefined();
      expect(session.maxInactivity).toBe(30 * 60); // 30 minutes
    });

    it('should enforce session entropy requirements', async () => {
      const session = await sessionManager.createSession({
        userId: '123'
      });

      expect(session.id).toMatch(/^[A-Za-z0-9-_]{64}$/);
    });
  });

  describe('Session Validation', () => {
    it('should detect session fixation attempts', async () => {
      const session = await sessionManager.createSession({
        userId: '123'
      });

      const validationResult = await sessionManager.validateSession({
        sessionId: session.id,
        userId: '456' // Different user
      });

      expect(validationResult.valid).toBe(false);
      expect(validationResult.error).toBe('Session fixation detected');
    });

    it('should enforce absolute session timeouts', async () => {
      const session = await sessionManager.createSession({
        userId: '123',
        maxAge: 1 // 1 second
      });

      await new Promise(resolve => setTimeout(resolve, 1100));

      const validationResult = await sessionManager.validateSession({
        sessionId: session.id,
        userId: '123'
      });

      expect(validationResult.valid).toBe(false);
      expect(validationResult.error).toBe('Session expired');
    });
  });

  describe('Session Termination', () => {
    it('should properly cleanup terminated sessions', async () => {
      const session = await sessionManager.createSession({
        userId: '123'
      });

      await sessionManager.terminateSession(session.id);

      const validationResult = await sessionManager.validateSession({
        sessionId: session.id,
        userId: '123'
      });

      expect(validationResult.valid).toBe(false);
    });

    it('should enforce session termination across all devices', async () => {
      const sessions = await Promise.all([
        sessionManager.createSession({ userId: '123', deviceId: 'device1' }),
        sessionManager.createSession({ userId: '123', deviceId: 'device2' })
      ]);

      await sessionManager.terminateAllUserSessions('123');

      const validations = await Promise.all(
        sessions.map(session => 
          sessionManager.validateSession({
            sessionId: session.id,
            userId: '123'
          })
        )
      );

      validations.forEach(validation => {
        expect(validation.valid).toBe(false);
      });
    });
  });

  describe('Concurrent Session Management', () => {
    it('should enforce max concurrent sessions per user', async () => {
      // Create max allowed sessions
      const maxSessions = 5;
      for(let i = 0; i < maxSessions; i++) {
        await sessionManager.createSession({
          userId: '123',
          deviceId: `device${i}`
        });
      }

      // Try to create one more
      await expect(
        sessionManager.createSession({
          userId: '123',
          deviceId: 'deviceExtra'
        })
      ).rejects.toThrow('Max concurrent sessions reached');
    });

    it('should properly handle session priority', async () => {
      const sessions = [];
      // Create max sessions
      for(let i = 0; i < 5; i++) {
        const session = await sessionManager.createSession({
          userId: '123',
          deviceId: `device${i}`,
          priority: i
        });
        sessions.push(session);
      }

      // Create higher priority session
      await sessionManager.createSession({
        userId: '123',
        deviceId: 'deviceHigh',
        priority: 10
      });

      // Lowest priority session should be terminated
      const validation = await sessionManager.validateSession({
        sessionId: sessions[0].id,
        userId: '123'
      });

      expect(validation.valid).toBe(false);
      expect(validation.error).toBe('Session terminated due to priority');
    });
  });
});