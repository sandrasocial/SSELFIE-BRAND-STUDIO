import { Router } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import { storage } from '../../storage.js';
const router = Router();
router.get('/api/gallery', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        res.setHeader('Cache-Control', 'no-store');
        console.log('🔍 Gallery: Fetching images for user:', userId);
        const aiImages = await storage.getAIImages(userId);
        console.log('📊 Gallery: Found', aiImages.length, 'AI images');
        const generatedImages = await storage.getGeneratedImages(userId);
        console.log('📊 Gallery: Found', generatedImages.length, 'generated images');
        const allImages = [
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
        allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log('📊 Gallery: Returning', allImages.length, 'total images');
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
router.get('/api/gallery-images', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    try {
        res.setHeader('Cache-Control', 'no-store');
        console.log('🔍 Gallery: Fetching images for user:', userId);
        const aiImages = await storage.getAIImages(userId);
        console.log('📊 Gallery: Found', aiImages.length, 'AI images');
        const generatedImages = await storage.getGeneratedImages(userId);
        console.log('📊 Gallery: Found', generatedImages.length, 'generated images');
        const allImages = [
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
        allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log('📊 Gallery: Returning', allImages.length, 'total images');
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
router.post('/api/gallery/upload', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageUrl, metadata } = req.body;
    validateRequired({ imageUrl }, ['imageUrl']);
    const imageId = `img_${Date.now()}`;
    const responseData = {
        data: { imageId },
        message: 'Image uploaded successfully'
    };
    sendSuccess(res, responseData, 'Image uploaded successfully', 201);
}));
router.post('/api/gallery/save', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageUrl, prompt, style } = req.body;
    validateRequired({ imageUrl }, ['imageUrl']);
    const imageId = `img_${Date.now()}`;
    const responseData = {
        data: { imageId },
        message: 'Image saved to gallery'
    };
    sendSuccess(res, responseData, 'Image saved to gallery', 201);
}));
router.post('/api/gallery/generate', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { prompt, style, count } = req.body;
    validateRequired({ prompt }, ['prompt']);
    const jobId = `gen_${Date.now()}`;
    const responseData = {
        data: { jobId },
        message: 'Image generation started'
    };
    sendSuccess(res, responseData, 'Image generation started', 202);
}));
router.get('/api/gallery/category/:category', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { category } = req.params;
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
router.get('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageId } = req.params;
    const image = {
        id: imageId,
        userId,
        url: 'mock-url',
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
router.post('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageId } = req.params;
    const { metadata } = req.body;
    validateRequired({ metadata }, ['metadata']);
    const responseData = {
        data: { success: true },
        message: 'Image metadata updated'
    };
    sendSuccess(res, responseData);
}));
router.delete('/api/gallery/image/:imageId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { imageId } = req.params;
    const responseData = {
        data: { success: true },
        message: 'Image deleted successfully'
    };
    sendSuccess(res, responseData);
}));
router.get('/api/gallery/tracker/:trackerId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { trackerId } = req.params;
    const tracker = {
        id: trackerId,
        status: 'completed'
    };
    const responseData = {
        data: { tracker }
    };
    sendSuccess(res, responseData);
}));
router.get('/api/gallery/prediction/:predictionId', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { predictionId } = req.params;
    const prediction = {
        id: predictionId,
        status: 'completed'
    };
    const responseData = {
        data: { prediction }
    };
    sendSuccess(res, responseData);
}));
router.post('/api/gallery/concept', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { concept, style, count } = req.body;
    validateRequired({ concept }, ['concept']);
    const jobId = `concept_${Date.now()}`;
    const responseData = {
        data: { jobId },
        message: 'Concept generation started'
    };
    sendSuccess(res, responseData, 'Concept generation started', 202);
}));
router.post('/api/gallery/style', requireStackAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { style, count } = req.body;
    validateRequired({ style }, ['style']);
    const jobId = `style_${Date.now()}`;
    const responseData = {
        data: { jobId },
        message: 'Style generation started'
    };
    sendSuccess(res, responseData, 'Style generation started', 202);
}));
export default router;
router.get('/api/debug/gallery-inspect', requireStackAuth, asyncHandler(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const stackUserId = req.user.id;
    const linkedUser = await storage.getUserByStackAuthId(stackUserId);
    const legacyUserId = linkedUser?.id;
    const sample = (arr, n = 5) => (Array.isArray(arr) ? arr.slice(0, n) : []);
    const aiStack = await storage.getAIImages(stackUserId);
    const genStack = await storage.getGeneratedImages(stackUserId);
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
//# sourceMappingURL=gallery.js.map