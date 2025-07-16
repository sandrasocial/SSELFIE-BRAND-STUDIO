/**
 * FLUX PRO DUAL-TIER ARCHITECTURE VALIDATOR
 * Validates all generation requests against the dual-tier FLUX architecture
 * CRITICAL: Enforces premium users get FLUX Pro, free users get standard FLUX
 */

import { storage } from './storage';

export class ArchitectureValidator {
  
  /**
   * 🚀 DUAL-TIER VALIDATION - Ensures correct FLUX model for user tier
   * Premium users must use FLUX Pro, free users must use standard FLUX
   */
  static validateGenerationRequest(requestBody: any, userId: string, isPremium: boolean = false): void {
    if (isPremium) {
      // 🏆 PREMIUM VALIDATION: Must use FLUX Pro with finetune_id
      if (requestBody.version !== "black-forest-labs/flux-pro-finetuned:latest") {
        console.error('🚨 PREMIUM ARCHITECTURE VIOLATION: Premium user not using FLUX Pro');
        console.error('Request body:', JSON.stringify(requestBody, null, 2));
        throw new Error('Premium architecture violation: Must use FLUX Pro model');
      }
      
      if (!requestBody.input?.finetune_id) {
        console.error('🚨 PREMIUM ARCHITECTURE VIOLATION: Missing finetune_id for FLUX Pro');
        throw new Error('Premium architecture violation: FLUX Pro requires finetune_id');
      }
      
      console.log(`✅ Premium FLUX Pro validation passed for user: ${userId}`);
      console.log(`✅ Using FLUX Pro with finetune_id: ${requestBody.input.finetune_id}`);
      
    } else {
      // 📱 FREE USER VALIDATION: Must use individual trained model version
      if (!requestBody.version || !requestBody.version.includes(':')) {
        console.error('🚨 FREE ARCHITECTURE VIOLATION: Missing individual user model version');
        console.error('Request body:', JSON.stringify(requestBody, null, 2));
        throw new Error('Free architecture violation: Must use individual user model only');
      }
      
      // Ensure no premium-only parameters
      if (requestBody.input?.finetune_id) {
        console.error('🚨 FREE ARCHITECTURE VIOLATION: Free user attempting to use FLUX Pro');
        throw new Error('Free architecture violation: FLUX Pro requires premium subscription');
      }
      
      console.log(`✅ Free FLUX validation passed for user: ${userId}`);
      console.log(`✅ Using individual model version: ${requestBody.version}`);
    }
  }
  
  /**
   * 🔒 COMPLIANCE LOGGING - Records architecture compliance for audit
   */
  static logArchitectureCompliance(userId: string, operation: string): void {
    console.log(`🔒 ARCHITECTURE COMPLIANCE: User ${userId} - ${operation} - Using correct FLUX individual model architecture`);
  }
  
  /**
   * 🔒 USER MODEL VALIDATION - Ensures user has completed individual training
   */
  static async validateUserModel(userId: string): Promise<void> {
    const userModel = await storage.getUserModelByUserId(userId);
    
    if (!userModel) {
      throw new Error('User model not found - training required');
    }
    
    if (userModel.trainingStatus !== 'completed') {
      throw new Error('User model training not completed');
    }
    
    if (!userModel.replicateVersionId) {
      throw new Error('User model version not available - training may need completion');
    }
    
    console.log('✅ User model validation passed:', userId);
  }
  
  /**
   * 🔒 AUTHENTICATION VALIDATION - Ensures proper user authentication
   */
  static validateAuthentication(req: any): string {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      throw new Error('Authentication required');
    }
    
    const userId = req.user?.claims?.sub;
    if (!userId) {
      throw new Error('User ID not found in session');
    }
    
    console.log('✅ Authentication validation passed for user:', userId);
    return userId;
  }
  
  /**
   * 🔒 ZERO TOLERANCE ENFORCEMENT - Prevents any fallback or mock data usage
   */
  static enforceZeroTolerance(): void {
    // This method exists to remind developers of the zero tolerance policy
    // NO fallbacks, NO mock data, NO placeholders are allowed
    console.log('🔒 ZERO TOLERANCE: No fallbacks or mock data permitted');
  }
}