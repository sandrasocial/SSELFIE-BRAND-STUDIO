import { Router } from 'express';
import multer from 'multer';
import { requireStackAuth } from '../stack-auth.js';
import { storage } from '../storage.js';
import { insertBrandAssetSchema } from '../../shared/schema.js';
import { z } from 'zod';
import { BulletproofUploadService } from '../bulletproof-upload-service.js';
const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
router.get('/', requireStackAuth, async (req, res) => {
    try {
        if (process.env.BRAND_ASSETS_ENABLED !== '1') {
            return res.status(404).json({ error: 'Feature not available' });
        }
        const userId = req.user?.id || req.user?.claims?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const assets = await storage.getBrandAssets(userId);
        res.json({ assets });
    }
    catch (error) {
        console.error('❌ BRAND ASSETS: List error:', error);
        res.status(500).json({
            error: 'Failed to retrieve brand assets',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
router.post('/', requireStackAuth, upload.single('asset'), async (req, res) => {
    try {
        if (process.env.BRAND_ASSETS_ENABLED !== '1') {
            return res.status(404).json({ error: 'Feature not available' });
        }
        const userId = req.user?.id || req.user?.claims?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { kind } = req.body;
        if (!kind || !['logo', 'product'].includes(kind)) {
            return res.status(400).json({ error: 'Invalid kind. Must be "logo" or "product"' });
        }
        console.log(`🎨 BRAND ASSETS: Uploading ${kind} asset for user ${userId}`);
        const s3Key = `brand-assets/${userId}/${Date.now()}-${file.originalname}`;
        const uploadResult = await BulletproofUploadService.uploadToS3(file.buffer, s3Key, file.mimetype);
        if (!uploadResult.success || !uploadResult.s3Url) {
            return res.status(500).json({ error: 'Failed to upload asset to storage' });
        }
        let meta = {};
        try {
            meta = {
                contentType: file.mimetype,
                originalName: file.originalname
            };
        }
        catch (error) {
            console.warn('Could not extract image metadata:', error);
        }
        const assetData = insertBrandAssetSchema.parse({
            userId,
            kind,
            url: uploadResult.s3Url,
            filename: file.originalname,
            fileSize: file.size,
            meta
        });
        const savedAsset = await storage.saveBrandAsset(assetData);
        console.log(`✅ BRAND ASSETS: ${kind} asset uploaded successfully with ID ${savedAsset.id}`);
        res.json({ asset: savedAsset });
    }
    catch (error) {
        console.error('❌ BRAND ASSETS: Upload error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Invalid asset data',
                details: error.errors
            });
        }
        res.status(500).json({
            error: 'Failed to upload brand asset',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
router.delete('/:assetId', requireStackAuth, async (req, res) => {
    try {
        if (process.env.BRAND_ASSETS_ENABLED !== '1') {
            return res.status(404).json({ error: 'Feature not available' });
        }
        const userId = req.user?.id || req.user?.claims?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const assetId = parseInt(req.params.assetId);
        if (isNaN(assetId)) {
            return res.status(400).json({ error: 'Invalid asset ID' });
        }
        const asset = await storage.getBrandAsset(assetId, userId);
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        const deleted = await storage.deleteBrandAsset(assetId, userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Asset not found or already deleted' });
        }
        console.log(`✅ BRAND ASSETS: Asset ${assetId} deleted successfully`);
        res.json({ success: true });
    }
    catch (error) {
        console.error('❌ BRAND ASSETS: Delete error:', error);
        res.status(500).json({
            error: 'Failed to delete brand asset',
            details: process.env['NODE_ENV'] === 'development' ? error.message : undefined
        });
    }
});
export default router;
//# sourceMappingURL=brand-assets.js.map