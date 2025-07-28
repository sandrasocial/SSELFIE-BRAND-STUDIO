/**
 * STREAMING RESPONSE SERVICE
 * 
 * Implements real-time streaming text responses like Replit AI agents
 * Provides word-by-word or sentence-by-sentence streaming for better UX
 */

import { Response } from 'express';

export class StreamingResponseService {
  private static instance: StreamingResponseService;
  
  public static getInstance(): StreamingResponseService {
    if (!StreamingResponseService.instance) {
      StreamingResponseService.instance = new StreamingResponseService();
    }
    return StreamingResponseService.instance;
  }

  /**
   * Stream text response word by word like Replit AI agents
   */
  public async streamTextResponse(
    res: Response,
    text: string,
    options: {
      delayMs?: number;
      chunkSize?: number;
      conversationId?: string;
      agentName?: string;
    } = {}
  ): Promise<void> {
    const {
      delayMs = 50, // 50ms delay between chunks for natural reading speed
      chunkSize = 3, // Stream 3 words at a time
      conversationId,
      agentName
    } = options;

    // Check if headers already sent to prevent the error
    if (res.headersSent) {
      console.warn('Headers already sent, cannot set streaming headers');
      return;
    }

    // Set headers for Server-Sent Events (SSE)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const words = text.split(' ');
    let accumulatedText = '';
    
    // Send initial metadata
    res.write(`data: ${JSON.stringify({
      type: 'start',
      agentName,
      conversationId,
      totalWords: words.length,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Stream text in chunks
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      accumulatedText += (accumulatedText ? ' ' : '') + chunk;
      
      // Send chunk with progress info
      res.write(`data: ${JSON.stringify({
        type: 'chunk',
        chunk: chunk + ' ',
        accumulatedText,
        progress: Math.round((i + chunkSize) / words.length * 100),
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Add natural delay
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      finalText: text,
      conversationId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    res.end();
  }

  /**
   * Stream Claude API response with tool execution updates
   */
  public async streamClaudeResponse(
    res: Response,
    agentName: string,
    messageContent: string,
    options: {
      conversationId?: string;
      showToolExecution?: boolean;
    } = {}
  ): Promise<void> {
    const { conversationId, showToolExecution = true } = options;

    // Check if headers already sent to prevent the error
    if (res.headersSent) {
      console.warn('Headers already sent, cannot set streaming headers');
      return;
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send agent start signal
    res.write(`data: ${JSON.stringify({
      type: 'agent_start',
      agentName,
      conversationId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // If showing tool execution, stream tool usage
    if (showToolExecution) {
      res.write(`data: ${JSON.stringify({
        type: 'tool_thinking',
        message: `${agentName} is analyzing your request...`,
        timestamp: new Date().toISOString()
      })}\n\n`);
    }

    // Stream the actual message content (headers already set)
    const words = messageContent.split(' ');
    let accumulatedText = '';
    
    // Stream text in chunks without setting headers again
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ');
      accumulatedText += (accumulatedText ? ' ' : '') + chunk;
      
      // Send chunk with progress info
      res.write(`data: ${JSON.stringify({
        type: 'chunk',
        chunk: chunk + ' ',
        accumulatedText,
        progress: Math.round((i + 4) / words.length * 100),
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Add natural delay
      await new Promise(resolve => setTimeout(resolve, 40));
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      finalText: messageContent,
      conversationId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    res.end();
  }

  /**
   * Stream tool execution updates
   */
  public streamToolExecution(
    res: Response,
    toolName: string,
    status: 'starting' | 'progress' | 'complete' | 'error',
    details?: string
  ): void {
    res.write(`data: ${JSON.stringify({
      type: 'tool_execution',
      toolName,
      status,
      details,
      timestamp: new Date().toISOString()
    })}\n\n`);
  }
}

export const streamingService = StreamingResponseService.getInstance();