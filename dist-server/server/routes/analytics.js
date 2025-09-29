import { Router } from 'express';
import { eq, sql, desc, and } from 'drizzle-orm';
import { db } from '../db.js';
import { liveEvents, liveSessions } from '../../shared/schema.js';
import { Logger } from '../utils/logger.js';
import { z } from 'zod';
const router = Router();
const logger = new Logger('AnalyticsRoutes');
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
router.post('/event', async (req, res) => {
    try {
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
        const userAgent = req.get('User-Agent') || undefined;
        const ipAddress = req.ip || req.connection.remoteAddress || undefined;
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
    }
    catch (error) {
        logger.error('Error tracking analytics event', { error: error.message });
        return res.status(500).json({
            success: false,
            error: { message: 'Failed to track event', code: 'INTERNAL_ERROR' }
        });
    }
});
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: { message: 'Session ID is required', code: 'VALIDATION_ERROR' }
            });
        }
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
        const eventCounts = await db
            .select({
            eventType: liveEvents.eventType,
            count: sql `COUNT(*)::int`,
        })
            .from(liveEvents)
            .where(eq(liveEvents.sessionId, sessionId))
            .groupBy(liveEvents.eventType);
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
        const utmBreakdown = await db
            .select({
            utmSource: liveEvents.utmSource,
            utmCampaign: liveEvents.utmCampaign,
            count: sql `COUNT(*)::int`,
        })
            .from(liveEvents)
            .where(and(eq(liveEvents.sessionId, sessionId), sql `${liveEvents.utmSource} IS NOT NULL`))
            .groupBy(liveEvents.utmSource, liveEvents.utmCampaign);
        const sessionStats = {
            totalEvents: recentEvents.length,
            eventBreakdown: eventCounts.reduce((acc, { eventType, count }) => {
                acc[eventType] = count;
                return acc;
            }, {}),
            utmBreakdown: utmBreakdown.reduce((acc, { utmSource, utmCampaign, count }) => {
                const key = utmCampaign ? `${utmSource}/${utmCampaign}` : utmSource || 'direct';
                acc[key] = count;
                return acc;
            }, {}),
            recentEvents,
            session: session[0],
        };
        return res.json({
            success: true,
            data: sessionStats
        });
    }
    catch (error) {
        logger.error('Error retrieving session analytics', { error: error.message, sessionId: req.params.sessionId });
        return res.status(500).json({
            success: false,
            error: { message: 'Failed to retrieve analytics', code: 'INTERNAL_ERROR' }
        });
    }
});
router.get('/sessions/summary', async (req, res) => {
    try {
        const sessionCounts = await db
            .select({
            totalSessions: sql `COUNT(*)::int`,
            activeSessions: sql `COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int`,
        })
            .from(liveSessions);
        const topEventTypes = await db
            .select({
            eventType: liveEvents.eventType,
            count: sql `COUNT(*)::int`,
        })
            .from(liveEvents)
            .groupBy(liveEvents.eventType)
            .orderBy(desc(sql `COUNT(*)`))
            .limit(10);
        const utmPerformance = await db
            .select({
            utmSource: liveEvents.utmSource,
            totalEvents: sql `COUNT(*)::int`,
            uniqueSessions: sql `COUNT(DISTINCT session_id)::int`,
        })
            .from(liveEvents)
            .where(sql `${liveEvents.utmSource} IS NOT NULL`)
            .groupBy(liveEvents.utmSource)
            .orderBy(desc(sql `COUNT(*)`))
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
    }
    catch (error) {
        logger.error('Error retrieving analytics summary', { error: error.message });
        return res.status(500).json({
            success: false,
            error: { message: 'Failed to retrieve summary', code: 'INTERNAL_ERROR' }
        });
    }
});
export { router as analyticsRoutes };
//# sourceMappingURL=analytics.js.map