/**
 * Test and Development Routes Module
 * Routes for testing and development purposes only
 */

import { Router, Request, Response } from 'express';
import { storage } from '../../storage.js';
import { requireStackAuth } from '../../stack-auth.js';
import { asyncHandler, sendSuccess } from '../middleware/error-handler.js';

const router = Router();

// Test authentication endpoint
router.get('/api/test-auth', requireStackAuth, asyncHandler(async (req: Request, res: Response) => {
  const stackUser = req.user;
  
  if (!stackUser || !stackUser.id) {
    res.status(401).json({
      success: false,
      message: 'No user found in JWT token',
      details: { user: stackUser }
    });
    return;
  }

  // Try to find user in database
  const dbUser = await storage.getUser(stackUser.id);

  res.json({
    success: true,
    message: 'Stack Auth integration working correctly!',
    stackAuth: {
      userId: stackUser.id,
      email: (stackUser as any).email || 'N/A',
      displayName: stackUser.displayName
    },
    database: {
      userExists: !!dbUser,
      userdata: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
        plan: dbUser.plan,
        role: dbUser.role
      } : null
    },
    webhookStatus: 'Handler available at /api/webhooks/stack'
  });
}));

// Test model validation
router.post('/api/test-model-validation', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { ModelValidationService } = await import('../../model-validation-service.js');
  
  const validation = await ModelValidationService.validateAndCorrectUserModel(userId);
  
  sendSuccess(res, {
    validation,
    databaseModel: await storage.getUserModelByUserId(userId)
  });
}));

// Test admin generation
router.post('/api/test-admin-generation', asyncHandler(async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const { UnifiedGenerationService } = await import('../../unified-generation-service.js');
  
  const result = await UnifiedGenerationService.generateImages({
    userId: '42585527', // Admin user ID
    prompt: prompt || 'Young woman standing confidently in a mystical natural environment at golden hour, wearing sophisticated layered styling choices with unexpected textures, wind gently lifting hair, natural makeup with dewy skin, dreamy ethereal light creating mystical atmosphere, shot with editorial depth'
  });
  
  sendSuccess(res, {
    result,
    message: 'Admin model test with optimized parameters started'
  });
}));

// Test Shannon's generation
router.post('/api/test-shannon-generation', asyncHandler(async (req: Request, res: Response) => {
  const { prompt } = req.body;
  
  // Use Shannon's exact model details
  const modelVersion = 'sandrasocial/shannon-1753945376880-selfie-lora-1753983966781:2fed9e1abe9a80206d0a7b146914ee9f653b8aaf5b0dd7e82b8feb57ab5ec753';
  const triggerWord = 'usershannon-1753945376880';
  
  const testPrompt = prompt || 'Young woman standing confidently in a mystical natural environment at golden hour, wearing sophisticated layered styling choices with unexpected textures, wind gently lifting hair, natural makeup with dewy skin, dreamy ethereal light creating mystical atmosphere, shot with editorial depth';
  
  // Only add trigger word if not already present
  const finalPrompt = testPrompt.trim().startsWith(triggerWord) 
    ? testPrompt.trim()
    : `${triggerWord}, ${testPrompt.trim()}`;

  const requestBody = {
    version: modelVersion,
    input: {
      prompt: finalPrompt,
      num_outputs: 2,
      aspect_ratio: "4:5",
      output_format: "png",
      output_quality: 95,
      seed: Math.floor(Math.random() * 1000000)
    }
  };
  
  const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env['REPLICATE_API_TOKEN']}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
  });
  
  const predictionData = await replicateResponse.json();
  
  if (!replicateResponse.ok) {
    throw new Error(`Replicate API error: ${JSON.stringify(predictionData)}`);
  }
  
  sendSuccess(res, {
    predictionId: predictionData.id,
    status: predictionData.status,
    urls: predictionData.urls || [],
    message: `Shannon's model test started - Prediction ID: ${predictionData.id}`
  });
}));

// Development workspace redirect
router.get('/dev-workspace', (req: Request, res: Response) => {
  // Redirect to workspace with admin bypass parameter
  const workspaceUrl = '/workspace?dev_admin=sandra';
  res.redirect(workspaceUrl);
});

export default router;