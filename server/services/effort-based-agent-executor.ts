/**
 * EFFORT-BASED AGENT EXECUTOR
 * Revolutionary task-completion system that works like Replit's agents
 * Pay for completed tasks, not API calls
 */

import { ClaudeApiService } from './claude-api-service';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export interface TaskExecutionRequest {
  agentName: string;
  userId: string;
  task: string;
  conversationId?: string;
  maxEffort?: number; // Maximum "effort units" to spend
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskExecutionResult {
  success: boolean;
  taskCompleted: boolean;
  result: string;
  effortUsed: number;
  costEstimate: number;
  apiCallsUsed: number;
  toolsUsed: string[];
  checkpointId?: string;
  error?: string;
}

export interface EffortMetrics {
  complexity: number; // 1-10 scale
  toolUsage: number; // Number of tools used
  iterationCount: number; // How many API calls needed
  contextSize: number; // Amount of context processed
  completionQuality: number; // 1-10 scale of task completion
}

export class EffortBasedAgentExecutor {
  private claudeService: ClaudeApiService;
  private contextCache = new Map<string, any>();
  private executionHistory = new Map<string, TaskExecutionResult[]>();

  constructor() {
    this.claudeService = new ClaudeApiService();
  }

  /**
   * Execute a task with effort-based pricing
   * Works until task is complete, then charge based on effort
   */
  async executeTask(request: TaskExecutionRequest): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    const executionId = `exec_${request.agentName}_${Date.now()}`;
    
    console.log(`🎯 EFFORT-BASED EXECUTION: Starting task for ${request.agentName}`);
    console.log(`📝 Task: ${request.task.substring(0, 100)}...`);
    console.log(`👤 User ID: ${request.userId}`);

    try {
      // Initialize execution context
      const context = await this.getOptimizedContext(request.agentName, request.conversationId || '');
      
      let iteration = 0;
      let totalApiCalls = 0;
      let toolsUsed: string[] = [];
      let isTaskComplete = false;
      let finalResult = '';
      let maxIterations = request.maxEffort || 10; // Prevent infinite loops

      // Work until task completion
      while (!isTaskComplete && iteration < maxIterations) {
        iteration++;
        console.log(`🔄 ITERATION ${iteration}/${maxIterations}: Executing agent step`);

        // Execute single agent step with optimized context
        const stepResult = await this.executeAgentStep(
          request.agentName,
          request.userId, // Use userId from request
          request.task,
          context,
          iteration,
          request.conversationId
        );

        totalApiCalls++;
        
        if (stepResult.toolsUsed) {
          toolsUsed.push(...stepResult.toolsUsed);
        }

        finalResult = stepResult.response;

        // Validate task completion
        isTaskComplete = await this.validateTaskCompletion(
          request.task,
          stepResult.response,
          stepResult.toolsUsed || []
        );

        console.log(`✅ COMPLETION CHECK: Task complete = ${isTaskComplete}`);

        if (isTaskComplete) {
          break;
        }

        // Update context for next iteration
        await this.updateExecutionContext(context, stepResult);
      }

      // Calculate effort-based cost
      const effortMetrics = this.calculateEffortMetrics({
        complexity: this.assessTaskComplexity(request.task),
        toolUsage: toolsUsed.length,
        iterationCount: totalApiCalls,
        contextSize: JSON.stringify(context).length,
        completionQuality: isTaskComplete ? 10 : 5
      });

      const costEstimate = this.calculateEffortBasedCost(effortMetrics);
      const executionTime = Date.now() - startTime;

      console.log(`🎯 EFFORT-BASED COMPLETION: Task ${isTaskComplete ? 'COMPLETED' : 'PARTIAL'}`);
      console.log(`💰 Cost: $${costEstimate.toFixed(2)} (vs token-based: $${(totalApiCalls * 25).toFixed(2)})`);
      console.log(`⏱️ Time: ${executionTime}ms, API calls: ${totalApiCalls}`);

      // Create checkpoint if task completed successfully
      let checkpointId;
      if (isTaskComplete) {
        checkpointId = await this.createTaskCheckpoint(request, finalResult, effortMetrics);
      }

      return {
        success: true,
        taskCompleted: isTaskComplete,
        result: finalResult,
        effortUsed: effortMetrics.complexity,
        costEstimate,
        apiCallsUsed: totalApiCalls,
        toolsUsed: [...new Set(toolsUsed)], // Remove duplicates
        checkpointId
      };

    } catch (error) {
      console.error('❌ EFFORT-BASED EXECUTION ERROR:', error);
      
      return {
        success: false,
        taskCompleted: false,
        result: '',
        effortUsed: 0,
        costEstimate: 0,
        apiCallsUsed: 0,
        toolsUsed: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute single agent step with minimal API overhead
   */
  private async executeAgentStep(
    agentName: string,
    userId: string,
    task: string,
    context: any,
    iteration: number,
    conversationId?: string
  ): Promise<{ response: string; toolsUsed?: string[] }> {
    // Use optimized context instead of full conversation history
    const optimizedPrompt = this.buildOptimizedPrompt(agentName, task, context, iteration);
    
    try {
      const response = await this.claudeService.sendMessage(
        userId,
        agentName,
        conversationId,
        optimizedPrompt,
        undefined, // system prompt already optimized
        undefined, // tools handled by service
        true // enable file edit mode
      );

      // Extract tools used from response
      const toolsUsed = this.extractToolsUsed(response);

      return {
        response,
        toolsUsed
      };

    } catch (error) {
      console.error(`❌ Agent step failed for ${agentName}:`, error);
      throw error;
    }
  }

  /**
   * Get optimized context to minimize API overhead
   */
  private async getOptimizedContext(agentName: string, conversationId: string): Promise<any> {
    const cacheKey = `${agentName}-${conversationId}`;
    
    // Check cache first
    if (this.contextCache.has(cacheKey)) {
      console.log(`🔄 CONTEXT CACHE: Using cached context for ${agentName}`);
      return this.contextCache.get(cacheKey);
    }

    // Build minimal context
    const context = {
      agentPersonality: CONSULTING_AGENT_PERSONALITIES[agentName as keyof typeof CONSULTING_AGENT_PERSONALITIES],
      recentMessages: await this.getRecentMessages(conversationId, 3), // Only last 3 messages
      projectState: await this.getCurrentProjectState(),
      timestamp: new Date().toISOString()
    };

    // Cache for reuse
    this.contextCache.set(cacheKey, context);
    
    console.log(`💾 CONTEXT OPTIMIZED: Built minimal context for ${agentName} (${JSON.stringify(context).length} chars)`);
    
    return context;
  }

  /**
   * Build optimized prompt to minimize token usage
   */
  private buildOptimizedPrompt(agentName: string, task: string, context: any, iteration: number): string {
    const agent = context.agentPersonality;
    
    if (!agent) {
      throw new Error(`Agent ${agentName} not found in personalities`);
    }

    // Compressed system prompt (vs 2000+ token original)
    const optimizedPrompt = `${agent.name} - ${agent.role}

TASK: ${task}

${iteration > 1 ? `ITERATION ${iteration}: Continue working on the task above.` : ''}

COST-OPTIMIZED MODE: Be direct and complete the task efficiently. Use tools only when necessary.

Respond with your implementation or next steps.`;

    console.log(`🔧 PROMPT OPTIMIZED: ${optimizedPrompt.length} chars (vs ~2000+ original)`);
    
    return optimizedPrompt;
  }

  /**
   * Validate if task is actually complete
   */
  private async validateTaskCompletion(
    originalTask: string, 
    response: string, 
    toolsUsed: string[]
  ): Promise<boolean> {
    // Task completion heuristics
    const completionIndicators = [
      response.toLowerCase().includes('completed'),
      response.toLowerCase().includes('finished'),
      response.toLowerCase().includes('done'),
      response.toLowerCase().includes('created'),
      response.toLowerCase().includes('implemented'),
      toolsUsed.includes('str_replace_based_edit_tool'), // File modification occurred
      response.length > 200 // Substantial response
    ];

    const indicatorCount = completionIndicators.filter(Boolean).length;
    const isComplete = indicatorCount >= 2; // At least 2 indicators

    console.log(`🔍 COMPLETION VALIDATION: ${indicatorCount}/7 indicators met = ${isComplete}`);
    
    return isComplete;
  }

  /**
   * Calculate effort metrics for pricing
   */
  private calculateEffortMetrics(metrics: EffortMetrics): EffortMetrics {
    // Normalize metrics to 1-10 scale
    return {
      complexity: Math.max(1, Math.min(10, metrics.complexity)),
      toolUsage: Math.max(0, metrics.toolUsage),
      iterationCount: Math.max(1, metrics.iterationCount),
      contextSize: Math.max(100, metrics.contextSize),
      completionQuality: Math.max(1, Math.min(10, metrics.completionQuality))
    };
  }

  /**
   * Calculate effort-based cost (like Replit's checkpoints)
   */
  private calculateEffortBasedCost(metrics: EffortMetrics): number {
    // Base cost for simple tasks
    let baseCost = 2.0;
    
    // Complexity multiplier (1x to 3x)
    const complexityMultiplier = 1 + (metrics.complexity - 1) * 0.3;
    
    // Tool usage cost (each tool adds cost)
    const toolCost = metrics.toolUsage * 0.5;
    
    // Iteration penalty (more iterations = higher cost)
    const iterationCost = Math.max(0, (metrics.iterationCount - 1) * 1.0);
    
    // Quality bonus (completed tasks cost more but provide value)
    const qualityMultiplier = metrics.completionQuality >= 8 ? 1.2 : 0.8;
    
    const totalCost = (baseCost * complexityMultiplier + toolCost + iterationCost) * qualityMultiplier;
    
    // Cap at reasonable limits
    return Math.max(1.0, Math.min(50.0, totalCost));
  }

  /**
   * Assess task complexity for pricing
   */
  private assessTaskComplexity(task: string): number {
    const complexityIndicators = {
      simple: ['fix', 'update', 'change', 'modify'],
      medium: ['create', 'build', 'implement', 'add', 'design'],
      complex: ['refactor', 'optimize', 'integrate', 'architecture', 'system']
    };

    const taskLower = task.toLowerCase();
    
    if (complexityIndicators.complex.some(word => taskLower.includes(word))) {
      return 8; // High complexity
    }
    
    if (complexityIndicators.medium.some(word => taskLower.includes(word))) {
      return 5; // Medium complexity
    }
    
    return 2; // Simple task
  }

  /**
   * Create checkpoint for completed task
   */
  private async createTaskCheckpoint(
    request: TaskExecutionRequest,
    result: string,
    metrics: EffortMetrics
  ): Promise<string> {
    const checkpointId = `checkpoint_${request.agentName}_${Date.now()}`;
    
    console.log(`📸 CHECKPOINT CREATED: ${checkpointId} for ${request.agentName}`);
    console.log(`💰 Cost: $${this.calculateEffortBasedCost(metrics).toFixed(2)}`);
    
    // Store checkpoint data (could be in database)
    const checkpoint = {
      id: checkpointId,
      agentName: request.agentName,
      task: request.task,
      result,
      metrics,
      cost: this.calculateEffortBasedCost(metrics),
      timestamp: new Date().toISOString()
    };

    // TODO: Save to database
    
    return checkpointId;
  }

  /**
   * Get recent messages for context
   */
  private async getRecentMessages(conversationId: string, limit: number = 3): Promise<any[]> {
    if (!conversationId) return [];

    try {
      const messages = await db
        .select()
        .from(claudeMessages)
        .where(eq(claudeMessages.conversationId, parseInt(conversationId)))
        .orderBy(desc(claudeMessages.createdAt))
        .limit(limit);

      return messages.reverse(); // Chronological order
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      return [];
    }
  }

  /**
   * Get current project state for context
   */
  private async getCurrentProjectState(): Promise<any> {
    return {
      platform: 'SSELFIE Studio',
      architecture: 'React + Express + PostgreSQL',
      features: ['AI Image Generation', 'User Authentication', 'Premium Subscriptions'],
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Extract tools used from response
   */
  private extractToolsUsed(response: string): string[] {
    const tools: string[] = [];
    
    if (response.includes('str_replace_based_edit_tool') || response.includes('file modified')) {
      tools.push('str_replace_based_edit_tool');
    }
    
    if (response.includes('search_filesystem') || response.includes('searched codebase')) {
      tools.push('search_filesystem');
    }
    
    if (response.includes('bash') || response.includes('command executed')) {
      tools.push('bash');
    }
    
    return tools;
  }

  /**
   * Update execution context for next iteration
   */
  private async updateExecutionContext(context: any, stepResult: any): Promise<void> {
    // Add step result to context for next iteration
    if (!context.executionHistory) {
      context.executionHistory = [];
    }
    
    context.executionHistory.push({
      response: stepResult.response.substring(0, 200), // Truncate for efficiency
      toolsUsed: stepResult.toolsUsed,
      timestamp: new Date().toISOString()
    });

    // Keep only last 3 steps to minimize context
    if (context.executionHistory.length > 3) {
      context.executionHistory = context.executionHistory.slice(-3);
    }
  }
}

export const effortBasedExecutor = new EffortBasedAgentExecutor();