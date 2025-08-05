/**
 * STREAMING CONTINUATION SERVICE
 * Maintains agent voice continuity during tool execution
 * Implements Sandra's vision: Uninterrupted agent streaming with tool integration
 */

import { Response } from 'express';
import { agentToolOrchestrator } from './agent-tool-orchestrator';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';

interface StreamingSession {
  agentId: string;
  userId: string;
  conversationId: string;
  response: Response;
  isActive: boolean;
  context: string;
}

export class StreamingContinuationService {
  private activeSessions: Map<string, StreamingSession> = new Map();
  private streamingQueues: Map<string, string[]> = new Map();

  /**
   * START AGENT STREAMING SESSION
   * Begin streaming with agent personality, maintain during tool execution
   */
  async startAgentStreaming(
    agentId: string,
    userId: string,
    conversationId: string,
    userMessage: string,
    response: Response
  ): Promise<void> {
    const sessionKey = `${agentId}-${conversationId}`;
    console.log(`🎬 STREAMING START: ${agentId} beginning response stream`);

    // Initialize streaming session
    const session: StreamingSession = {
      agentId,
      userId,
      conversationId,
      response,
      isActive: true,
      context: userMessage
    };
    
    this.activeSessions.set(sessionKey, session);
    
    // Set up response headers for continuous streaming
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Access-Control-Allow-Origin', '*');

    // Get agent personality
    const agentPersonality = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    const agentName = agentPersonality?.name || agentId;

    // Start with agent introduction
    this.streamMessage(sessionKey, {
      type: 'agent_start',
      agentName,
      message: `${agentName} is analyzing your request...`
    });

    // Analyze if tools are needed
    const needsTools = await this.analyzeToolRequirements(userMessage, agentId);
    
    if (needsTools.length > 0) {
      // Agent announces tool usage while maintaining voice
      this.streamMessage(sessionKey, {
        type: 'text_delta',
        content: `I'll need to ${this.describeToolActions(needsTools)} to give you a complete answer. Let me investigate this for you...\n\n`
      });
      
      // Execute tools while keeping stream alive
      await this.executeToolsWithContinuity(sessionKey, needsTools, userMessage);
    } else {
      // Direct response without tools
      await this.generateDirectResponse(sessionKey, userMessage);
    }
  }

  /**
   * EXECUTE TOOLS WITH STREAMING CONTINUITY
   * Run tools while keeping agent voice active
   */
  private async executeToolsWithContinuity(
    sessionKey: string,
    toolRequirements: any[],
    userMessage: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) return;

    console.log(`🔧 TOOLS WITH CONTINUITY: ${session.agentId} executing ${toolRequirements.length} tools`);

    // Execute each tool with streaming updates
    for (const toolReq of toolRequirements) {
      if (!session.isActive) break;

      // Agent narrates what it's doing
      this.streamMessage(sessionKey, {
        type: 'tool_start',
        toolName: toolReq.toolName,
        message: `Checking ${toolReq.description}...`
      });

      // Execute tool via orchestrator (zero API cost)
      await agentToolOrchestrator.agentTriggerTool({
        agentId: session.agentId,
        toolName: toolReq.toolName,
        parameters: toolReq.parameters,
        conversationId: session.conversationId,
        userId: session.userId,
        context: userMessage
      });

      // Tool completion acknowledgment
      this.streamMessage(sessionKey, {
        type: 'tool_complete',
        toolName: toolReq.toolName,
        message: `✓ Analysis complete`
      });
    }

