import { unifiedWorkspace, WorkspaceOperation } from './unified-workspace-service';
import { intelligentContext, AgentWorkContext } from './intelligent-context-manager';
import { autonomousNavigation, NavigationResult, NavigationIntent } from './autonomous-navigation-system';
import { errorPrevention, ValidationResult } from './predictive-error-prevention';
import { unifiedState, AgentState } from './unified-state-manager';

/**
 * AUTONOMOUS AGENT INTEGRATION
 * Main integration layer that gives admin agents Replit AI-like capabilities
 * ZERO API COSTS for all tool operations
 */

export interface AutonomousAgentRequest {
  agentId: string;
  message: string;
  context?: string;
  conversationId?: string;
}

export interface AutonomousAgentResponse {
  success: boolean;
  response: string;
  fileOperations: WorkspaceOperation[];
  navigationResults: NavigationResult;
  validationResults: ValidationResult[];
  costOptimized: true;
  agentState: AgentState;
}

export class AutonomousAgentIntegration {
  private static instance: AutonomousAgentIntegration;

  private constructor() {}

  public static getInstance(): AutonomousAgentIntegration {
    if (!AutonomousAgentIntegration.instance) {
      AutonomousAgentIntegration.instance = new AutonomousAgentIntegration();
    }
    return AutonomousAgentIntegration.instance;
  }

