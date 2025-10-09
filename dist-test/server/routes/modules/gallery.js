/**
 * Gallery Routes
 * Handles image gallery management
 */
import express from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import { storage } from '../../storage.js';
const router = express.Router();
// Favorites endpoints - stubs to avoid 404 errors
router.get('/api/images/favorites', requireStackAuth, asyncHandler(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    sendSuccess(res, { favorites: [] });
}));
router.post('/api/images/:id/favorite', requireStackAuth, asyncHandler(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    sendSuccess(res, { ok: true });
}));
// Get user gallery
router.get('/api/gallery', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        res.setHeader('Cache-Control', 'no-store');
        // Get AI images from the database
        const aiImages = await storage.getAIImages(userId);
        // Also get generated images (newer table)
        const generatedImages = await storage.getGeneratedImages(userId);
        // Combine both sources and format for frontend
        const allImages = [
            // AI Images (legacy format)
            ...aiImages.map(img => ({
                id: img.id,
                userId: img.userId,
                url: img.imageUrl,
                prompt: img.prompt,
                style: img.style,
                category: img.category || 'gallery',
                source: img.source || 'workspace',
                createdAt: img.createdAt,
                metadata: {
                    width: 1024,
                    height: 1024,
                    format: 'png',
                    size: '1.2MB'
                }
            })),
            // Generated Images (newer format)
            ...generatedImages.map(img => ({
                id: img.id,
                userId: img.userId,
                url: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : ''),
                prompt: img.prompt,
                style: img.category || 'gallery',
                category: img.category || 'gallery',
                source: 'maya-generation',
                createdAt: img.createdAt,
                metadata: {
                    width: 1024,
                    height: 1024,
                    format: 'png',
                    size: '1.2MB'
                }
            }))
        ];
        // Sort by creation date (newest first)
        allImages.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
        const responseData = {
            data: {
                gallery: allImages,
                count: allImages.length
            }
        };
        sendSuccess(res, responseData);
    }
    catch (error) {
        console.error('❌ Gallery: Error fetching images:', error);
        throw createError.internal('Failed to fetch gallery images');
    }
}));
// Get user gallery images (frontend calls this endpoint)
router.get('/api/gallery-images', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        res.setHeader('Cache-Control', 'no-store');
        // Get AI images from the database
        const aiImages = await storage.getAIImages(userId);
        // Also get generated images (newer table)
        const generatedImages = await storage.getGeneratedImages(userId);
        // Combine both sources and format for frontend
        const allImages = [
            // AI Images (legacy format)
            ...aiImages.map(img => ({
                id: img.id,
                userId: img.userId,
                url: img.imageUrl,
                prompt: img.prompt,
                style: img.style,
                category: img.category || 'gallery',
                source: img.source || 'workspace',
                createdAt: img.createdAt,
                metadata: {
                    width: 1024,
                    height: 1024,
                    format: 'png',
                    size: '1.2MB'
                }
            })),
            // Generated Images (newer format)
            ...generatedImages.map(img => ({
                id: img.id,
                userId: img.userId,
                url: img.selectedUrl || (img.imageUrls ? JSON.parse(img.imageUrls)[0] : ''),
                prompt: img.prompt,
                style: img.category || 'gallery',
                category: img.category || 'gallery',
                source: 'maya-generation',
                createdAt: img.createdAt,
                metadata: {
                    width: 1024,
                    height: 1024,
                    format: 'png',
                    size: '1.2MB'
                }
            }))
        ];
        // Sort by creation date (newest first)
        allImages.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
        const responseData = {
            data: allImages
        };
        sendSuccess(res, responseData);
    }
    catch (error) {
        console.error('❌ Gallery: Error fetching images:', error);
        throw createError.internal('Failed to fetch gallery images');
    }
}));
// Upload image to gallery
router.post('/api/gallery/upload', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageUrl, metadata } = req.body;
    validateRequired({ imageUrl }, ['imageUrl']);
    // Mock implementation - replace with actual upload service
    const imageId = `img_${Date.now()}`;
    const responseData = {
        data: { imageId },
        message: 'Image uploaded successfully'
    };
    sendSuccess(res, responseData, 'Image uploaded successfully', 201);
}));
// Save image to gallery
router.post('/api/gallery/save', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageUrl, prompt, style } = req.body;
    validateRequired({ imageUrl }, ['imageUrl']);
    // Mock implementation - replace with actual save service
    const imageId = `img_${Date.now()}`;
    const responseData = {
        data: { imageId },
        message: 'Image saved to gallery'
    };
    sendSuccess(res, responseData, 'Image saved to gallery', 201);
}));
// Generate gallery image
router.post('/api/gallery/generate', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { prompt, style, count } = req.body;
    validateRequired({ prompt }, ['prompt']);
    // Mock implementation - replace with actual generation service
    const jobId = `gen_${Date.now()}`;
    const responseData = {
        data: { jobId },
        message: 'Image generation started'
    };
    sendSuccess(res, responseData, 'Image generation started', 202);
}));
// Get gallery by category
router.get('/api/gallery/category/:category', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { category } = req.params;
    // Mock implementation - replace with actual category service
    const gallery = [];
    const responseData = {
        data: {
            gallery,
            category,
            count: gallery.length
        }
    };
    sendSuccess(res, responseData);
}));
// Get specific image
router.get('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageId } = req.params;
    // Mock implementation - replace with actual image service
    const image = {
        id: imageId,
        userId,
        url: 'mock-url',
        prompt: null,
        style: null,
        category: 'gallery',
        source: 'workspace',
        createdAt: new Date(),
        metadata: {
            width: 1024,
            height: 1024,
            format: 'png',
            size: '1.2MB'
        }
    };
    const responseData = {
        data: { image }
    };
    sendSuccess(res, responseData);
}));
// Update image metadata
router.post('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageId } = req.params;
    const { metadata } = req.body;
    validateRequired({ metadata }, ['metadata']);
    // Mock implementation - replace with actual update service
    const responseData = {
        data: { success: true },
        message: 'Image metadata updated'
    };
    sendSuccess(res, responseData);
}));
// Delete image
router.delete('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageId } = req.params;
    // Mock implementation - replace with actual delete service
    const responseData = {
        data: { success: true },
        message: 'Image deleted successfully'
    };
    sendSuccess(res, responseData);
}));
// Get generation tracker
router.get('/api/gallery/tracker/:trackerId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { trackerId } = req.params;
    // Mock implementation - replace with actual tracker service
    const tracker = {
        id: trackerId,
        status: 'completed'
    };
    const responseData = {
        data: { tracker }
    };
    sendSuccess(res, responseData);
}));
// Get prediction status
router.get('/api/gallery/prediction/:predictionId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { predictionId } = req.params;
    // Mock implementation - replace with actual prediction service
    const prediction = {
        id: predictionId,
        status: 'completed'
    };
    const responseData = {
        data: { prediction }
    };
    sendSuccess(res, responseData);
}));
// Generate concept images
router.post('/api/gallery/concept', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { concept, style, count } = req.body;
    validateRequired({ concept }, ['concept']);
    // Mock implementation - replace with actual concept service
    const jobId = `concept_${Date.now()}`;
    const responseData = {
        data: { jobId },
        message: 'Concept generation started'
    };
    sendSuccess(res, responseData, 'Concept generation started', 202);
}));
// Generate style images
router.post('/api/gallery/style', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { style, count } = req.body;
    validateRequired({ style }, ['style']);
    // Mock implementation - replace with actual style service
    const jobId = `style_${Date.now()}`;
    const responseData = {
        data: { jobId },
        message: 'Style generation started'
    };
    sendSuccess(res, responseData, 'Style generation started', 202);
}));
export default router;
// DEBUG: Inspect gallery linkage for current user and any linked legacy ID
router.get('/api/debug/gallery-inspect', requireStackAuth, asyncHandler(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const stackUserId = req.user.id;
    const linkedUser = await storage.getUserByStackAuthId(stackUserId);
    const legacyUserId = linkedUser?.id;
    // Helper to safely sample arrays
    const sample = (arr, n = 5) => (Array.isArray(arr) ? arr.slice(0, n) : []);
    // Fetch images for stack ID
    const aiStack = await storage.getAIImages(stackUserId);
    const genStack = await storage.getGeneratedImages(stackUserId);
    // If there is a legacy linked id, fetch those as well
    let aiLegacy = [];
    let genLegacy = [];
    if (legacyUserId) {
        aiLegacy = await storage.getAIImages(String(legacyUserId));
        genLegacy = await storage.getGeneratedImages(String(legacyUserId));
    }
    const result = {
        stackUserId,
        legacyUserId: legacyUserId || null,
        counts: {
            aiForStackId: aiStack.length,
            generatedForStackId: genStack.length,
            aiForLegacyId: aiLegacy.length,
            generatedForLegacyId: genLegacy.length,
        },
        samples: {
            aiForStackId: sample(aiStack),
            generatedForStackId: sample(genStack),
            aiForLegacyId: sample(aiLegacy),
            generatedForLegacyId: sample(genLegacy),
        }
    };
    res.json(result);
}));
