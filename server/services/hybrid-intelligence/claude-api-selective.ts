/**
 * CLAUDE API SELECTIVE SERVICE
 * Handles only creative, strategic, and novel requests that require cloud intelligence
 * Optimized for minimal token usage through context compression and selective processing
 */

import Anthropic from '@anthropic-ai/sdk';
import { CONSULTING_AGENT_PERSONALITIES } from '../../agent-personalities-consulting';
import type { CloudRequest } from './smart-decision-router';

const DEFAULT_MODEL_STR = "claude-3-5-sonnet-20241022";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface SelectiveCloudResponse {
  success: boolean;
  content: string;
  tokensUsed: number;
  processingType: 'creative' | 'strategic' | 'analytical' | 'novel';
}

export class ClaudeAPISelectiveService {
  private static instance: ClaudeAPISelectiveService;

  private constructor() {}

  public static getInstance(): ClaudeAPISelectiveService {
    if (!ClaudeAPISelectiveService.instance) {
      ClaudeAPISelectiveService.instance = new ClaudeAPISelectiveService();
    }
    return ClaudeAPISelectiveService.instance;
  }

  /**
   * PROCESS SELECTIVE CLOUD REQUEST
   * Handles only requests that require cloud intelligence
   */
  async processSelectiveRequest(cloudRequest: CloudRequest): Promise<SelectiveCloudResponse> {
    console.log(`☁️ SELECTIVE CLOUD: Processing ${cloudRequest.agentId} request with token optimization`);

    try {
      // Get agent personality (minimal context)
      const agentPersonality = CONSULTING_AGENT_PERSONALITIES[cloudRequest.agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
      
      // Create minimal system prompt for creative tasks
      const minimalSystemPrompt = this.createMinimalSystemPrompt(agentPersonality, cloudRequest);

      // Prepare minimal message array
      const messages: Anthropic.MessageParam[] = [
        {
          role: 'user',
          content: cloudRequest.message
        }
      ];

      // Make selective Claude API call
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2048, // Reduced from 8192 for token optimization
        system: minimalSystemPrompt,
        messages
      });

      let content = '';
      let tokensUsed = 0;

      // Process response
      for (const contentBlock of response.content) {
        if (contentBlock.type === 'text') {
          content += contentBlock.text;
        }
      }

      // Estimate tokens used (input + output)
      tokensUsed = this.estimateTokenUsage(minimalSystemPrompt, cloudRequest.message, content);

      console.log(`💰 TOKEN USAGE: ${tokensUsed} tokens for selective cloud processing`);

      return {
        success: true,
        content,
        tokensUsed,
        processingType: this.determineProcessingType(cloudRequest.message)
      };

    } catch (error) {
      console.error('Selective cloud processing error:', error);
      return {
        success: false,
        content: 'I encountered an issue processing your request. Please try again.',
        tokensUsed: 0,
        processingType: 'novel'
      };
    }
  }

  /**
   * CREATE MINIMAL SYSTEM PROMPT
   * Optimized system prompt for creative/strategic tasks only
   */
  private createMinimalSystemPrompt(agentPersonality: any, cloudRequest: CloudRequest): string {
    const basePurpose = agentPersonality?.specialization || 'AI assistant';
    const responseStyle = agentPersonality?.responseStyle || 'Professional and helpful';

    return `You are ${cloudRequest.agentId}, specialized in ${basePurpose}.

Style: ${responseStyle}

Context: ${cloudRequest.compressedContext}

Focus on providing creative, strategic, or analytical insights for this request. Be concise but comprehensive.`;
  }

  /**
   * DETERMINE PROCESSING TYPE
   * Categorizes the type of cloud processing needed
   */
  private determineProcessingType(message: string): 'creative' | 'strategic' | 'analytical' | 'novel' {
    if (/design|create|brainstorm|innovate|conceptualize/i.test(message)) {
      return 'creative';
    }
    
    if (/strategy|plan|approach|methodology|framework|architecture/i.test(message)) {
      return 'strategic';
    }
    
    if (/analyze|evaluate|assess|compare|review|examine/i.test(message)) {
      return 'analytical';
    }
    
    return 'novel';
  }

  /**
   * ESTIMATE TOKEN USAGE
   * Provides rough estimate of tokens consumed
   */
  private estimateTokenUsage(systemPrompt: string, userMessage: string, response: string): number {
    // Rough estimation: ~4 characters per token
    const systemTokens = Math.ceil(systemPrompt.length / 4);
    const inputTokens = Math.ceil(userMessage.length / 4);
    const outputTokens = Math.ceil(response.length / 4);
    
    return systemTokens + inputTokens + outputTokens;
  }

  /**
   * STREAM SELECTIVE RESPONSE
   * Provides streaming for selective cloud responses
   */
  async streamSelectiveResponse(
    cloudRequest: CloudRequest,
    res: any
  ): Promise<void> {
    console.log(`🌊 SELECTIVE STREAMING: ${cloudRequest.agentId} with token optimization`);

    try {
      const agentPersonality = CONSULTING_AGENT_PERSONALITIES[cloudRequest.agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
      const minimalSystemPrompt = this.createMinimalSystemPrompt(agentPersonality, cloudRequest);

      // Send agent start event
      res.write(`data: ${JSON.stringify({
        type: 'agent_start',
        agentName: cloudRequest.agentId.charAt(0).toUpperCase() + cloudRequest.agentId.slice(1),
        message: `${cloudRequest.agentId.charAt(0).toUpperCase() + cloudRequest.agentId.slice(1)} is applying creative intelligence...`
      })}\n\n`);

      // Create streaming request with minimal context
      const stream = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2048, // Optimized token limit
        system: minimalSystemPrompt,
        messages: [
          {
            role: 'user',
            content: cloudRequest.message
          }
        ],
        stream: true
      });

      let responseText = '';
      let estimatedTokens = 0;

      // Process streaming response
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          if ('text' in chunk.delta) {
            const textChunk = chunk.delta.text;
            responseText += textChunk;
            estimatedTokens += Math.ceil(textChunk.length / 4);
            
            // Send text delta
            res.write(`data: ${JSON.stringify({
              type: 'text_delta',
              content: textChunk
            })}\n\n`);
          }
        }
      }

      // Send completion event with token usage
      res.write(`data: ${JSON.stringify({
        type: 'completion',
        agentName: cloudRequest.agentId,
        tokensUsed: estimatedTokens,
        processingType: 'selective_cloud'
      })}\n\n`);

      console.log(`✅ SELECTIVE STREAMING COMPLETE: ${estimatedTokens} tokens used`);

    } catch (error) {
      console.error('Selective streaming error:', error);
      
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: 'Creative processing encountered an issue. Please try again.'
      })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
  }
}