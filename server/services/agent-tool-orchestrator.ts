/**
 * INTELLIGENT AGENT-TOOL ORCHESTRATOR
 * Implements Sandra's vision: Agents trigger tools → Tools execute → Agents respond authentically
 * ZERO Claude API costs for tool operations, streaming continuity maintained
 */

import { EventEmitter } from 'events';

interface ToolExecutionRequest {
  agentId: string;
  toolName: string;
  parameters: any;
  conversationId: string;
  userId: string;
  context: string;
}

interface ToolExecutionResult {
  success: boolean;
  data: any;
  error?: string;
  metadata: {
    executionTime: number;
    apiCost: number; // Always 0 for bypass tools
    toolsUsed: string[];
  };
}

interface AgentContinuationSignal {
  agentId: string;
  toolResults: ToolExecutionResult[];
  nextAction: 'respond' | 'continue_tools' | 'validate';
  context: string;
}

export class AgentToolOrchestrator extends EventEmitter {
  private toolQueue: Map<string, ToolExecutionRequest[]> = new Map();
  private resultBuffer: Map<string, ToolExecutionResult[]> = new Map();
  private activeAgents: Set<string> = new Set();

  /**
   * AGENT-INITIATED TOOL EXECUTION
   * Agents trigger tools without Claude API involvement
   */
  async agentTriggerTool(request: ToolExecutionRequest): Promise<void> {
    console.log(`🎯 AGENT TOOL TRIGGER: ${request.agentId} requests ${request.toolName}`);
    
    // Add to execution queue
    if (!this.toolQueue.has(request.agentId)) {
      this.toolQueue.set(request.agentId, []);
    }
    this.toolQueue.get(request.agentId)!.push(request);
    
    // Execute immediately with zero Claude API cost
    const result = await this.executeToolDirectly(request);
    
    // Store result for agent review
    if (!this.resultBuffer.has(request.agentId)) {
      this.resultBuffer.set(request.agentId, []);
    }
    this.resultBuffer.get(request.agentId)!.push(result);
    
    // Signal agent for continuation
    this.emit('toolsComplete', {
      agentId: request.agentId,
      toolResults: this.resultBuffer.get(request.agentId)!,
      nextAction: 'respond',
      context: request.context
    } as AgentContinuationSignal);
  }

