/**
 * AI Agent Command API Endpoint
 * 
 * Handles commands sent to the AI Agent from the Command Center UI
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AIAgentService } from '../../server/services/ai-agent-service.js';
import { HIGHLEVEL_API_KEY, ANTHROPIC_API_KEY } from '../../server/env.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      response: 'Only POST requests are supported for AI agent commands.'
    });
  }
  try {
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Command is required and must be a string',
        message: 'Please provide a valid command.'
      });
    }

    // Validate required API keys
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'AI service not configured',
        response: 'The AI brain is not properly configured. Please contact support.'
      });
    }

    // Initialize AI Agent Service with Claude and High Level API keys
    const aiAgent = new AIAgentService(ANTHROPIC_API_KEY, HIGHLEVEL_API_KEY);
    
    // Process the command
    const result = await aiAgent.handleCommand(command);

    // Return the result from the AI Agent
    return res.json({
      success: result.success,
      response: result.message,
      data: result.data || null,
      error: result.error || null,
      availableCommands: result.availableCommands || null
    });

  } catch (error) {
    console.error('AI Agent command processing error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      response: 'I encountered an unexpected error while processing your command. Please try again or contact support.',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}