/**
 * Claude API Service - Simple Implementation
 * Provides basic Claude API interaction functionality
 */

import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '../env.js';

export interface ClaudeHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class ClaudeApiServiceSimple {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY
    });
  }

  async sendMessage(
    message: string,
    history: ClaudeHistoryEntry[] = [],
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    try {
      const messages: Anthropic.Messages.MessageParam[] = [
        ...history.map(entry => ({
          role: entry.role as 'user' | 'assistant',
          content: entry.content
        })),
        {
          role: 'user' as const,
          content: message
        }
      ];

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages,
        ...(systemPrompt && { system: systemPrompt })
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      return {
        content: content.text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateWithContext(
    prompt: string,
    context: string,
    systemPrompt?: string
  ): Promise<string> {
    const fullMessage = context ? `Context: ${context}\n\nPrompt: ${prompt}` : prompt;
    const response = await this.sendMessage(fullMessage, [], systemPrompt);
    return response.content;
  }
}

export const claudeApiServiceSimple = new ClaudeApiServiceSimple();