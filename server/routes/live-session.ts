/**
 * Live Session Routes
 * Handles Stage Mode interactive presentation sessions
 */

import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { liveSessions, insertLiveSessionSchema, LiveSession, InsertLiveSession } from '../../shared/schema';
import { Logger } from '../utils/logger';
import { z } from 'zod';

const router = Router();
const logger = new Logger('LiveSessionRoutes');

// Validation schemas
const createLiveSessionSchema = z.object({
  deckUrl: z.string().url().optional().or(z.literal('')),
  mentiUrl: z.string().url().optional().or(z.literal('')),
  ctaUrl: z.string().url().optional().or(z.literal('')),
  title: z.string().min(1, 'Title is required'),
});

const updateLiveSessionSchema = z.object({
  deckUrl: z.string().url().optional().or(z.literal('')),
  mentiUrl: z.string().url().optional().or(z.literal('')),
  ctaUrl: z.string().url().optional().or(z.literal('')),
  title: z.string().min(1).optional(),
});

/**
 * POST /api/live/session
 * Create a new live session
 */
router.post('/session', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required', code: 'UNAUTHORIZED' }
      });
    }

    // Validate request body
    const validationResult = createLiveSessionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: { 
          message: 'Invalid input', 
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        }
      });
    }

    const { deckUrl, mentiUrl, ctaUrl, title } = validationResult.data;

    // Create the session
    const sessionData: InsertLiveSession = {
      deckUrl: deckUrl || null,
      mentiUrl: mentiUrl || null,
      ctaUrl: ctaUrl || null,
      title,
      createdBy: userId,
    };

    const result = await db.insert(liveSessions).values(sessionData).returning();
    const session = result[0];

    logger.info('Live session created', { sessionId: session.id, userId, title });

    return res.status(201).json({
      success: true,
      data: { session }
    });

  } catch (error) {
    logger.error('Error creating live session', { error: error.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create live session', code: 'INTERNAL_ERROR' }
    });
  }
});

/**
 * GET /api/live/session/:id
 * Get a live session by ID
 */
router.get('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Session ID is required', code: 'VALIDATION_ERROR' }
      });
    }

    const session = await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.id, id))
      .limit(1);

    if (session.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found', code: 'NOT_FOUND' }
      });
    }

    logger.info('Live session retrieved', { sessionId: id });

    return res.json({
      success: true,
      data: { session: session[0] }
    });

  } catch (error) {
    logger.error('Error retrieving live session', { error: error.message, sessionId: req.params.id });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve live session', code: 'INTERNAL_ERROR' }
    });
  }
});

/**
 * PATCH /api/live/session/:id
 * Update a live session
 */
router.patch('/session/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required', code: 'UNAUTHORIZED' }
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Session ID is required', code: 'VALIDATION_ERROR' }
      });
    }

    // Validate request body
    const validationResult = updateLiveSessionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: { 
          message: 'Invalid input', 
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        }
      });
    }

    // Check if session exists and user has permission to update
    const existingSession = await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.id, id))
      .limit(1);

    if (existingSession.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found', code: 'NOT_FOUND' }
      });
    }

    if (existingSession[0].createdBy !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Permission denied', code: 'FORBIDDEN' }
      });
    }

    // Update the session
    const updateData: Partial<InsertLiveSession> = {};
    const { deckUrl, mentiUrl, ctaUrl, title } = validationResult.data;

    if (deckUrl !== undefined) updateData.deckUrl = deckUrl || null;
    if (mentiUrl !== undefined) updateData.mentiUrl = mentiUrl || null;
    if (ctaUrl !== undefined) updateData.ctaUrl = ctaUrl || null;
    if (title !== undefined) updateData.title = title;

    const result = await db
      .update(liveSessions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(liveSessions.id, id))
      .returning();

    const updatedSession = result[0];

    logger.info('Live session updated', { sessionId: id, userId });

    return res.json({
      success: true,
      data: { session: updatedSession }
    });

  } catch (error) {
    logger.error('Error updating live session', { 
      error: error.message, 
      sessionId: req.params.id, 
      userId: req.user?.id 
    });
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update live session', code: 'INTERNAL_ERROR' }
    });
  }
});

export { router as liveSessionRoutes };
