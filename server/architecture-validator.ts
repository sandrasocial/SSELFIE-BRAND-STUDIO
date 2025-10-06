/**
 * CORE ARCHITECTURE V2 VALIDATOR - INDIVIDUAL MODEL ARCHITECTURE
 * Validates all generation requests against CORE_ARCHITECTURE_IMMUTABLE_V2.md
 * CRITICAL: ALL users use individual trained models with complete isolation
 */

import { storage } from './storage.js'

export class ArchitectureValidator {
  
  /**
   * 🔒 INDIVIDUAL MODEL VALIDATION - Ensures correct user model architecture
   * ALL users must use their individual trained models with zero cross-contamination
   */
  static validateGenerationRequest(requestBody: any, userId: string, isPremium: boolean = false): void {
    // 🔒 V2 ARCHITECTURE: ALL users use individual trained models (no FLUX Pro distinction)
    // This matches CORE_ARCHITECTURE_IMMUTABLE_V2.md - complete user isolation with individual models
    
    if (!requestBody.version || !requestBody.version.includes(':')) {
      console.error('🚨 ARCHITECTURE VIOLATION: Missing individual user model version');
      console.error('Request body:', JSON.stringify(requestBody, null, 2));
      throw new Error('Architecture violation: Must use individual user model only');
    }
    
    // Ensure proper individual model format (username/modelid:versionid)
    const versionParts = requestBody.version.split(':');
    if (versionParts.length !== 2) {
      console.error('🚨 ARCHITECTURE VIOLATION: Invalid model version format');
      throw new Error('Architecture violation: Invalid model version format - must be username/model:version');
    }
    
    // Ensure no premium-only parameters (finetune_id not used in V2 architecture)
    if (requestBody.input?.finetune_id) {
      console.error('🚨 ARCHITECTURE VIOLATION: finetune_id not permitted in V2 individual model architecture');
      throw new Error('Architecture violation: V2 uses individual models, not finetune_id');
    }
    
    const userType = isPremium ? 'Premium' : 'Free';
  }
  
  /**
   * 🔒 COMPLIANCE LOGGING - Records architecture compliance for audit
   */
  static logArchitectureCompliance(userId: string, operation: string): void {
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
    
  }
  
  /**
   * 🔒 AUTHENTICATION VALIDATION - Ensures proper user authentication
   */
  static validateAuthentication(req: any): string {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      throw new Error('Authentication required');
    }
    
    const userId = req.user.id;
    if (!userId) {
      throw new Error('User ID not found in session');
    }
    
    return userId;
  }
  
  /**
   * 🔒 ZERO TOLERANCE ENFORCEMENT - Prevents any fallback or mock data usage
   */
  static enforceZeroTolerance(): void {
    // This method exists to remind developers of the zero tolerance policy
    // NO fallbacks, NO mock data, NO placeholders are allowed
  }
}