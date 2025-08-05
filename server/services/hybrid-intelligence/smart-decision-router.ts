/**
 * SMART DECISION ROUTER
 * Intelligently routes requests between local processing and selective cloud inference
 * Optimizes for zero-token local processing while preserving cloud intelligence for creative tasks
 */

import { LocalStreamingEngine, type LocalStreamingRequest } from './local-streaming-engine';

export interface RoutingDecision {
  useLocal: boolean;
  reason: string;
  confidence: number;
  estimatedTokenSaving: number;
}

export interface CloudRequest {
  agentId: string;
  userId: string;
  message: string;
  conversationId: string;
  compressedContext: string;
  essentialHistory: any[];
}

export class SmartDecisionRouter {
  private static instance: SmartDecisionRouter;
  private localEngine = LocalStreamingEngine.getInstance();

  private constructor() {}

  public static getInstance(): SmartDecisionRouter {
    if (!SmartDecisionRouter.instance) {
      SmartDecisionRouter.instance = new SmartDecisionRouter();
    }
    return SmartDecisionRouter.instance;
  }

  /**
   * MAIN ROUTING INTELLIGENCE
   * Decides whether to process locally or use cloud inference
   */
  async routeRequest(request: LocalStreamingRequest): Promise<RoutingDecision> {
    console.log(`🧠 SMART ROUTER: Analyzing routing options for ${request.agentId}`);

    const localScore = await this.calculateLocalCapability(request);
    const cloudNeed = await this.calculateCloudNecessity(request);

    const useLocal = localScore > cloudNeed;
    const confidence = Math.abs(localScore - cloudNeed);
    const estimatedTokenSaving = useLocal ? this.estimateTokenSaving(request) : 0;

    const decision: RoutingDecision = {
      useLocal,
      reason: this.generateRoutingReason(localScore, cloudNeed, useLocal),
      confidence,
      estimatedTokenSaving
    };

    console.log(`🎯 ROUTING DECISION: ${useLocal ? 'LOCAL' : 'CLOUD'} (${confidence.toFixed(2)} confidence, ${estimatedTokenSaving} tokens saved)`);

    return decision;
  }

  /**
   * CALCULATE LOCAL PROCESSING CAPABILITY
   * Determines how well this request can be handled locally
   */
  private async calculateLocalCapability(request: LocalStreamingRequest): Promise<number> {
    let score = 0;

    // Technical/tool operation patterns (high local capability)
    const technicalPatterns = [
      /(?:search|find|locate).*(?:file|code|function)/i,
      /(?:view|read|show|display).*(?:file|code)/i,
      /(?:check|verify|test).*(?:status|system)/i,
      /(?:run|execute).*(?:command|script)/i,
      /(?:create|add|edit|update|delete).*(?:file|component|function)/i,
      /(?:fix|resolve|debug).*(?:error|issue|bug)/i,
      /(?:install|uninstall|configure).*(?:package|dependency)/i
    ];

    if (technicalPatterns.some(pattern => pattern.test(request.message))) {
      score += 0.8;
    }

    // Known workflow patterns (medium-high local capability)
    const workflowPatterns = [
      /add.*(?:button|component|element|feature)/i,
      /update.*(?:styling|design|layout)/i,
      /implement.*(?:function|method|api)/i,
      /refactor.*(?:code|structure)/i,
      /optimize.*(?:performance|code)/i
    ];

    if (workflowPatterns.some(pattern => pattern.test(request.message))) {
      score += 0.6;
    }

    // Simple informational requests (medium local capability)
    const informationalPatterns = [
      /(?:how|what|where|when).*(?:does|is|can|should)/i,
      /explain.*(?:code|function|concept)/i,
      /describe.*(?:implementation|structure)/i
    ];

    if (informationalPatterns.some(pattern => pattern.test(request.message))) {
      score += 0.4;
    }

    // DYNAMIC CODE GENERATION ROUTING - Enhanced for Quality
    const simpleCodePatterns = [
      /add.*(?:button|input|div|simple)/i,
      /quick.*(?:fix|change|update)/i,
      /small.*(?:component|function)/i
    ];
    
    const complexCodePatterns = [
      /(?:complete|full|comprehensive).*(?:component|system|application)/i,
      /(?:typescript|react|hooks|types|interfaces)/i,
      /(?:error handling|state management|authentication)/i,
      /(?:crud|database|api integration)/i,
      /(?:advanced|complex|enterprise|production)/i,
      /(?:dashboard|user profile|management system)/i,
      /write.*(?:complete|full|comprehensive)/i,
      /create.*(?:system|application|platform)/i
    ];

    // Simple code tasks can be local (basic patterns)
    if (simpleCodePatterns.some(pattern => pattern.test(request.message))) {
      score += 0.3; // Reduced for simple tasks
    }
    
    // Complex code MUST use Claude for quality
    if (complexCodePatterns.some(pattern => pattern.test(request.message))) {
      score += 0.1; // Very low local score to force cloud routing
    }

    // Length and complexity adjustments
    const wordCount = request.message.split(/\s+/).length;
    if (wordCount < 10) score += 0.2; // Simple requests
    if (wordCount > 50) score -= 0.3; // Complex requests might need cloud

    return Math.min(1.0, score);
  }

