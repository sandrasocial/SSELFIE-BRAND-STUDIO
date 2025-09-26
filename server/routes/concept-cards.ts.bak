/**
 * CONCEPT CARDS API ROUTES
 * 
 * Hybrid backend architecture for concept card management
 * Provides CRUD operations with ULID keys for unique React rendering
 * Includes idempotency support for reliable client-side operations
 */

import { Router } from 'express';
import { requireStackAuth } from '../stack-auth';
import { storage } from '../storage';
import { insertConceptCardSchema } from '../../shared/schema';
import { z } from 'zod';

const router = Router();

/**
 * GET /api/concepts
 * Get user's concept cards, optionally filtered by conversation
 */
router.get('/', requireStackAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { conversationId } = req.query;
    const conceptCards = await storage.getUserConceptCards(
      userId, 
      conversationId as string | undefined
    );

    res.json({ conceptCards });
  } catch (error) {
    console.error('❌ CONCEPT CARDS: Get error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve concept cards',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/concepts
 * Create new concept card with idempotency support
 */
router.post('/', requireStackAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate request body
    const validationSchema = insertConceptCardSchema.extend({
      clientId: z.string().optional() // For idempotency
    });
    
    const validatedData = validationSchema.parse({
      ...req.body,
      userId // Ensure userId matches authenticated user
    });

    // Create concept card (with idempotency check in storage)
    const conceptCard = await storage.createConceptCard(validatedData);

    console.log(`✅ CONCEPT CARD: Created ${conceptCard.id} for user ${userId}`);
    res.status(201).json({ conceptCard });
  } catch (error) {
    console.error('❌ CONCEPT CARDS: Create error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid concept card data',
        details: error.errors
      });
    }

    res.status(500).json({ 
      error: 'Failed to create concept card',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/concepts/:id
 * Get specific concept card by ID
 */
router.get('/:id', requireStackAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    const { id } = req.params;

    const conceptCard = await storage.getConceptCard(id);
    
    if (!conceptCard) {
      return res.status(404).json({ error: 'Concept card not found' });
    }

    // Ensure user owns the concept card
    if (conceptCard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ conceptCard });
  } catch (error) {
    console.error('❌ CONCEPT CARDS: Get by ID error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve concept card',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/concepts/:id
 * Update concept card (including generation status)
 */
router.patch('/:id', requireStackAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    const { id } = req.params;

    // Check ownership
    const existingCard = await storage.getConceptCard(id);
    if (!existingCard) {
      return res.status(404).json({ error: 'Concept card not found' });
    }
    if (existingCard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate updates
    const allowedUpdates = [
      'title', 'description', 'images', 'tags', 'status', 'sortOrder',
      'generatedImages', 'isLoading', 'isGenerating', 'hasGenerated'
    ];
    
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const conceptCard = await storage.updateConceptCard(id, updates);

    console.log(`✅ CONCEPT CARD: Updated ${id} for user ${userId}`);
    res.json({ conceptCard });
  } catch (error) {
    console.error('❌ CONCEPT CARDS: Update error:', error);
    res.status(500).json({ 
      error: 'Failed to update concept card',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/concepts/:id/generation
 * Update concept card generation status (for image generation workflow)
 */
router.patch('/:id/generation', requireStackAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    const { id } = req.params;
    const { generatedImages, isLoading, isGenerating, hasGenerated } = req.body;

    // Check ownership
    const existingCard = await storage.getConceptCard(id);
    if (!existingCard) {
      return res.status(404).json({ error: 'Concept card not found' });
    }
    if (existingCard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const conceptCard = await storage.updateConceptCardGeneration(
      id,
      generatedImages || [],
      Boolean(isLoading),
      Boolean(isGenerating),
      Boolean(hasGenerated)
    );

    console.log(`✅ CONCEPT CARD: Updated generation status ${id} for user ${userId}`);
    res.json({ conceptCard });
  } catch (error) {
    console.error('❌ CONCEPT CARDS: Update generation error:', error);
    res.status(500).json({ 
      error: 'Failed to update concept card generation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/concepts/:id
 * Delete concept card
 */
router.delete('/:id', requireStackAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?.claims?.sub;
    const { id } = req.params;

    // Check ownership
    const existingCard = await storage.getConceptCard(id);
    if (!existingCard) {
      return res.status(404).json({ error: 'Concept card not found' });
    }
    if (existingCard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await storage.deleteConceptCard(id);

    console.log(`✅ CONCEPT CARD: Deleted ${id} for user ${userId}`);
    res.status(204).send();
  } catch (error) {
    console.error('❌ CONCEPT CARDS: Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete concept card',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;