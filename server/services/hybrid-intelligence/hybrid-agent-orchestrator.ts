/**
 * HYBRID AGENT ORCHESTRATOR
 * Main orchestrator that integrates local streaming with selective cloud intelligence
 * Provides unified interface for all agent interactions with optimal token usage
 */

import { LocalStreamingEngine, type LocalStreamingRequest } from './local-streaming-engine';
import { SmartDecisionRouter } from './smart-decision-router';
import { ClaudeAPISelectiveService } from './claude-api-selective';
import { PatternLibraryService } from './pattern-library-service';
import { AdvancedMemorySystem } from '../advanced-memory-system';

export interface HybridProcessingResult {
  success: boolean;
  content: string;
  processingType: 'local' | 'hybrid' | 'selective_cloud';
  tokensUsed: number;
  tokensSaved: number;
  processingTime: number;
  agentId: string;
}

export interface StreamingConfig {
  enableLocalFirst: boolean;
  maxTokensPerRequest: number;
  enablePatternCaching: boolean;
  enableMemoryIntegration: boolean;
}

export class HybridAgentOrchestrator {
  private static instance: HybridAgentOrchestrator;
  private localEngine = LocalStreamingEngine.getInstance();
  private decisionRouter = SmartDecisionRouter.getInstance();
  private selectiveCloud = ClaudeAPISelectiveService.getInstance();
  private patternLibrary = PatternLibraryService.getInstance();
  private memorySystem = AdvancedMemorySystem.getInstance();

  private config: StreamingConfig = {
    enableLocalFirst: true,
    maxTokensPerRequest: 2048,
    enablePatternCaching: true,
    enableMemoryIntegration: true
  };

  private constructor() {}

  public static getInstance(): HybridAgentOrchestrator {
    if (!HybridAgentOrchestrator.instance) {
      HybridAgentOrchestrator.instance = new HybridAgentOrchestrator();
    }
    return HybridAgentOrchestrator.instance;
  }

  /**
   * MAIN HYBRID PROCESSING
   * Orchestrates optimal processing path for agent requests
   */
  async processHybridRequest(request: LocalStreamingRequest): Promise<HybridProcessingResult> {
    const startTime = Date.now();
    console.log(`🎯 HYBRID ORCHESTRATOR: Processing ${request.agentId} request with optimal routing`);

    try {
      // Step 1: Check for cached patterns first (fastest)
      if (this.config.enablePatternCaching) {
        const patternResult = await this.tryPatternMatching(request);
        if (patternResult.success) {
          return this.createResult(patternResult, 'local', 0, 5000, startTime, request.agentId);
        }
      }

      // Step 2: Use smart decision routing
      const routingDecision = await this.decisionRouter.routeRequest(request);

      if (routingDecision.useLocal) {
        // Process locally with zero tokens
        const localResult = await this.localEngine.processLocalStreaming(request);
        
        if (localResult.success) {
          // Save successful pattern for future use
          if (this.config.enablePatternCaching) {
            await this.savePatternFromLocal(request, localResult);
          }

          return this.createResult(
            localResult, 
            'local', 
            0, 
            routingDecision.estimatedTokenSaving,
            startTime,
            request.agentId
          );
        }
      }

      // Step 3: Use selective cloud processing
      console.log(`☁️ ESCALATING TO CLOUD: ${routingDecision.reason}`);
      const cloudRequest = await this.prepareOptimizedCloudRequest(request);
      const cloudResult = await this.selectiveCloud.processSelectiveRequest(cloudRequest);

      if (cloudResult.success) {
        // Record learning for memory system
        if (this.config.enableMemoryIntegration) {
          await this.recordCloudLearning(request, cloudResult);
        }

        return this.createResult(
          cloudResult,
          'selective_cloud',
          cloudResult.tokensUsed,
          0,
          startTime,
          request.agentId
        );
      }

      // Fallback - should rarely happen
      return this.createFailureResult(request.agentId, startTime);

    } catch (error) {
      console.error('Hybrid processing error:', error);
      return this.createFailureResult(request.agentId, startTime);
    }
  }

