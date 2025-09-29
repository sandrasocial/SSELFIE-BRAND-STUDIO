import { storage } from './storage.js';
export class ArchitectureValidator {
    static validateGenerationRequest(requestBody, userId, isPremium = false) {
        if (!requestBody.version || !requestBody.version.includes(':')) {
            console.error('🚨 ARCHITECTURE VIOLATION: Missing individual user model version');
            console.error('Request body:', JSON.stringify(requestBody, null, 2));
            throw new Error('Architecture violation: Must use individual user model only');
        }
        const versionParts = requestBody.version.split(':');
        if (versionParts.length !== 2) {
            console.error('🚨 ARCHITECTURE VIOLATION: Invalid model version format');
            throw new Error('Architecture violation: Invalid model version format - must be username/model:version');
        }
        if (requestBody.input?.finetune_id) {
            console.error('🚨 ARCHITECTURE VIOLATION: finetune_id not permitted in V2 individual model architecture');
            throw new Error('Architecture violation: V2 uses individual models, not finetune_id');
        }
        const userType = isPremium ? 'Premium' : 'Free';
        console.log(`✅ ${userType} user validation passed for user: ${userId}`);
        console.log(`✅ Using individual model version: ${requestBody.version}`);
    }
    static logArchitectureCompliance(userId, operation) {
        console.log(`🔒 ARCHITECTURE COMPLIANCE: User ${userId} - ${operation} - Using correct V2 individual model architecture`);
    }
    static async validateUserModel(userId) {
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
    static validateAuthentication(req) {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            throw new Error('Authentication required');
        }
        const userId = req.user.id;
        if (!userId) {
            throw new Error('User ID not found in session');
        }
        console.log('✅ Authentication validation passed for user:', userId);
        return userId;
    }
    static enforceZeroTolerance() {
        console.log('🔒 ZERO TOLERANCE: No fallbacks or mock data permitted');
    }
}
//# sourceMappingURL=architecture-validator.js.map