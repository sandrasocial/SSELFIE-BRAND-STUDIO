import { Router } from 'express';
import { requireStackAuth } from '../stack-auth.js';
import { storage } from '../storage.js';
import { insertImageVariantSchema } from '../../shared/schema.js';
import { z } from 'zod';
const router = Router();
const placementRequestSchema = z.object({
    imageId: z.number(),
    assetId: z.number(),
    mode: z.enum(['overlay', 'inpaint']),
    position: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number()
    }).optional(),
    scale: z.number().min(0.1).max(2.0).optional()
});
router.post('/place', requireStackAuth, async (req, res) => {
    try {
        if (process.env.BRAND_ASSETS_ENABLED !== '1') {
            return res.status(404).json({ error: 'Feature not available' });
        }
        const userId = req.user?.id || req.user?.claims?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const placementData = placementRequestSchema.parse(req.body);
        const { imageId, assetId, mode, position, scale } = placementData;
        console.log(`🎨 BRAND PLACEMENT: Processing ${mode} placement for user ${userId}`);
        console.log(`   Image ID: ${imageId}, Asset ID: ${assetId}`);
        const [image, asset] = await Promise.all([
            storage.getAIImage(userId, imageId),
            storage.getBrandAsset(assetId, userId)
        ]);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        if (!asset) {
            return res.status(404).json({ error: 'Brand asset not found' });
        }
        const variantData = insertImageVariantSchema.parse({
            userId,
            originalImageId: imageId,
            variantUrl: '',
            variantType: 'brand_placement',
            brandAssetId: assetId,
            placementData: {
                mode,
                position,
                scale: scale || 1.0,
                timestamp: new Date().toISOString()
            },
            processingStatus: 'pending'
        });
        const variant = await storage.saveImageVariant(variantData);
        if (mode === 'overlay') {
            console.log(`🖼️ OVERLAY MODE: Preparing client-side placement data`);
            res.json({
                success: true,
                variant: {
                    ...variant,
                    processingStatus: 'completed'
                },
                placementData: {
                    originalImageUrl: image.imageUrl,
                    assetUrl: asset.url,
                    position,
                    scale: scale || 1.0
                }
            });
        }
        else if (mode === 'inpaint') {
            console.log(`🎨 INPAINT MODE: Starting server-side processing`);
            try {
                processInpaintPlacement(variant.id, image.imageUrl, asset.url, position, scale);
                res.json({
                    success: true,
                    variant,
                    message: 'Inpaint processing started. Check status for completion.'
                });
            }
            catch (error) {
                console.error('❌ INPAINT ERROR:', error);
                await storage.updateImageVariant(variant.id, {
                    processingStatus: 'failed'
                });
                return res.status(500).json({
                    error: 'Failed to start inpaint processing',
                    variantId: variant.id
                });
            }
        }
    }
    catch (error) {
        console.error('❌ BRAND PLACEMENT: Processing error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid placement data',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'Failed to process brand placement',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
router.get('/variants/:variantId/status', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.claims?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const variantId = parseInt(req.params.variantId);
        if (isNaN(variantId)) {
            return res.status(400).json({ error: 'Invalid variant ID' });
        }
        const variant = await storage.getImageVariant(variantId, userId);
        if (!variant) {
            return res.status(404).json({ error: 'Variant not found' });
        }
        res.json({
            variantId: variant.id,
            status: variant.processingStatus,
            variantUrl: variant.variantUrl,
            placementData: variant.placementData
        });
    }
    catch (error) {
        console.error('❌ VARIANT STATUS: Error:', error);
        res.status(500).json({
            error: 'Failed to get variant status',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
async function processInpaintPlacement(variantId, originalImageUrl, assetUrl, position, scale) {
    try {
        console.log(`🔄 INPAINT PROCESSING: Starting for variant ${variantId}`);
        await storage.updateImageVariant(variantId, {
            processingStatus: 'processing'
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockResultUrl = `https://example.s3.amazonaws.com/variants/result-${variantId}.png`;
        await storage.updateImageVariant(variantId, {
            processingStatus: 'completed',
            variantUrl: mockResultUrl
        });
        console.log(`✅ INPAINT PROCESSING: Completed for variant ${variantId}`);
    }
    catch (error) {
        console.error(`❌ INPAINT PROCESSING: Failed for variant ${variantId}:`, error);
        await storage.updateImageVariant(variantId, {
            processingStatus: 'failed'
        });
    }
}
export default router;
//# sourceMappingURL=brand-placement.js.map