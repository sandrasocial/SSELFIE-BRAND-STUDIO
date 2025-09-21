/* eslint-disable no-console */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, setSkewProtectionCookie } from './middleware/auth';

// Route handlers
import { 
  handleExportTrainedUsersDoc, 
  handleBackfillStackUsers, 
  handleLinkLegacyUser, 
  handleExportUserMetadata, 
  handlePushStackMetadata 
} from './routes/admin';

import { 
  handleLogout, 
  handleAutoRegister, 
  handleMeEndpoint, 
  handleUpdateGender 
} from './routes/auth';

import { 
  handleGallery, 
  handleGalleryImages, 
  handleImagesFavorites 
} from './routes/gallery';

import { 
  handleTrainingStatus, 
  handleLegacyTrainingStatus 
} from './routes/training';

import { 
  handleTrainingCompletionMonitor, 
  handleGenerationCompletionMonitor 
} from './routes/cron';

import { handleTestDb } from './routes/database';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 40
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🔍 API Handler: Request received', req.url);
    console.log('🔍 Method:', req.method);
    
    // Vercel Skew Protection
    setSkewProtectionCookie(res);
    
    // Set CORS headers
    setCorsHeaders(res);
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Simple health check
    if (req.url?.includes('/api/health')) {
      return res.status(200).json({
        status: 'healthy',
        service: 'SSELFIE Studio API',
        timestamp: new Date().toISOString(),
      });
    }

    // Route handlers
    const url = req.url || '';

    // Admin routes
    if (url === '/api/admin/export-trained-users-doc') {
      return handleExportTrainedUsersDoc(req, res);
    }
    if (url === '/api/admin/backfill-stack-users') {
      return handleBackfillStackUsers(req, res);
    }
    if (url === '/api/admin/link-legacy-user') {
      return handleLinkLegacyUser(req, res);
    }
    if (url === '/api/admin/export-user-metadata') {
      return handleExportUserMetadata(req, res);
    }
    if (url === '/api/admin/push-stack-metadata') {
      return handlePushStackMetadata(req, res);
    }

    // Auth routes
    if (url === '/api/logout') {
      return handleLogout(req, res);
    }
    if (url === '/api/auth/auto-register') {
      return handleAutoRegister(req, res);
    }
    if (url === '/api/me' || url?.startsWith('/api/me?')) {
      return handleMeEndpoint(req, res);
    }
    if (url === '/api/user/update-gender') {
      return handleUpdateGender(req, res);
    }

    // Gallery routes
    if (url === '/api/gallery') {
      return handleGallery(req, res);
    }
    if (url === '/api/gallery-images') {
      return handleGalleryImages(req, res);
    }
    if (url === '/api/images/favorites') {
      return handleImagesFavorites(req, res);
    }

    // Training routes
    if (url === '/api/training/status' || url?.startsWith('/api/training/status?')) {
      return handleTrainingStatus(req, res);
    }
    if (url === '/api/training-status' || url?.startsWith('/api/training-status?')) {
      return handleLegacyTrainingStatus(req, res);
    }

    // Cron routes
    if (url === '/api/cron/training-completion-monitor') {
      return handleTrainingCompletionMonitor(req, res);
    }
    if (url === '/api/cron/generation-completion-monitor') {
      return handleGenerationCompletionMonitor(req, res);
    }

    // Database test route
    if (url === '/api/test-db') {
      return handleTestDb(req, res);
    }

    // Fallback for unmatched routes
    return res.status(404).json({ 
      error: 'Route not found',
      url: req.url,
      availableRoutes: [
        '/api/health',
        '/api/me',
        '/api/logout',
        '/api/auth/auto-register',
        '/api/gallery',
        '/api/gallery-images',
        '/api/images/favorites',
        '/api/training/status',
        '/api/training-status',
        '/api/user/update-gender',
        '/api/test-db',
        '/api/admin/*',
        '/api/cron/*'
      ]
    });

  } catch (error) {
    console.error('❌ API Handler Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
}