  /**
   * MAIN AUTONOMOUS PROCESSING
   * Processes agent requests with full autonomous capabilities
   */
  async processAutonomousRequest(request: AutonomousAgentRequest): Promise<AutonomousAgentResponse> {
    console.log(`🤖 AUTONOMOUS AGENT: Processing request for ${request.agentId}`);

    try {
      // 1. Register agent and get work context
      const agentState = await unifiedState.registerAgent(request.agentId, request.message);
      
      // 2. Analyze the request with intelligent context
      const workContext = await intelligentContext.analyzeAgentRequest(request.message, request.agentId);
      
      // 3. Perform autonomous navigation if needed
      const navigationIntent: NavigationIntent = {
        goal: request.message,
        currentContext: request.context,
        agentType: request.agentId
      };
      
      const navigationResults = await autonomousNavigation.navigateToRelevantFiles(navigationIntent);
      
      // 4. Execute file operations with validation
      const fileOperations: WorkspaceOperation[] = [];
      const validationResults: ValidationResult[] = [];
      
      // Process suggested actions from context analysis
      for (const suggestion of workContext.suggestedActions) {
        for (const file of suggestion.files) {
          const operation = {
            command: suggestion.action,
            path: file
          };
          
          // Validate operation
          const validation = await errorPrevention.validateOperation({
            operation,
            context: request.message,
            agentType: request.agentId
          });
          
          validationResults.push(validation);
          
          // Execute if valid or auto-corrected
          const finalOperation = validation.valid ? operation : validation.correctedOperation;
          
          if (finalOperation) {
            // Coordinate with state manager
            const coordination = await unifiedState.coordinateOperation(
              request.agentId,
              finalOperation,
              request.message
            );
            
            if (coordination.approved) {
              // Execute the operation
              const result = await unifiedWorkspace.executeFileOperation(
                finalOperation.command,
                finalOperation.path,
                finalOperation
              );
              
              fileOperations.push(result);
            }
          }
        }
      }
      
      // 5. Update shared context
      await unifiedState.updateSharedContext(request.agentId, {
        lastRequest: request.message,
        discoveredFiles: navigationResults.discoveredFiles,
        operationsPerformed: fileOperations.length,
        timestamp: new Date()
      });
      
      // 6. Generate autonomous response
      const response = this.generateAutonomousResponse(
        request,
        workContext,
        navigationResults,
        fileOperations,
        validationResults
      );
      
      return {
        success: true,
        response,
        fileOperations,
        navigationResults,
        validationResults,
        costOptimized: true,
        agentState
      };
      
    } catch (error) {
      console.error(`❌ AUTONOMOUS AGENT ERROR (${request.agentId}):`, error);
      
      return {
        success: false,
        response: `Autonomous processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fileOperations: [],
        navigationResults: {
          success: false,
          discoveredFiles: [],
          suggestedActions: [],
          contextualHelp: [],
          errorPrevention: []
        },
        validationResults: [],
        costOptimized: true,
        agentState: await unifiedState.registerAgent(request.agentId, 'error_recovery')
      };
    }
  }

  /**
   * AUTONOMOUS FILE DISCOVERY
   * Helps agents find files without exact paths
   */
  async autonomousFileDiscovery(agentId: string, intent: string): Promise<string[]> {
    console.log(`🔍 AUTONOMOUS DISCOVERY: ${agentId} searching for "${intent}"`);

    const navigationIntent: NavigationIntent = {
      goal: intent,
      agentType: agentId
    };

    const results = await autonomousNavigation.navigateToRelevantFiles(navigationIntent);
    
    if (results.success) {
      // Learn from successful discovery
      await intelligentContext.learnFromAgentAction(agentId, intent, 'file_discovery', true);
      return results.discoveredFiles;
    }

    return [];
  }

  /**
   * AUTONOMOUS ERROR CORRECTION
   * Automatically fixes common agent mistakes
   */
  async autonomousErrorCorrection(agentId: string, operation: any, error: any): Promise<{
    corrected: boolean;
    newOperation?: any;
    explanation: string;
  }> {
    console.log(`🔧 AUTONOMOUS CORRECTION: Fixing error for ${agentId}`);

    // Record the error for learning
    await errorPrevention.recordError(operation, error, `agent_${agentId}`);

    // Attempt auto-correction
    const correction = await errorPrevention.autoCorrectOperation(operation);

    if (correction.corrected) {
      return {
        corrected: true,
        newOperation: correction.operation,
        explanation: `Auto-corrected: ${correction.changes.join(', ')}`
      };
    }

    // If auto-correction failed, provide intelligent suggestions
    const validation = await errorPrevention.validateOperation({
      operation,
      context: 'error_recovery',
      agentType: agentId
    });

    return {
      corrected: false,
      explanation: `Error correction suggestions: ${validation.suggestions.join(', ')}`
    };
  }

  /**
   * AUTONOMOUS WORKSPACE AWARENESS
   * Provides agents with complete workspace understanding
   */
  async getAutonomousWorkspaceAwareness(agentId: string): Promise<{
    projectStructure: any;
    relevantFiles: string[];
    recentChanges: string[];
    agentCapabilities: string[];
    recommendations: string[];
  }> {
    console.log(`🧠 AUTONOMOUS AWARENESS: Building workspace context for ${agentId}`);

    const [
      projectContext,
      workspaceState,
      agentState
    ] = await Promise.all([
      unifiedWorkspace.buildProjectContext(),
      autonomousNavigation.getWorkspaceState(),
      unifiedState.registerAgent(agentId, 'workspace_awareness')
    ]);

    return {
      projectStructure: projectContext.structure,
      relevantFiles: workspaceState.recentFiles,
      recentChanges: projectContext.recentChanges || [],
      agentCapabilities: agentState.workContext.suggestedActions.map(a => a.action),
      recommendations: workspaceState.recommendations
    };
  }

  /**
   * ZERO-COST OPERATION EXECUTOR
   * Executes operations without any API costs
   */
  async executeZeroCostOperation(
    agentId: string,
    operation: any,
    context: string
  ): Promise<WorkspaceOperation> {
    console.log(`💰 ZERO-COST EXECUTOR: ${agentId} executing ${operation.command} (NO API COSTS)`);

    // Validate and coordinate
    const coordination = await unifiedState.coordinateOperation(agentId, operation, context);
    
    if (!coordination.approved) {
      return {
        type: 'file_write',
        path: operation.path,
        success: false,
        error: `Operation not approved: ${coordination.conflicts.join(', ')}`,
        costOptimized: true
      };
    }

    // Execute directly through unified workspace
    const result = await unifiedWorkspace.executeFileOperation(
      operation.command,
      operation.path,
      operation
    );

    // The operation was executed without any API costs
    console.log('✅ ZERO-COST OPERATION COMPLETED: Direct workspace access used');

    return result;
  }

  // PRIVATE HELPER METHODS

  private generateAutonomousResponse(
    request: AutonomousAgentRequest,
    workContext: AgentWorkContext,
    navigationResults: NavigationResult,
    fileOperations: WorkspaceOperation[],
    validationResults: ValidationResult[]
  ): string {
    const agentName = this.getAgentDisplayName(request.agentId);
    const operationCount = fileOperations.filter(op => op.success).length;
    const discoveredCount = navigationResults.discoveredFiles.length;

    let response = `**${agentName.toUpperCase()} HERE!** 🔥\n\n`;
    
    response += `Autonomous processing completed for: "${request.message}"\n\n`;

    if (discoveredCount > 0) {
      response += `🎯 **Autonomous File Discovery:** Found ${discoveredCount} relevant files\n`;
      response += `📁 **Key Files:** ${navigationResults.discoveredFiles.slice(0, 3).join(', ')}\n\n`;
    }

    if (operationCount > 0) {
      response += `🔧 **Operations Completed:** ${operationCount} file operations (ZERO API COSTS)\n`;
      
      const successfulOps = fileOperations.filter(op => op.success);
      if (successfulOps.length > 0) {
        response += `✅ **Files Modified:** ${successfulOps.map(op => op.path).join(', ')}\n\n`;
      }
    }

    if (workContext.suggestedActions.length > 0) {
      response += `💡 **Autonomous Recommendations:**\n`;
      workContext.suggestedActions.forEach((action, index) => {
        response += `${index + 1}. ${action.action.toUpperCase()}: ${action.reason}\n`;
      });
      response += '\n';
    }

    if (navigationResults.errorPrevention.length > 0) {
      response += `🛡️ **Error Prevention:** ${navigationResults.errorPrevention[0]}\n\n`;
    }

    response += `**💰 COST OPTIMIZATION:** All operations executed with ZERO API costs through direct workspace integration\n`;
    response += `**🎯 AUTONOMOUS STATUS:** Full workspace awareness and intelligent navigation active`;

    return response;
  }

  private getAgentDisplayName(agentId: string): string {
    const displayNames: Record<string, string> = {
      elena: 'Elena',
      zara: 'Zara',
      maya: 'Maya',
      victoria: 'Victoria',
      diana: 'Diana',
      aria: 'Aria',
      ava: 'Ava',
      quinn: 'Quinn',
      rachel: 'Rachel',
      sophia: 'Sophia',
      martha: 'Martha',
      wilma: 'Wilma',
      olga: 'Olga'
    };

    return displayNames[agentId] || agentId.charAt(0).toUpperCase() + agentId.slice(1);
  }
}

// Export singleton instance
export const autonomousAgent = AutonomousAgentIntegration.getInstance();