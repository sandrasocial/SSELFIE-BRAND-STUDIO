import { Router } from 'express';
import { requireStackAuth } from '../stack-auth.js';
import { storage } from '../storage.js';
import { insertConceptCardSchema } from '../../shared/schema.js';
import { z } from 'zod';
const router = Router();
router.get('/', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.claims?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { conversationId } = req.query;
        const conceptCards = await storage.getUserConceptCards(userId, conversationId);
        res.json({ conceptCards });
    }
    catch (error) {
        console.error('❌ CONCEPT CARDS: Get error:', error);
        res.status(500).json({
            error: 'Failed to retrieve concept cards',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
router.post('/', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.claims?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const validationSchema = insertConceptCardSchema.extend({
            clientId: z.string().optional()
        });
        const validatedData = validationSchema.parse({
            ...req.body,
            userId
        });
        const conceptCard = await storage.createConceptCard(validatedData);
        console.log(`✅ CONCEPT CARD: Created ${conceptCard.id} for user ${userId}`);
        res.status(201).json({ conceptCard });
    }
    catch (error) {
        console.error('❌ CONCEPT CARDS: Create error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid concept card data',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'Failed to create concept card',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
router.get('/:id', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.claims?.sub;
        const { id } = req.params;
        const conceptCard = await storage.getConceptCard(id);
        if (!conceptCard) {
            return res.status(404).json({ error: 'Concept card not found' });
        }
        if (conceptCard.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json({ conceptCard });
    }
    catch (error) {
        console.error('❌ CONCEPT CARDS: Get by ID error:', error);
        res.status(500).json({
            error: 'Failed to retrieve concept card',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
router.patch('/:id', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.claims?.sub;
        const { id } = req.params;
        const existingCard = await storage.getConceptCard(id);
        if (!existingCard) {
            return res.status(404).json({ error: 'Concept card not found' });
        }
        if (existingCard.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
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
    }
    catch (error) {
        console.error('❌ CONCEPT CARDS: Update error:', error);
        res.status(500).json({
            error: 'Failed to update concept card',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
router.patch('/:id/generation', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.claims?.sub;
        const { id } = req.params;
        const { generatedImages, isLoading, isGenerating, hasGenerated } = req.body;
        const existingCard = await storage.getConceptCard(id);
        if (!existingCard) {
            return res.status(404).json({ error: 'Concept card not found' });
        }
        if (existingCard.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const conceptCard = await storage.updateConceptCardGeneration(id, generatedImages || [], Boolean(isLoading), Boolean(isGenerating), Boolean(hasGenerated));
        console.log(`✅ CONCEPT CARD: Updated generation status ${id} for user ${userId}`);
        res.json({ conceptCard });
    }
    catch (error) {
        console.error('❌ CONCEPT CARDS: Update generation error:', error);
        res.status(500).json({
            error: 'Failed to update concept card generation',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
router.delete('/:id', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.claims?.sub;
        const { id } = req.params;
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
    }
    catch (error) {
        console.error('❌ CONCEPT CARDS: Delete error:', error);
        res.status(500).json({
            error: 'Failed to delete concept card',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
export default router;
//# sourceMappingURL=concept-cards.js.map