  /**
   * CALCULATE CLOUD NECESSITY
   * Determines how much this request needs cloud-based intelligence
   */
  private async calculateCloudNecessity(request: LocalStreamingRequest): Promise<number> {
    let score = 0;

    // Creative and strategic patterns (high cloud necessity)
    const creativePatterns = [
      /(?:design|create|brainstorm).*(?:strategy|approach|concept)/i,
      /(?:analyze|evaluate|assess).*(?:business|market|user)/i,
      /(?:recommend|suggest|advise).*(?:architecture|solution|methodology)/i,
      /(?:optimize|improve|enhance).*(?:strategy|workflow|process)/i,
      /(?:plan|architect|structure).*(?:system|project|application)/i
    ];

    if (creativePatterns.some(pattern => pattern.test(request.message))) {
      score += 0.9;
    }

    // ENHANCED CODE QUALITY ROUTING - Force Claude for Complex Code
    const highQualityCodePatterns = [
      /(?:complete|full|comprehensive).*(?:component|system|class|function)/i,
      /(?:typescript|react|hooks|types|interfaces|generics)/i,
      /(?:error handling|validation|authentication|authorization)/i,
      /(?:state management|context|redux|zustand)/i,
      /(?:crud|database|api|backend|frontend)/i,
      /(?:advanced|complex|enterprise|production|scalable)/i,
      /(?:dashboard|management|profile|admin|user)/i,
      /write.*(?:complete|comprehensive|production|professional)/i,
      /create.*(?:full|complete|robust|scalable)/i,
      /implement.*(?:complex|advanced|enterprise)/i,
      /build.*(?:complete|full|production|professional)/i
    ];

    // Force Claude API for high-quality code generation
    if (highQualityCodePatterns.some(pattern => pattern.test(request.message))) {
      score += 0.95; // Very high cloud necessity for quality code
    }

    // Novel or complex reasoning (high cloud necessity)
    const reasoningPatterns = [
      /(?:why|how come|what if|suppose)/i,
      /(?:compare|contrast|differentiate)/i,
      /(?:pros and cons|advantages|disadvantages)/i,
      /(?:best practice|recommendation|expert)/i,
      /(?:complex|sophisticated|advanced|enterprise)/i
    ];

    if (reasoningPatterns.some(pattern => pattern.test(request.message))) {
      score += 0.7;
    }

    // Brand and luxury related (medium-high cloud necessity)
    const brandPatterns = [
      /(?:brand|luxury|premium|sophisticated)/i,
      /(?:elegant|stylish|professional|executive)/i,
      /(?:marketing|customer|user experience)/i,
      /(?:content|copy|messaging)/i
    ];

    if (brandPatterns.some(pattern => pattern.test(request.message))) {
      score += 0.6;
    }

    // Abstract or conceptual requests (medium cloud necessity)
    const conceptualPatterns = [
      /(?:philosophy|principle|methodology)/i,
      /(?:theory|concept|idea|approach)/i,
      /(?:vision|goal|objective|mission)/i
    ];

    if (conceptualPatterns.some(pattern => pattern.test(request.message))) {
      score += 0.5;
    }

    // Context complexity adjustments
    const wordCount = request.message.split(/\s+/).length;
    if (wordCount > 30) score += 0.2; // Complex requests often need cloud
    if (request.message.includes('?')) score += 0.1; // Questions often need reasoning

    return Math.min(1.0, score);
  }

