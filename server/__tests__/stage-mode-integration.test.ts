/**
 * Stage Mode Integration Tests
 * Tests for real-time functionality, analytics, and LevelPartner integration
 */

import request from 'supertest';
import { Express } from 'express';

// Mock the database
const mockDb = {
  insert: jest.fn(),
  select: jest.fn(),
  update: jest.fn(),
};

// Mock drizzle
jest.mock('../db', () => ({
  db: mockDb
}));

// Mock the schema
jest.mock('../../shared/schema', () => ({
  liveSessions: {
    id: 'id',
    title: 'title',
    deckUrl: 'deck_url',
    mentiUrl: 'menti_url',
    ctaUrl: 'cta_url',
    createdBy: 'created_by',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  liveEvents: {
    id: 'id',
    sessionId: 'session_id',
    eventType: 'event_type',
    meta: 'meta',
    userAgent: 'user_agent',
    ipAddress: 'ip_address',
    utmSource: 'utm_source',
    utmCampaign: 'utm_campaign',
    createdAt: 'created_at',
  },
}));

// Mock Socket.IO
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    of: jest.fn().mockReturnValue({
      on: jest.fn(),
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
      emit: jest.fn(),
      sockets: { size: 0 },
    }),
    use: jest.fn(),
    on: jest.fn(),
  })),
}));

// Mock fetch for LevelPartner
global.fetch = jest.fn();

describe('Stage Mode Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LIVE_SOCKET_ENABLED = '1';
    process.env.LEVELPARTNER_API_URL = 'https://api.test.levelpartner.com/v1/subscriptions';
    process.env.LEVELPARTNER_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.LIVE_SOCKET_ENABLED;
    delete process.env.LEVELPARTNER_API_URL;
    delete process.env.LEVELPARTNER_API_KEY;
  });

  describe('Analytics API', () => {
    it('should track analytics events', async () => {
      const mockSession = {
        id: 'session-123',
        title: 'Test Session',
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockEvent = {
        id: 'event-456',
        sessionId: 'session-123',
        eventType: 'qr_view',
        createdAt: new Date(),
      };

      // Mock session exists check
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockSession])
          })
        })
      });

      // Mock event insertion
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockEvent])
        })
      });

      const app = require('express')();
      app.use(require('express').json());
      const { analyticsRoutes } = require('../routes/analytics');
      app.use('/api/analytics', analyticsRoutes);

      const response = await request(app)
        .post('/api/analytics/event')
        .send({
          sessionId: 'session-123',
          type: 'qr_view',
          utm_source: 'stage',
          utm_campaign: 'hair_experience',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventId).toBe('event-456');
    });

    it('should get session analytics', async () => {
      const mockSession = {
        id: 'session-123',
        title: 'Test Session',
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockEventCounts = [
        { eventType: 'qr_view', count: 5 },
        { eventType: 'cta_click', count: 3 },
      ];

      const mockRecentEvents = [
        { id: 'event-1', eventType: 'qr_view', meta: {}, createdAt: new Date() },
        { id: 'event-2', eventType: 'cta_click', meta: {}, createdAt: new Date() },
      ];

      // Mock the complex select queries
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockSession])
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue(mockEventCounts)
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockRecentEvents)
              })
            })
          })
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockResolvedValue([])
            })
          })
        });

      const app = require('express')();
      const { analyticsRoutes } = require('../routes/analytics');
      app.use('/api/analytics', analyticsRoutes);

      const response = await request(app)
        .get('/api/analytics/session/session-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.session.id).toBe('session-123');
      expect(response.body.data.eventBreakdown.qr_view).toBe(5);
      expect(response.body.data.eventBreakdown.cta_click).toBe(3);
    });
  });

  describe('LevelPartner Integration', () => {
    it('should send Stage Mode data to LevelPartner', async () => {
      const mockSession = {
        id: 'session-123',
        title: 'Hair Transformation Workshop',
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockEvent = {
        id: 'event-456',
        sessionId: 'session-123',
        eventType: 'signup_success',
        createdAt: new Date(),
      };

      // Mock session lookup
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockSession])
          })
        })
      });

      // Mock event insertion
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue([mockEvent])
      });

      // Mock successful LevelPartner response
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, id: 'lp-123' }),
      });

      const app = require('express')();
      app.use(require('express').json());
      
      // Mock auth middleware
      app.use((req: any, res: any, next: any) => {
        req.user = { id: 'user-123' };
        next();
      });

      const levelPartnerRoutes = require('../routes/levelpartner-webhook').default;
      app.use('/', levelPartnerRoutes);

      const response = await request(app)
        .post('/levelpartner-signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          sessionId: 'session-123',
          utm_source: 'stage',
          utm_campaign: 'hair_experience',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.levelpartner_status).toBe('success');
      expect(response.body.campaign_data.stage_mode).toBeDefined();
      expect(response.body.campaign_data.stage_mode.session_id).toBe('session-123');
      expect(response.body.campaign_data.stage_mode.session_title).toBe('Hair Transformation Workshop');

      // Verify LevelPartner was called with correct data
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.levelpartner.com/v1/subscriptions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
          body: expect.stringContaining('stage_mode'),
        })
      );
    });

    it('should handle missing session gracefully', async () => {
      // Mock no session found
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      // Mock successful LevelPartner response
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, id: 'lp-123' }),
      });

      const app = require('express')();
      app.use(require('express').json());
      
      // Mock auth middleware
      app.use((req: any, res: any, next: any) => {
        req.user = { id: 'user-123' };
        next();
      });

      const levelPartnerRoutes = require('../routes/levelpartner-webhook').default;
      app.use('/', levelPartnerRoutes);

      const response = await request(app)
        .post('/levelpartner-signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          sessionId: 'non-existent-session',
          utm_source: 'stage',
          utm_campaign: 'hair_experience',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.levelpartner_status).toBe('success');
      expect(response.body.campaign_data.stage_mode).toBeUndefined();
    });
  });

  describe('Real-time Socket.IO', () => {
    it('should initialize Socket.IO server when enabled', () => {
      const { liveSessionsManager } = require('../realtime/live-sessions');
      const mockHttpServer = {
        listen: jest.fn(),
      };

      expect(() => {
        liveSessionsManager.initialize(mockHttpServer);
      }).not.toThrow();
    });

    it('should not initialize Socket.IO when disabled', () => {
      process.env.LIVE_SOCKET_ENABLED = '0';
      
      const { liveSessionsManager } = require('../realtime/live-sessions');
      const mockHttpServer = {
        listen: jest.fn(),
      };

      // Should not throw and should log disabled message
      expect(() => {
        liveSessionsManager.initialize(mockHttpServer);
      }).not.toThrow();
    });
  });

  describe('Real-time State Management', () => {
    it('should manage session state correctly', () => {
      const { liveSessionsManager } = require('../realtime/live-sessions');
      
      const testState = {
        showPoll: true,
        showQR: false,
        showCTA: true,
        timestamp: Date.now(),
      };

      // Test state management methods
      expect(liveSessionsManager.getSessionState('session-123')).toBeNull();
      
      liveSessionsManager.updateState('session-123', testState);
      expect(liveSessionsManager.getSessionState('session-123')).toEqual(expect.objectContaining(testState));
      
      expect(liveSessionsManager.getReactionCounts('session-123')).toEqual({});
    });
  });
});
