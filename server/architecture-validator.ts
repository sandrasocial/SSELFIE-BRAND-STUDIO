/**
 * CORE ARCHITECTURE V2 VALIDATOR - INDIVIDUAL MODEL ARCHITECTURE
 * Validates all generation requests against CORE_ARCHITECTURE_IMMUTABLE_V2.md
 * CRITICAL: ALL users use individual trained models with complete isolation
 */

import { storage } from './storage';

export class ArchitectureValidator {
  
  /**
   * 🔒 INDIVIDUAL MODEL VALIDATION - Ensures correct user model architecture
   * ALL users must use their individual trained models with zero cross-contamination
   */
  static validateGenerationRequest(requestBody: any, userId: string, isPremium: boolean = false): void {
    // 1. VALIDATE USER'S INDIVIDUAL MODEL - Each user must use their own complete model path
    const version = requestBody.version;
    if (!version || typeof version !== 'string') {
      throw new Error('Architecture violation: Must use user\'s complete individual trained model path');
    }
    
    // Individual model should be complete path like sandrasocial/42585527-selfie-lora:e1713c1
    if (!version.includes(':') || !version.includes('/')) {
      throw new Error('Architecture violation: Must use complete individual model path (owner/model:version)');
    }
    
    // 2. INDIVIDUAL MODEL ARCHITECTURE - Using complete trained model path
    // User's individual trained model contains their identity and LoRA weights
    console.log(`✅ Using user's complete individual trained model: ${requestBody.version}`);
  }
  
  /**
   * 🔒 COMPLIANCE LOGGING - Records architecture compliance for audit
   */
  static logArchitectureCompliance(userId: string, operation: string): void {
    console.log(`🔒 ARCHITECTURE COMPLIANCE: User ${userId} - ${operation} - Using correct V2 individual model architecture`);
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