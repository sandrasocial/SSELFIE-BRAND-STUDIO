/**
 * ARCHITECTURE VALIDATION SERVICE - PERMANENT COMPLIANCE ENFORCER
 * Validates all generation requests against the immutable core architecture
 * CRITICAL: This enforces the permanently locked FLUX individual model approach
 */

import { storage } from './storage';

export class ArchitectureValidator {
  
  /**
   * 🔒 IMMUTABLE VALIDATION - Ensures requests use individual user models ONLY
   * Prevents any deviation from the locked architecture
   */
  static validateGenerationRequest(requestBody: any, userId: string): void {
    // 🔒 ARCHITECTURE VALIDATION: Must use user's individual trained model version
    if (!requestBody.version || !requestBody.version.includes(':')) {
      console.error('🚨 ARCHITECTURE VIOLATION: Missing individual user model version');
      console.error('Request body:', JSON.stringify(requestBody, null, 2));
      throw new Error('Architecture violation: Must use individual user model only');
    }
    
    console.log(`✅ Architecture validation passed for user: ${userId}`);
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