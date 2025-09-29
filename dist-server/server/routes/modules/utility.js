import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { asyncHandler, createError, sendSuccess } from '../middleware/error-handler.js';
const router = Router();
router.get('/health', (req, res) => {
    sendSuccess(res, {
        status: 'healthy',
        service: 'SSELFIE Studio',
        timestamp: new Date().toISOString(),
    });
});
router.get('/api/health', (req, res) => {
    sendSuccess(res, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        env: process.env['NODE_ENV'] || 'development'
    });
});
router.get('/', (req, res) => {
    res.status(200).send('SSELFIE Studio API');
});
router.get("/training-zip/:filename", asyncHandler(async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'training-zips', filename);
    if (!fs.existsSync(filePath)) {
        throw createError.notFound('Training file not found');
    }
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        throw createError.internal('Error streaming file', { filename });
    });
}));
export default router;
//# sourceMappingURL=utility.js.map