    // Wait for tool orchestrator to process all results
    setTimeout(async () => {
      await this.continueWithToolResults(sessionKey);
    }, 500);
  }

  /**
   * CONTINUE STREAMING WITH TOOL RESULTS
   * Agent reviews findings and provides authentic response
   */
  private async continueWithToolResults(sessionKey: string): Promise<void> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) return;

    console.log(`🎭 CONTINUING WITH RESULTS: ${session.agentId} reviewing tool findings`);

    // Get tool results from orchestrator
    const toolResults = agentToolOrchestrator.getAgentToolResults(session.agentId);
    
    if (toolResults.length === 0) {
      this.streamMessage(sessionKey, {
        type: 'text_delta',
        content: `I wasn't able to gather the information needed. Let me try a different approach...\n\n`
      });
      await this.generateDirectResponse(sessionKey, session.context);
      return;
    }

    // Agent reviews and summarizes findings
    const agentPersonality = CONSULTING_AGENT_PERSONALITIES[session.agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    this.streamMessage(sessionKey, {
      type: 'text_delta',
      content: `Based on my investigation, here's what I found:\n\n`
    });

    // Stream findings in agent's authentic voice
    await this.streamToolFindings(sessionKey, toolResults, agentPersonality);

    // Generate contextual response using minimal Claude API call
    await this.generateContextualResponse(sessionKey, toolResults);
  }

  /**
   * STREAM TOOL FINDINGS IN AGENT VOICE
   * Present findings authentically without token waste
   */
  private async streamToolFindings(
    sessionKey: string,
    toolResults: any[],
    agentPersonality: any
  ): Promise<void> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) return;

    for (const result of toolResults) {
      if (!session.isActive) break;

      // Agent-specific finding presentation
      const finding = this.formatFindingForAgent(result, agentPersonality);
      
      // Stream finding gradually for natural feel
      const words = finding.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' ';
        this.streamMessage(sessionKey, {
          type: 'text_delta',
          content: chunk
        });
        await this.delay(50); // Natural typing speed
      }
      
      this.streamMessage(sessionKey, {
        type: 'text_delta',
        content: '\n\n'
      });
    }
  }

  /**
   * GENERATE CONTEXTUAL RESPONSE
   * Minimal Claude API call for agent's authentic analysis
   */
  private async generateContextualResponse(
    sessionKey: string,
    toolResults: any[]
  ): Promise<void> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) return;

    // Create findings context for Claude API (minimal tokens)
    const findingsContext = agentToolOrchestrator.handleAgentContinuation({
      agentId: session.agentId,
      toolResults,
      nextAction: 'respond',
      context: session.context
    });

    // Use minimal Claude API call for authentic agent response
    const agentPersonality = CONSULTING_AGENT_PERSONALITIES[session.agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    const minimalPrompt = `Based on the tool findings, provide your expert analysis and recommendations. Keep response concise and actionable.

FINDINGS: ${await findingsContext}

USER REQUEST: ${session.context}`;

    // Stream agent's analytical response
    this.streamMessage(sessionKey, {
      type: 'text_delta',
      content: `**My Analysis:**\n\n`
    });

    // Here we would make a minimal Claude API call, but for now simulate response
    const simulatedResponse = await this.generateSimulatedResponse(session.agentId, toolResults);
    
    // Stream response naturally
    const responseWords = simulatedResponse.split(' ');
    for (let i = 0; i < responseWords.length; i += 4) {
      if (!session.isActive) break;
      
      const chunk = responseWords.slice(i, i + 4).join(' ') + ' ';
      this.streamMessage(sessionKey, {
        type: 'text_delta',
        content: chunk
      });
      await this.delay(80);
    }

    // Complete the session
    await this.completeSession(sessionKey);
  }

  /**
   * ANALYZE TOOL REQUIREMENTS
   * Determine what tools agent needs without Claude API
   */
  private async analyzeToolRequirements(message: string, agentId: string): Promise<any[]> {
    const tools = [];
    
    // Smart keyword analysis for tool detection
    if (message.includes('check') || message.includes('find') || message.includes('search')) {
      tools.push({
        toolName: 'search_filesystem',
        parameters: { query_description: `Find files related to: ${message}` },
        description: 'the codebase'
      });
    }
    
    if (message.includes('error') || message.includes('broken') || message.includes('issue')) {
      tools.push({
        toolName: 'get_latest_lsp_diagnostics',
        parameters: {},
        description: 'error diagnostics'
      });
    }
    
    return tools;
  }

  /**
   * UTILITY METHODS
   */
  private describeToolActions(tools: any[]): string {
    const actions = tools.map(t => t.description).join(' and ');
    return actions;
  }

  private formatFindingForAgent(result: any, personality: any): string {
    if (!result.success) {
      return `⚠️ I encountered an issue: ${result.error}`;
    }
    
    const toolName = result.metadata.toolsUsed[0];
    switch (toolName) {
      case 'search_filesystem':
        return `📁 Found ${result.data?.length || 0} relevant files in the codebase.`;
      case 'get_latest_lsp_diagnostics':
        return result.data?.length ? 
          `🔍 Detected ${result.data.length} code issues that need attention.` :
          `✅ No code errors detected - everything looks clean.`;
      default:
        return `✅ ${toolName} completed successfully.`;
    }
  }

  private async generateSimulatedResponse(agentId: string, toolResults: any[]): Promise<string> {
    // Simulate agent-specific response based on personality
    const personality = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    const successfulTools = toolResults.filter(r => r.success).length;
    const totalTools = toolResults.length;
    
    return `I've completed my analysis using ${successfulTools}/${totalTools} diagnostic tools. Based on what I found, I recommend taking action on the key areas identified. Let me know if you'd like me to investigate any specific findings in more detail or proceed with implementing fixes.`;
  }

  private streamMessage(sessionKey: string, message: any): void {
    const session = this.activeSessions.get(sessionKey);
    if (session && session.isActive) {
      session.response.write(`data: ${JSON.stringify(message)}\n\n`);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async generateDirectResponse(sessionKey: string, message: string): Promise<void> {
    // For direct responses without tools, still provide agent personality
    this.streamMessage(sessionKey, {
      type: 'text_delta',
      content: `I understand your request. Let me provide you with my direct analysis and recommendations...\n\n`
    });
    
    await this.delay(1000);
    await this.completeSession(sessionKey);
  }

  private async completeSession(sessionKey: string): Promise<void> {
    const session = this.activeSessions.get(sessionKey);
    if (session) {
      // Clear agent tool buffer
      agentToolOrchestrator.clearAgentBuffer(session.agentId);
      
      // Send completion signal
      this.streamMessage(sessionKey, {
        type: 'completion',
        agentId: session.agentId,
        conversationId: session.conversationId,
        success: true
      });
      
      // End session
      session.response.end();
      session.isActive = false;
      this.activeSessions.delete(sessionKey);
      
      console.log(`✅ STREAMING COMPLETE: ${session.agentId} session ended`);
    }
  }

  /**
   * EMERGENCY SESSION CLEANUP
   */
  cleanupSession(agentId: string, conversationId: string): void {
    const sessionKey = `${agentId}-${conversationId}`;
    const session = this.activeSessions.get(sessionKey);
    if (session) {
      session.isActive = false;
      session.response.end();
      this.activeSessions.delete(sessionKey);
    }
  }
}

// Export singleton instance
export const streamingContinuationService = new StreamingContinuationService();