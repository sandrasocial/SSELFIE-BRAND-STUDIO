import './env-setup';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { securityHeaders, inputValidation } from './middleware/security.js';
import { rateLimits } from './middleware/rate-limiter.js';
import utilityRoutes from './routes/modules/utility.js';
import authRoutes from './routes/modules/auth.js';
import trainingRoutes from './routes/modules/training.js';
import galleryRoutes from './routes/modules/gallery.js';
import usageRoutes from './routes/modules/usage.js';
import mayaRoutes from './routes/modules/maya.js';
import aiGenerationRoutes from './routes/modules/ai-generation.js';
import { storage } from './storage.js';
import { BulletproofUploadService } from './bulletproof-upload-service.js';
import { requireStackAuth } from './routes/middleware/auth.js';
const app = express();
app.set('trust proxy', true);
app.use(securityHeaders);
app.use(inputValidation);
app.use(rateLimits.general);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', service: 'SSELFIE Studio', ts: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', ts: new Date().toISOString(), env: process.env['NODE_ENV'] || 'development' });
});
app.use('/', utilityRoutes);
app.use('/', authRoutes);
app.use('/', trainingRoutes);
app.use('/', galleryRoutes);
app.use('/', usageRoutes);
app.use('/', mayaRoutes);
app.use('/', aiGenerationRoutes);
app.post('/api/training/upload-selfies', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { images } = req.body;
        if (!userId || !Array.isArray(images)) {
            return res.status(400).json({ success: false, message: 'userId and images[] required' });
        }
        const result = await BulletproofUploadService.completeBulletproofUpload(userId, images);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(202).json(result);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Upload pipeline failed', error: error.message });
    }
});
app.post('/api/start-model-training', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { selfieImages } = req.body;
        if (!Array.isArray(selfieImages)) {
            return res.status(400).json({ success: false, errors: ['Missing selfieImages[]'], requiresRestart: true });
        }
        const result = await BulletproofUploadService.completeBulletproofUpload(userId, selfieImages);
        return res.status(result.success ? 202 : 400).json(result);
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Training start failed', requiresRestart: true });
    }
});
app.get('/api/user-model', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const model = await storage.getUserModelByUserId(userId);
        const needsTraining = !model || model.trainingStatus === 'not_started';
        const canRetrain = model?.hasRetrainingAccess === true || false;
        return res.json({ ...(model || {}), needsTraining, canRetrain });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to load user model' });
    }
});
app.get('/api/training-status', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const status = await storage.checkTrainingStatus(userId);
        return res.json(status);
    }
    catch (error) {
        return res.status(500).json({ needsRestart: false, reason: 'Status check failed' });
    }
});
app.post('/api/restart-training', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        await storage.deleteFailedTrainingData(userId);
        await storage.ensureUserModel(userId);
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Restart failed' });
    }
});
app.get('/api/training-progress/:userId', requireStackAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        if (userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const model = await storage.getUserModelByUserId(userId);
        return res.json({ progress: model?.trainingProgress ?? 0, status: model?.trainingStatus || 'not_started' });
    }
    catch (error) {
        return res.status(500).json({ progress: 0 });
    }
});
app.post('/api/user/update-gender', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { gender } = req.body;
        if (!gender)
            return res.status(400).json({ success: false, message: 'gender required' });
        await storage.updateUserProfile(userId, { gender });
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update gender' });
    }
});
app.get('/api/training/status', requireStackAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const model = await storage.getUserModelByUserId(userId);
        return res.json({
            userId,
            status: model?.trainingStatus || 'not_started',
            progress: model?.trainingProgress ?? 0,
            startedAt: model?.startedAt || null,
            completedAt: model?.completedAt || null,
            modelName: model?.modelName || null,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to get training status' });
    }
});
app.get('/api/training/check/:trainingId', requireStackAuth, async (req, res) => {
    try {
        const { trainingId } = req.params;
        return res.json({
            trainingId,
            status: 'checking',
            message: 'Training status check endpoint'
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to check training id' });
    }
});
if (process.env['NODE_ENV'] !== 'production') {
    const distPath = path.join(process.cwd(), 'client', 'dist');
    app.use(express.static(distPath));
    app.use('/assets', express.static(path.join(distPath, 'assets')));
}
(async () => {
    try {
        const { TrainingCompletionMonitor } = await import('./training-completion-monitor.js');
        TrainingCompletionMonitor.getInstance().startMonitoring();
        const { GenerationCompletionMonitor } = await import('./generation-completion-monitor.js');
        GenerationCompletionMonitor.getInstance().startMonitoring();
        const { migrationMonitor } = await import('./migration-monitor.js');
        migrationMonitor.startMonitoring();
    }
    catch (error) {
        console.warn('⚠️ Monitors failed to start:', error.message);
    }
})();
export { app };
//# sourceMappingURL=index-launch.js.map