  /**
   * ESTIMATE TOKEN SAVINGS
   * Calculates approximate tokens saved by local processing
   */
  private estimateTokenSaving(request: LocalStreamingRequest): number {
    const basePromptTokens = 1000; // Agent personality + system prompt
    const historyTokens = 2000; // Conversation history (estimated)
    const memoryContextTokens = 500; // Memory and workspace context
    const responseTokens = 1500; // Generated response

    return basePromptTokens + historyTokens + memoryContextTokens + responseTokens;
  }

  /**
   * GENERATE ROUTING REASON
   * Provides explanation for routing decision
   */
  private generateRoutingReason(localScore: number, cloudNeed: number, useLocal: boolean): string {
    if (useLocal) {
      if (localScore > 0.8) {
        return "High confidence local processing - technical/tool operation detected";
      } else if (localScore > 0.6) {
        return "Good local capability - known workflow pattern identified";
      } else {
        return "Moderate local processing - saved tokens while maintaining quality";
      }
    } else {
      if (cloudNeed > 0.8) {
        return "High creativity/strategy requirement - cloud intelligence needed";
      } else if (cloudNeed > 0.6) {
        return "Complex reasoning required - selective cloud processing";
      } else {
        return "Novel concept detected - cloud intelligence for best results";
      }
    }
  }

  /**
   * PROCESS WITH OPTIMAL ROUTING
   * Main method to process request using optimal route
   */
  async processWithOptimalRouting(request: LocalStreamingRequest): Promise<any> {
    const decision = await this.routeRequest(request);

    if (decision.useLocal) {
      console.log(`🏠 PROCESSING LOCALLY: ${decision.reason}`);
      return await this.localEngine.processLocalStreaming(request);
    } else {
      console.log(`☁️ ROUTING TO CLOUD: ${decision.reason}`);
      return await this.prepareCloudRequest(request);
    }
  }

  /**
   * PREPARE CLOUD REQUEST
   * Optimizes request for minimal token usage
   */
  private async prepareCloudRequest(request: LocalStreamingRequest): Promise<CloudRequest> {
    // Compress context to essential information only
    const compressedContext = this.compressContext(request);
    
    // Extract only essential conversation history
    const essentialHistory = await this.extractEssentialHistory(request);

    return {
      agentId: request.agentId,
      userId: request.userId,
      message: request.message,
      conversationId: request.conversationId,
      compressedContext,
      essentialHistory
    };
  }

  /**
   * COMPRESS CONTEXT
   * Reduces context to essential information for token optimization
   */
  private compressContext(request: LocalStreamingRequest): string {
    // Extract key information without full context
    return `Agent: ${request.agentId} | Task: ${this.extractTaskType(request.message)}`;
  }

  /**
   * EXTRACT ESSENTIAL HISTORY
   * Summarizes conversation history to minimize tokens
   */
  private async extractEssentialHistory(request: LocalStreamingRequest): Promise<any[]> {
    // For now, return minimal history
    // In full implementation, this would summarize previous conversation
    return [
      {
        role: 'user',
        content: request.message
      }
    ];
  }

  private extractTaskType(message: string): string {
    if (/strategy|plan|design|architect/i.test(message)) return 'strategic';
    if (/create|generate|build|implement/i.test(message)) return 'creative';
    if (/analyze|evaluate|assess|review/i.test(message)) return 'analytical';
    if (/fix|debug|resolve|troubleshoot/i.test(message)) return 'problem_solving';
    if (/file|code|system|command/i.test(message)) return 'technical';
    return 'general';
  }
}