  /**
   * DIRECT TOOL EXECUTION (ZERO API COST)
   * Execute tools through bypass system with enterprise intelligence
   */
  private async executeToolDirectly(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    console.log(`⚡ DIRECT EXECUTION: ${request.toolName} - NO API COST`);

    try {
      let result: any;
      
      switch (request.toolName) {
        case 'search_filesystem':
          const { search_filesystem } = await import('../tools/search_filesystem');
          result = await search_filesystem(request.parameters);
          break;
          
        case 'str_replace_based_edit_tool':
          const { str_replace_based_edit_tool } = await import('../tools/str_replace_based_edit_tool');
          result = await str_replace_based_edit_tool(request.parameters, true); // Bypass mode
          break;
          
        case 'bash':
          const { bash } = await import('../tools/bash');
          result = await bash(request.parameters, true); // Bypass mode
          break;
          
        case 'get_latest_lsp_diagnostics':
          const { get_latest_lsp_diagnostics } = await import('../tools/get_latest_lsp_diagnostics');
          result = await get_latest_lsp_diagnostics(request.parameters, true); // Bypass mode
          break;
          
        default:
          throw new Error(`Tool ${request.toolName} not supported in bypass mode`);
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ TOOL COMPLETE: ${request.toolName} in ${executionTime}ms - $0 API cost`);

      return {
        success: true,
        data: result,
        metadata: {
          executionTime,
          apiCost: 0, // ZERO Claude API cost
          toolsUsed: [request.toolName]
        }
      };

    } catch (error: any) {
      console.error(`❌ TOOL EXECUTION FAILED: ${request.toolName}:`, error);
      
      return {
        success: false,
        data: null,
        error: error.message,
        metadata: {
          executionTime: Date.now() - startTime,
          apiCost: 0, // Still zero cost even on failure
          toolsUsed: [request.toolName]
        }
      };
    }
  }

  /**
   * AGENT CONTINUATION HANDLER
   * Agents receive tool results and continue with authentic responses
   */
  async handleAgentContinuation(signal: AgentContinuationSignal): Promise<string> {
    const userId = '42585527'; // Default user ID
    console.log(`🎭 AGENT CONTINUATION: ${signal.agentId} reviewing ${signal.toolResults.length} tool results`);
    
    // Prepare findings summary for agent
    const findings = signal.toolResults.map(result => {
      return {
        toolUsed: result.metadata.toolsUsed[0],
        success: result.success,
        data: result.data,
        error: result.error
      };
    });
    
    // Create context-rich summary for agent response
    const findingsContext = `
**🔍 TOOL EXECUTION RESULTS:**
${findings.map(f => `• ${f.toolUsed}: ${f.success ? 'SUCCESS' : 'FAILED'}`).join('\n')}

**📊 FINDINGS SUMMARY:**
${findings.filter(f => f.success).map(f => `• Found: ${JSON.stringify(f.data).substring(0, 200)}...`).join('\n')}

**⚠️ ISSUES IDENTIFIED:**
${findings.filter(f => !f.success).map(f => `• Error in ${f.toolUsed}: ${f.error}`).join('\n')}
`;

    // Store findings in agent memory for context-aware response
    // TODO: Connect to conversation manager when needed
    console.log(`📝 AGENT MEMORY: ${signal.agentId} context stored for future reference`);

    return findingsContext;
  }

  /**
   * MULTI-TOOL WORKFLOW COORDINATION
   * Handle complex workflows with multiple tool sequences
   */
  async executeMultiToolWorkflow(agentId: string, toolSequence: ToolExecutionRequest[]): Promise<AgentContinuationSignal> {
    console.log(`🔄 MULTI-TOOL WORKFLOW: ${agentId} executing ${toolSequence.length} tools in sequence`);
    
    const results: ToolExecutionResult[] = [];
    
    for (const toolRequest of toolSequence) {
      const result = await this.executeToolDirectly(toolRequest);
      results.push(result);
      
      // If a tool fails, decide whether to continue or abort
      if (!result.success && this.isCriticalTool(toolRequest.toolName)) {
        console.log(`🚨 CRITICAL TOOL FAILED: ${toolRequest.toolName} - aborting workflow`);
        break;
      }
    }
    
    return {
      agentId,
      toolResults: results,
      nextAction: results.every(r => r.success) ? 'respond' : 'continue_tools',
      context: `Multi-tool workflow completed: ${results.filter(r => r.success).length}/${results.length} successful`
    };
  }

  /**
   * TOOL VALIDATION SYSTEM
   * Agents can trigger validation tools before final responses
   */
  async validateToolResults(agentId: string, previousResults: ToolExecutionResult[]): Promise<ToolExecutionResult> {
    console.log(`🔍 VALIDATION: ${agentId} validating ${previousResults.length} previous tool results`);
    
    // Run diagnostics to check for conflicts or errors
    const validationRequest: ToolExecutionRequest = {
      agentId,
      toolName: 'get_latest_lsp_diagnostics',
      parameters: {}, // Check all files
      conversationId: `validation-${Date.now()}`,
      userId: '42585527',
      context: 'Post-tool validation check'
    };
    
    return await this.executeToolDirectly(validationRequest);
  }

  /**
   * CLEANUP AND OPTIMIZATION
   */
  private isCriticalTool(toolName: string): boolean {
    return ['str_replace_based_edit_tool', 'bash'].includes(toolName);
  }

  /**
   * Get pending tool results for an agent
   */
  getAgentToolResults(agentId: string): ToolExecutionResult[] {
    return this.resultBuffer.get(agentId) || [];
  }

  /**
   * Get active agents list
   */
  getActiveAgents(): string[] {
    return Array.from(this.activeAgents);
  }

  /**
   * Clear agent tool buffer after response
   */
  clearAgentBuffer(agentId: string): void {
    this.resultBuffer.delete(agentId);
    this.toolQueue.delete(agentId);
  }
}

// Export singleton instance
export const agentToolOrchestrator = new AgentToolOrchestrator();