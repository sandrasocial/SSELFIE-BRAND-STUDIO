/**
 * Replicate Webhook Handler (Future Enhancement)
 * Vercel function for handling Replicate webhook notifications
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

export const config = { 
  runtime: 'nodejs',
  maxDuration: 30
} as const;

interface ReplicateWebhookPayload {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: unknown;
  error?: string;
  progress?: number;
  logs?: string;
  model?: string;
  version?: string;
  input?: Record<string, unknown>;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
}

// Verify Replicate webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  try {
    // Construct the signed payload string as per Replicate's specification
    const signedPayload = `${timestamp}.${payload}`;
    
    // Create HMAC signature
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');
    
    // Compare signatures (constant time comparison)
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ WEBHOOK SIGNATURE VERIFICATION ERROR:', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Replicate-Webhook-Id, X-Replicate-Webhook-Timestamp, X-Replicate-Webhook-Signature');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    // Validate webhook signature if secret is configured
    const webhookSecret = process.env['REPLICATE_WEBHOOK_SECRET'];
    if (webhookSecret) {
      const signature = req.headers['x-replicate-webhook-signature'] as string;
      const timestamp = req.headers['x-replicate-webhook-timestamp'] as string;
      const rawBody = JSON.stringify(req.body);

      if (!signature || !timestamp) {
        console.error('❌ REPLICATE WEBHOOK: Missing signature or timestamp headers');
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing required webhook headers'
        });
      }

      // Remove 'sha256=' prefix if present
      const cleanSignature = signature.replace('sha256=', '');

      if (!verifyWebhookSignature(rawBody, cleanSignature, timestamp, webhookSecret)) {
        console.error('❌ REPLICATE WEBHOOK: Invalid signature');
        return res.status(401).json({
          error: 'Unauthorized', 
          message: 'Invalid webhook signature'
        });
      }

      console.log('✅ REPLICATE WEBHOOK: Signature verified successfully');
    } else {
      console.warn('⚠️ REPLICATE WEBHOOK: No webhook secret configured, skipping signature validation');
    }
    const payload: ReplicateWebhookPayload = req.body;
    const endpoint = req.url;

    console.log(`🔔 REPLICATE WEBHOOK PLACEHOLDER: ${endpoint} - ${payload.id} status: ${payload.status}`);

    // Determine webhook type from URL path
    if (endpoint?.includes('/predictions')) {
      console.log(`🔔 REPLICATE WEBHOOK: Processing prediction ${payload.id} with status ${payload.status}`);
      
      // 🎯 IMPROVEMENT: Actually process the webhook instead of just acknowledging
      if (payload.status === 'succeeded' || payload.status === 'failed') {
        try {
          // Import and trigger the completion monitor for this prediction
          const { GenerationCompletionMonitor } = await import('../generation-completion-monitor.js');
          
          // Find the tracker for this prediction ID and trigger completion check
          const { storage } = await import('../storage.js');
          
          // 🎯 OPTIMIZED: Search for tracker by Replicate prediction ID more efficiently
          console.log(`🔍 REPLICATE WEBHOOK: Searching for tracker with prediction ID: ${payload.id}`);
          
          let foundTracker = null;
          
          try {
            // Get all users to search their trackers
            const allUsers = await storage.getAllUsers();
            console.log(`🔍 REPLICATE WEBHOOK: Searching across ${allUsers.length} users`);
            
            for (const user of allUsers.slice(0, 50)) { // Limit search to prevent timeout
              try {
                const trackers = await storage.getUserGenerationTrackers(user.id);
                
                // Look for tracker that matches this prediction ID
                const tracker = trackers.find(t => {
                  // Check if prompt contains the Replicate ID
                  const hasReplicateId = t.prompt?.includes(`||REPLICATE_ID:${payload.id}`);
                  // Also check direct predictionId match (fallback)
                  const directMatch = t.predictionId === payload.id;
                  
                  return hasReplicateId || directMatch;
                });
                
                if (tracker) {
                  foundTracker = tracker;
                  console.log(`✅ REPLICATE WEBHOOK: Found tracker ${tracker.id} for user ${user.id}, prediction ${payload.id}`);
                  
                  // Trigger immediate completion check
                  await GenerationCompletionMonitor.checkAndUpdateGeneration(payload.id, tracker.id);
                  break;
                }
              } catch (userError) {
                console.warn(`⚠️ REPLICATE WEBHOOK: Error checking user ${user.id}:`, userError);
                continue;
              }
            }
          } catch (searchError) {
            console.error('❌ REPLICATE WEBHOOK: Error searching for tracker:', searchError);
          }
          
          if (!foundTracker) {
            console.warn(`⚠️ REPLICATE WEBHOOK: No tracker found for prediction ${payload.id}`);
          }
          
        } catch (processingError) {
          console.error(`❌ REPLICATE WEBHOOK: Processing failed for ${payload.id}:`, processingError);
        }
      }
      
      return res.status(200).json({ 
        received: true, 
        predictionId: payload.id,
        status: payload.status,
        message: 'Prediction webhook processed successfully'
      });
    } 
    
    if (endpoint?.includes('/trainings')) {
      return res.status(200).json({ 
        received: true, 
        trainingId: payload.id,
        status: payload.status,
        message: 'Training webhook endpoint ready for future implementation'
      });
    }

    // Generic webhook handler
    return res.status(200).json({ 
      received: true, 
      webhookId: payload.id,
      status: payload.status,
      message: 'Replicate webhook endpoint ready for future implementation'
    });

  } catch (error) {
    console.error('❌ REPLICATE WEBHOOK ERROR:', error);
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}