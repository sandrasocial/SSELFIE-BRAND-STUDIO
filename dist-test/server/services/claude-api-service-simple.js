/**
 * Claude API Service - Simple Implementation
 * Provides basic Claude API interaction functionality
 */
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '../env.js';
export class ClaudeApiServiceSimple {
    anthropic;
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY
        });
    }
    async sendMessage(message, history = [], systemPrompt) {
        try {
            const messages = [
                ...history.map(entry => ({
                    role: entry.role,
                    content: entry.content
                })),
                {
                    role: 'user',
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
        }
        catch (error) {
            console.error('Claude API error:', error);
            throw new Error(`Claude API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateWithContext(prompt, context, systemPrompt) {
        const fullMessage = context ? `Context: ${context}\n\nPrompt: ${prompt}` : prompt;
        const response = await this.sendMessage(fullMessage, [], systemPrompt);
        return response.content;
    }
}
export const claudeApiServiceSimple = new ClaudeApiServiceSimple();
