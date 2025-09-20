/**
 * Analytics Routes
 * Handles Stage Mode event tracking and analytics
 */

import { Router } from 'express';
import { eq, sql, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { liveEvents, liveSessions, insertLiveEventSchema } from '../../shared/schema';
import { Logger } from '../utils/logger';
import { z } from 'zod';

const router = Router();
const logger = new Logger('AnalyticsRoutes');

// Event validation schema
const trackEventSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  type: z.enum(['qr_view', 'cta_click', 'signup_success', 'reaction', 'state_change', 'session_join', 'session_leave']),
  meta: z.record(z.any()).optional(),
  utm_source: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
});

/**
 * POST /api/analytics/event
 * Track analytics events for Stage Mode sessions
 */
router.post('/event', async (req, res) => {
  try {
    // Validate request body
    const validationResult = trackEventSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: { 
          message: 'Invalid event data', 
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        }
      });
    }

    const { sessionId, type, meta = {}, ...utmParams } = validationResult.data;

    // Verify session exists
    const sessionExists = await db
      .select({ id: liveSessions.id })
      .from(liveSessions)
      .where(eq(liveSessions.id, sessionId))
      .limit(1);

    if (sessionExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' }
      });
    }

    // Extract client information
    const userAgent = req.get('User-Agent') || undefined;
    const ipAddress = req.ip || req.connection.remoteAddress || undefined;

    // Create event record
    const eventData = {
      sessionId,
      eventType: type,
      meta,
      userAgent,
      ipAddress,
      utmSource: utmParams.utm_source || undefined,
      utmCampaign: utmParams.utm_campaign || undefined,
      utmMedium: utmParams.utm_medium || undefined,
      utmContent: utmParams.utm_content || undefined,
      utmTerm: utmParams.utm_term || undefined,
    };

    const result = await db.insert(liveEvents).values(eventData).returning();
    const event = result[0];

    logger.info('Analytics event tracked', { 
      eventId: event.id, 
      sessionId, 
      type, 
      utmSource: utmParams.utm_source 
    });

    return res.status(201).json({
      success: true,
      data: { eventId: event.id }
    });

  } catch (error) {
    logger.error('Error tracking analytics event', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to track event', code: 'INTERNAL_ERROR' }
    });
  }
});

/**
 * GET /api/analytics/session/:sessionId
 * Get analytics summary for a session
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Session ID is required', code: 'VALIDATION_ERROR' }
      });
    }

    // Verify session exists
    const session = await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.id, sessionId))
      .limit(1);

    if (session.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' }
      });
    }

    // Get event counts by type
    const eventCounts = await db
      .select({
        eventType: liveEvents.eventType,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(liveEvents)
      .where(eq(liveEvents.sessionId, sessionId))
      .groupBy(liveEvents.eventType);

    // Get recent events
    const recentEvents = await db
      .select({
        id: liveEvents.id,
        eventType: liveEvents.eventType,
        meta: liveEvents.meta,
        utmSource: liveEvents.utmSource,
        createdAt: liveEvents.createdAt,
      })
      .from(liveEvents)
      .where(eq(liveEvents.sessionId, sessionId))
      .orderBy(desc(liveEvents.createdAt))
      .limit(50);

    // Get UTM source breakdown
    const utmBreakdown = await db
      .select({
        utmSource: liveEvents.utmSource,
        utmCampaign: liveEvents.utmCampaign,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(liveEvents)
      .where(and(
        eq(liveEvents.sessionId, sessionId),
        sql`${liveEvents.utmSource} IS NOT NULL`
      ))
      .groupBy(liveEvents.utmSource, liveEvents.utmCampaign);

    // Calculate session metrics
    const sessionStats = {
      totalEvents: recentEvents.length,
      eventBreakdown: eventCounts.reduce((acc, { eventType, count }) => {
        acc[eventType] = count;
        return acc;
      }, {} as Record<string, number>),
      utmBreakdown: utmBreakdown.reduce((acc, { utmSource, utmCampaign, count }) => {
        const key = utmCampaign ? `${utmSource}/${utmCampaign}` : utmSource || 'direct';
        acc[key] = count;
        return acc;
      }, {} as Record<string, number>),
      recentEvents,
      session: session[0],
    };

    return res.json({
      success: true,
      data: sessionStats
    });

  } catch (error) {
    logger.error('Error retrieving session analytics', { error: error.message, sessionId: req.params.sessionId });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve analytics', code: 'INTERNAL_ERROR' }
    });
  }
});

/**
 * GET /api/analytics/sessions/summary
 * Get overall analytics summary for all sessions
 */
router.get('/sessions/summary', async (req, res) => {
  try {
    // Get session counts and metrics
    const sessionCounts = await db
      .select({
        totalSessions: sql<number>`COUNT(*)::int`,
        activeSessions: sql<number>`COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int`,
      })
      .from(liveSessions);

    // Get top event types across all sessions
    const topEventTypes = await db
      .select({
        eventType: liveEvents.eventType,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(liveEvents)
      .groupBy(liveEvents.eventType)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(10);

    // Get UTM source performance
    const utmPerformance = await db
      .select({
        utmSource: liveEvents.utmSource,
        totalEvents: sql<number>`COUNT(*)::int`,
        uniqueSessions: sql<number>`COUNT(DISTINCT session_id)::int`,
      })
      .from(liveEvents)
      .where(sql`${liveEvents.utmSource} IS NOT NULL`)
      .groupBy(liveEvents.utmSource)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(10);

    const summary = {
      sessions: sessionCounts[0] || { totalSessions: 0, activeSessions: 0 },
      eventTypes: topEventTypes,
      utmSources: utmPerformance,
    };

    return res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Error retrieving analytics summary', { error: error.message });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve summary', code: 'INTERNAL_ERROR' }
    });
  }
});

export { router as analyticsRoutes };