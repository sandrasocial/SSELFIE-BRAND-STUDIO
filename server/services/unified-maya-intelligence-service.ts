/**
 * ⚠️  DEPRECATED SERVICE - CONSOLIDATED INTO MAYA-SERVICE.TS ⚠️
 * 
 * This service has been DEPRECATED as part of Phase 2: Service Unification.
 * All Maya intelligence and orchestration logic has been consolidated into server/services/maya-service.ts
 * 
 * REASON FOR DEPRECATION:
 * - Multiple Maya implementations caused routing conflicts and unpredictable behavior
 * - Different extraction logic led to concept card rendering issues
 * - Single unified service provides consistent, robust Maya operations
 * 
 * Key features from this service integrated into unified Maya service:
 * - Creative Look system (12 signature looks)
 * - Location-based concept selection
 * - Enhanced FLUX prompt generation
 * - Professional fashion expertise
 * 
 * All functionality now available through:
 * - server/services/maya-service.ts (unified Maya intelligence)
 * - server/index.ts (main API handler using unified service)
 * 
 * @deprecated DO NOT USE - Use server/services/maya-service.ts instead
 * @since Service Unification Phase 2
 */

// DEPRECATED: Export minimal interface to prevent import errors
export interface MayaIntelligenceRequest {
  userId: string;
  message: string;
  conversationId?: string;
  context?: any;
}

export interface MayaIntelligenceResponse {
  response: string;
  conversationId: string;
  conceptCards?: any[];
  nextActions?: string[];
  confidence: number;
}

export class UnifiedMayaIntelligenceService {
  constructor() {
    console.warn('⚠️ UnifiedMayaIntelligenceService is DEPRECATED. Use server/services/maya-service.ts instead.');
  }

  async processMessage(request: MayaIntelligenceRequest): Promise<MayaIntelligenceResponse> {
    throw new Error('⚠️ UnifiedMayaIntelligenceService DEPRECATED: Use server/services/maya-service.ts instead');
  }

  async generateBrandStrategy(userId: string, context: any): Promise<any> {
    throw new Error('⚠️ UnifiedMayaIntelligenceService DEPRECATED: Use server/services/maya-service.ts instead');
  }

  async getUnifiedStyleIntelligence(userId: string, context: any, mode: string): Promise<any> {
    throw new Error('⚠️ UnifiedMayaIntelligenceService DEPRECATED: Use server/services/maya-service.ts instead');
  }
}

export const unifiedMayaIntelligenceService = new UnifiedMayaIntelligenceService();
