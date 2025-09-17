import './env-setup.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { securityHeaders, inputValidation } from './middleware/security';
import { rateLimits } from './middleware/rate-limiter';
import utilityRoutes from './routes/modules/utility';
import authRoutes from './routes/modules/auth';
import trainingRoutes from './routes/modules/training';
import galleryRoutes from './routes/modules/gallery';
import usageRoutes from './routes/modules/usage';
import mayaRoutes from './routes/modules/maya';
import aiGenerationRoutes from './routes/modules/ai-generation';
import { storage } from './storage';
import { BulletproofUploadService } from './bulletproof-upload-service';
import { requireStackAuth } from './routes/middleware/auth';

const app = express();

app.set('trust proxy', true);
app.use(securityHeaders);
app.use(inputValidation);
app.use(rateLimits.general);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'SSELFIE Studio', ts: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', ts: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

// Core routes required for the Sacred Path
app.use('/', utilityRoutes);
app.use('/', authRoutes);
app.use('/', trainingRoutes);
app.use('/', galleryRoutes);
app.use('/', usageRoutes);
app.use('/', mayaRoutes);
app.use('/', aiGenerationRoutes);

// Training pipeline endpoints (real implementations)
app.post('/api/training/upload-selfies', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { images } = req.body as { images: string[] };
    if (!userId || !Array.isArray(images)) {
      return res.status(400).json({ success: false, message: 'userId and images[] required' });
    }
    const result = await BulletproofUploadService.completeBulletproofUpload(userId, images);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(202).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Upload pipeline failed', error: (error as Error).message });
  }
});

// Simple-training client aliases
app.post('/api/start-model-training', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { selfieImages } = req.body as { selfieImages: string[] };
    if (!Array.isArray(selfieImages)) {
      return res.status(400).json({ success: false, errors: ['Missing selfieImages[]'], requiresRestart: true });
    }
    const result = await BulletproofUploadService.completeBulletproofUpload(userId, selfieImages);
    return res.status(result.success ? 202 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Training start failed', requiresRestart: true });
  }
});

app.get('/api/user-model', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const model = await storage.getUserModelByUserId(userId);
    const needsTraining = !model || model.trainingStatus === 'not_started';
    const canRetrain = (model as any)?.hasRetrainingAccess === true || false;
    return res.json({ ...(model || {}), needsTraining, canRetrain });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load user model' });
  }
});

app.get('/api/training-status', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const status = await storage.checkTrainingStatus(userId);
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ needsRestart: false, reason: 'Status check failed' });
  }
});

app.post('/api/restart-training', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    await storage.deleteFailedTrainingData(userId);
    await storage.ensureUserModel(userId);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Restart failed' });
  }
});

app.get('/api/training-progress/:userId', requireStackAuth, async (req: any, res) => {
  try {
    const { userId } = req.params;
    // Auth: only allow self or admin in future; for now, allow self
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const model = await storage.getUserModelByUserId(userId);
    return res.json({ progress: model?.trainingProgress ?? 0, status: model?.trainingStatus || 'not_started' });
  } catch (error) {
    return res.status(500).json({ progress: 0 });
  }
});

app.post('/api/user/update-gender', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { gender } = req.body as { gender?: string };
    if (!gender) return res.status(400).json({ success: false, message: 'gender required' });
    await storage.updateUserProfile(userId, { gender } as any);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update gender' });
  }
});

// Training status (live from DB)
app.get('/api/training/status', requireStackAuth, async (req: any, res) => {
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
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get training status' });
  }
});

// Expose a simple endpoint to poll a specific prediction/training id if needed
app.get('/api/training/check/:trainingId', requireStackAuth, async (req, res) => {
  try {
    const { trainingId } = req.params as { trainingId: string };
    const { TrainingCompletionMonitor } = await import('./training-completion-monitor');
    const monitor = TrainingCompletionMonitor.getInstance();
    // Check if training is complete by looking at the database
    const status = await monitor.getTrainingStatus(trainingId);
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to check training id' });
  }
});

// Static (dev)
if (process.env.NODE_ENV !== 'production') {
  const distPath = path.join(process.cwd(), 'client', 'dist');
  app.use(express.static(distPath));
  app.use('/assets', express.static(path.join(distPath, 'assets')));
}

// Background monitors (training + generation + migration)
(async () => {
  try {
    const { TrainingCompletionMonitor } = await import('./training-completion-monitor');
    TrainingCompletionMonitor.getInstance().startMonitoring();
    const { GenerationCompletionMonitor } = await import('./generation-completion-monitor');
    GenerationCompletionMonitor.getInstance().startMonitoring();
    const { migrationMonitor } = await import('./migration-monitor');
    migrationMonitor.startMonitoring();
    // Agent context monitor optional: can be enabled later if desired
  } catch (error) {
    console.warn('⚠️ Monitors failed to start:', (error as Error).message);
  }
})();

// Export for server runner
export { app };

