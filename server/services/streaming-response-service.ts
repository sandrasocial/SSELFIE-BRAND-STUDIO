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
   * Stream Claude API response with tool execution updates and robust error handling
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

    try {
      // Check if headers already sent to prevent the error
      if (res.headersSent) {
        console.warn('⚠️ Headers already sent, cannot initiate streaming');
        return;
      }

      // Set SSE headers with error handling
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
      });

      // Send agent start signal
      this.safeWrite(res, {
        type: 'agent_start',
        agentName,
        conversationId,
        timestamp: new Date().toISOString()
      });

      // If showing tool execution, stream tool usage
      if (showToolExecution) {
        this.safeWrite(res, {
          type: 'tool_thinking',
          message: `${agentName} is analyzing your request...`,
          timestamp: new Date().toISOString()
        });
      }

      // Stream the actual message content with validation
      if (!messageContent || typeof messageContent !== 'string') {
        this.safeWrite(res, {
          type: 'error',
          error: 'Invalid message content received',
          timestamp: new Date().toISOString()
        });
        res.end();
        return;
      }

      const words = messageContent.split(' ');
      let accumulatedText = '';
      
      // Stream text in chunks with connection checks
      for (let i = 0; i < words.length; i += 4) {
        // Check if connection is still alive
        if (res.destroyed || res.writableEnded) {
          console.log('🔌 Client disconnected during streaming');
          return;
        }

        const chunk = words.slice(i, i + 4).join(' ');
        accumulatedText += (accumulatedText ? ' ' : '') + chunk;
        
        // Send chunk with progress info
        this.safeWrite(res, {
          type: 'chunk',
          chunk: chunk + ' ',
          accumulatedText,
          progress: Math.round((i + 4) / words.length * 100),
          timestamp: new Date().toISOString()
        });

        // Add natural delay with connection check
        await new Promise(resolve => setTimeout(resolve, 40));
      }

      // Send completion signal
      this.safeWrite(res, {
        type: 'complete',
        finalText: messageContent,
        conversationId,
        timestamp: new Date().toISOString()
      });

      res.end();
      console.log(`✅ Streaming completed for agent: ${agentName}`);

    } catch (error) {
      console.error('❌ Streaming error:', error);
      
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Streaming service error'
        }));
      } else if (!res.destroyed) {
        this.safeWrite(res, {
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown streaming error',
          timestamp: new Date().toISOString()
        });
        res.end();
      }
    }
  }

  /**
   * Safe write method that handles connection errors
   */
  private safeWrite(res: Response, data: any): boolean {
    try {
      if (res.destroyed || res.writableEnded) {
        return false;
      }
      
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      return true;
    } catch (error) {
      console.error('Safe write error:', error);
      return false;
    }
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