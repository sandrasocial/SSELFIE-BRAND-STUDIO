import type { Express } from "express";
import { storage } from "../storage";
import type { InsertUser } from "../../shared/schema";
import crypto from "crypto";

// Stack Auth webhook handler for user sync
export function setupStackWebhook(app: Express) {
  console.log('🔧 Setting up Stack Auth webhook...');

  // Stack Auth webhook endpoint for user sync
  app.post('/api/webhooks/stack', async (req, res) => {
    try {
      console.log('📥 Stack Auth webhook received:', req.body?.event_type);
      
      // Verify webhook signature (if Stack Auth provides one)
      // TODO: Add signature verification when Stack Auth documentation is available
      
      const event = req.body;
      const eventType = event.event_type;
      const userData = event.data;

      console.log('📊 Webhook event details:', {
        type: eventType,
        userId: userData?.id,
        email: userData?.primary_email
      });

      switch (eventType) {
        case 'user.created':
        case 'user.updated':
          await handleUserUpsert(userData);
          break;
        
        case 'user.deleted':
          await handleUserDeletion(userData);
          break;
        
        default:
          console.log(`⚠️ Unhandled Stack Auth event type: ${eventType}`);
      }

      // Acknowledge successful processing
      res.status(200).json({ success: true, processed: eventType });

    } catch (error) {
      console.error('❌ Stack Auth webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process webhook' 
      });
    }
  });

  console.log('✅ Stack Auth webhook handler setup complete at /api/webhooks/stack');
}

// Handle user creation and updates from Stack Auth
async function handleUserUpsert(stackUser: any) {
  try {
    console.log('🔄 Processing user upsert for:', stackUser.id);

    // Map Stack Auth user data to your user schema
    const userData: InsertUser = {
      id: stackUser.id, // Stack Auth user ID
      email: stackUser.primary_email || stackUser.email,
      firstName: stackUser.display_name?.split(' ')[0] || 
                 stackUser.given_name || 
                 stackUser.primary_email?.split('@')[0] || '',
      lastName: stackUser.display_name?.split(' ').slice(1).join(' ') || 
                stackUser.family_name || '',
      displayName: stackUser.display_name || stackUser.primary_email || '',
      profileImageUrl: stackUser.profile_image_url || stackUser.picture,
      lastLoginAt: new Date(), // Update login time on sync
      
      // Business logic defaults for new users
      plan: "sselfie-studio",
      role: stackUser.primary_email === 'sandra@sselfie.ai' ? 'admin' : 'user',
      monthlyGenerationLimit: stackUser.primary_email === 'sandra@sselfie.ai' ? -1 : 100,
      mayaAiAccess: true,
      victoriaAiAccess: false,
      profileCompleted: false,
      onboardingStep: 0,
    };

    // Upsert user to database
    const user = await storage.upsertUser(userData);
    
    console.log('✅ User synced successfully:', {
      id: user.id,
      email: user.email,
      plan: user.plan
    });

    return user;
  } catch (error) {
    console.error('❌ Failed to upsert user from Stack Auth:', error);
    throw error;
  }
}

// Handle user deletion from Stack Auth
async function handleUserDeletion(stackUser: any) {
  try {
    console.log('🗑️ Processing user deletion for:', stackUser.id);
    
    // Note: You may want to soft-delete or archive user data instead
    // For now, we'll log it but not actually delete to preserve user content
    console.log('⚠️ User deletion received - implement based on business requirements');
    
    // TODO: Implement user deletion logic based on business requirements
    // Consider: soft delete, data retention policies, cascade deletes
    
  } catch (error) {
    console.error('❌ Failed to process user deletion:', error);
    throw error;
  }
}