  /**
   * HYBRID STREAMING PROCESSOR
   * Provides streaming interface with hybrid intelligence
   */
  async processHybridStreaming(
    request: LocalStreamingRequest,
    res: any
  ): Promise<void> {
    console.log(`🌊 HYBRID STREAMING: ${request.agentId} with intelligent routing`);

    try {
      // Send initial agent start
      res.write(`data: ${JSON.stringify({
        type: 'agent_start',
        agentName: request.agentId.charAt(0).toUpperCase() + request.agentId.slice(1),
        message: `${request.agentId.charAt(0).toUpperCase() + request.agentId.slice(1)} is analyzing the optimal processing approach...`
      })}\n\n`);

      // Step 1: Try pattern matching for instant response
      if (this.config.enablePatternCaching) {
        const patternMatches = await this.patternLibrary.findMatchingPatterns(
          request.agentId, 
          request.message, 
          request.userId
        );

        if (patternMatches.length > 0 && patternMatches[0].matchConfidence > 0.8) {
          console.log(`⚡ INSTANT PATTERN: Using cached pattern with ${patternMatches[0].matchConfidence.toFixed(2)} confidence`);
          
          const response = await this.patternLibrary.generatePatternResponse(
            patternMatches[0],
            request.agentId,
            request.message,
            request.context
          );

          // Stream the cached response
          res.write(`data: ${JSON.stringify({
            type: 'text_delta',
            content: response
          })}\n\n`);

          res.write(`data: ${JSON.stringify({
            type: 'completion',
            processingType: 'cached_pattern',
            tokensUsed: 0,
            tokensSaved: 4000
          })}\n\n`);

          res.write(`data: [DONE]\n\n`);
          return;
        }
      }

      // Step 2: Use decision routing for optimal processing
      const routingDecision = await this.decisionRouter.routeRequest(request);

      if (routingDecision.useLocal) {
        console.log(`🏠 LOCAL STREAMING: ${routingDecision.reason}`);
        await this.streamLocalResponse(request, res, routingDecision.estimatedTokenSaving);
      } else {
        console.log(`☁️ SELECTIVE CLOUD: ${routingDecision.reason}`);
        const cloudRequest = await this.prepareOptimizedCloudRequest(request);
        await this.selectiveCloud.streamSelectiveResponse(cloudRequest, res);
      }

    } catch (error) {
      console.error('Hybrid streaming error:', error);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: 'Processing encountered an issue. Please try again.'
      })}\n\n`);
      res.write(`data: [DONE]\n\n`);
    }
  }

  /**
   * TRY PATTERN MATCHING
   * Attempts to use cached patterns for instant response
   */
  private async tryPatternMatching(request: LocalStreamingRequest): Promise<any> {
    try {
      const patterns = await this.patternLibrary.findMatchingPatterns(
        request.agentId,
        request.message,
        request.userId
      );

      if (patterns.length > 0 && patterns[0].matchConfidence > 0.75) {
        const response = await this.patternLibrary.generatePatternResponse(
          patterns[0],
          request.agentId,
          request.message,
          request.context
        );

        return {
          success: true,
          content: response,
          confidence: patterns[0].matchConfidence
        };
      }

      return { success: false, content: '' };

    } catch (error) {
      console.error('Pattern matching error:', error);
      return { success: false, content: '' };
    }
  }

  /**
   * STREAM LOCAL RESPONSE
   * Streams locally generated response
   */
  private async streamLocalResponse(
    request: LocalStreamingRequest, 
    res: any, 
    tokensSaved: number
  ): Promise<void> {
    
    const localResult = await this.localEngine.processLocalStreaming(request);
    
    if (localResult.success) {
      // Simulate streaming for natural feel
      const chunks = this.chunkResponse(localResult.content);
      
      for (const chunk of chunks) {
        res.write(`data: ${JSON.stringify({
          type: 'text_delta',
          content: chunk
        })}\n\n`);
        
        // Small delay for natural streaming feel
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      res.write(`data: ${JSON.stringify({
        type: 'completion',
        processingType: 'local_streaming',
        tokensUsed: 0,
        tokensSaved
      })}\n\n`);

      // Save successful pattern
      if (this.config.enablePatternCaching) {
        await this.savePatternFromLocal(request, localResult);
      }
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: 'Local processing failed. Escalating to cloud...'
      })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
  }

  /**
   * PREPARE OPTIMIZED CLOUD REQUEST
   * Creates minimal cloud request for token optimization
   */
  private async prepareOptimizedCloudRequest(request: LocalStreamingRequest): Promise<any> {
    return {
      agentId: request.agentId,
      userId: request.userId,
      message: request.message,
      conversationId: request.conversationId,
      compressedContext: `Agent: ${request.agentId} | Task: creative/strategic`,
      essentialHistory: [
        {
          role: 'user',
          content: request.message
        }
      ]
    };
  }

  /**
   * SAVE PATTERN FROM LOCAL
   * Records successful local processing as pattern
   */
  private async savePatternFromLocal(request: LocalStreamingRequest, result: any): Promise<void> {
    try {
      await this.patternLibrary.saveSuccessfulPattern(
        request.agentId,
        request.userId,
        request.message,
        result.content,
        result.type,
        4000 // Estimated tokens saved
      );
    } catch (error) {
      console.error('Pattern save error:', error);
    }
  }

  /**
   * RECORD CLOUD LEARNING
   * Records cloud processing for memory system
   */
  private async recordCloudLearning(request: LocalStreamingRequest, result: any): Promise<void> {
    try {
      await this.memorySystem.recordLearningPattern(request.agentId, request.userId, {
        category: result.processingType,
        pattern: 'cloud_intelligence',
        confidence: 0.9,
        frequency: 1,
        effectiveness: 0.85,
        contexts: ['creative', 'strategic']
      });
    } catch (error) {
      console.error('Cloud learning record error:', error);
    }
  }

  /**
   * UTILITY METHODS
   */
  private createResult(
    result: any, 
    type: 'local' | 'hybrid' | 'selective_cloud',
    tokensUsed: number,
    tokensSaved: number,
    startTime: number,
    agentId: string
  ): HybridProcessingResult {
    return {
      success: result.success,
      content: result.content,
      processingType: type,
      tokensUsed,
      tokensSaved,
      processingTime: Date.now() - startTime,
      agentId
    };
  }

  private createFailureResult(agentId: string, startTime: number): HybridProcessingResult {
    return {
      success: false,
      content: 'Processing failed. Please try again.',
      processingType: 'local',
      tokensUsed: 0,
      tokensSaved: 0,
      processingTime: Date.now() - startTime,
      agentId
    };
  }

  private chunkResponse(content: string): string[] {
    const words = content.split(' ');
    const chunks: string[] = [];
    const chunkSize = 5; // Words per chunk

    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' ') + ' ');
    }

    return chunks;
  }

  /**
   * CONFIGURATION METHODS
   */
  updateConfig(newConfig: Partial<StreamingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log(`⚙️ HYBRID CONFIG UPDATED:`, this.config);
  }

  getStats(): any {
    return {
      localFirst: this.config.enableLocalFirst,
      patternCaching: this.config.enablePatternCaching,
      memoryIntegration: this.config.enableMemoryIntegration,
      maxTokens: this.config.maxTokensPerRequest
    };
  }
}