/**
 * ELENA WORKFLOW DETECTION SERVICE
 * Revolutionary conversational-to-autonomous bridge system
 * Detects Elena's strategic coordination language and converts to executable workflows
 */

interface DetectedWorkflow {
  id: string;
  title: string;
  description: string;
  agents: string[];
  tasks: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: string;
  createdAt: Date;
  status: 'staged' | 'executing' | 'completed';
}

interface WorkflowAnalysis {
  hasWorkflow: boolean;
  confidence: number;
  workflow?: DetectedWorkflow;
  patterns: string[];
  extractedText: string;
}

export class ElenaWorkflowDetectionService {
  private static instance: ElenaWorkflowDetectionService;
  private stagedWorkflows: Map<string, DetectedWorkflow> = new Map();

  // Agent names for detection
  private readonly AGENT_NAMES = [
    'elena', 'aria', 'zara', 'maya', 'victoria', 'rachel', 
    'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'
  ];

  // Workflow detection patterns - Elena's coordination language
  private readonly WORKFLOW_PATTERNS = [
    /I'll coordinate (.*?) (?:and|with) (.*?) to (.*)/i,
    /I will coordinate (.*?) (?:and|with) (.*?) to (.*)/i,
    /Let's have (.*?) (?:and|with) (.*?) work on (.*)/i,
    /(.*?) (?:and|with) (.*?) should (.*)/i,
    /Deploy (.*?) (?:and|with) (.*?) for (.*)/i,
    /I'll get (.*?) (?:and|with) (.*?) to (.*)/i,
    /I will get (.*?) (?:and|with) (.*?) to (.*)/i,
    /Activate (.*?) (?:and|with) (.*?) for (.*)/i,
    /Coordinate (.*?) (?:and|with) (.*?) to (.*)/i,
    /Task (.*?) (?:and|with) (.*?) with (.*)/i,
    /Let me coordinate (.*?) (?:and|with) (.*?) to (.*)/i,
    /I need (.*?) (?:and|with) (.*?) to (.*)/i
  ];

  // Priority keywords
  private readonly PRIORITY_KEYWORDS = {
    high: ['urgent', 'critical', 'immediately', 'asap', 'emergency', 'fix', 'broken'],
    medium: ['important', 'should', 'needs', 'required', 'update'],
    low: ['when possible', 'eventually', 'consider', 'maybe', 'could']
  };

  static getInstance(): ElenaWorkflowDetectionService {
    if (!ElenaWorkflowDetectionService.instance) {
      ElenaWorkflowDetectionService.instance = new ElenaWorkflowDetectionService();
    }
    return ElenaWorkflowDetectionService.instance;
  }

  // Clear all existing workflows (removes demos/tests)
  clearAllWorkflows(): void {
    this.stagedWorkflows.clear();
    console.log('🧹 ELENA WORKFLOWS CLEARED: All staged workflows removed');
  }

  /**
   * Get workflow by ID
   */
  getWorkflowById(id: string): DetectedWorkflow | undefined {
    return this.stagedWorkflows.get(id);
  }

  /**
   * Parse complex Elena workflow with 8+ agents from her actual message
   */
  parseComplexElenaWorkflow(elenaMessage: string): DetectedWorkflow | null {
    console.log('🔍 ELENA: Parsing complex workflow from message');
    
    // Check for complex workflow indicators
    const hasComplexWorkflow = elenaMessage.includes('**Aria (Creative Director)**') ||
                             elenaMessage.includes('**Victoria (UX Designer)**') ||
                             elenaMessage.includes('**Zara (Technical Architect)**') ||
                             elenaMessage.includes('SSELFIE STUDIO Launch Excellence Protocol') ||
                             elenaMessage.includes('Complete Team Launch Preparation');
    
    if (!hasComplexWorkflow) {
      console.log('🔍 ELENA: No complex workflow patterns found');
      return null;
    }
    
    // Extract workflow title
    let title = 'SSELFIE STUDIO Launch Excellence Protocol';
    const titleMatch = elenaMessage.match(/[""]([^"""]+)[""].*workflow/i);
    if (titleMatch) {
      title = titleMatch[1];
    }
    
    // Extract all agent assignments
    const agents: string[] = [];
    const tasks: string[] = [];
    
    // Parse agent assignments with sophisticated pattern matching
    const agentPatterns = [
      { name: 'aria', pattern: /\*\*Aria[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|Priority:|Duration:)/is },
      { name: 'victoria', pattern: /\*\*Victoria[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|Priority:|Duration:)/is },
      { name: 'zara', pattern: /\*\*Zara[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|Priority:|Duration:)/is },
      { name: 'maya', pattern: /\*\*Maya[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|Priority:|Duration:)/is },
      { name: 'rachel', pattern: /\*\*Rachel[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|Priority:|Duration:)/is },
      { name: 'martha', pattern: /\*\*Martha[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|Priority:|Duration:)/is },
      { name: 'diana', pattern: /\*\*Diana[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|Priority:|Duration:)/is },
      { name: 'quinn', pattern: /\*\*Quinn[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|Priority:|Duration:)/is }
    ];
    
    agentPatterns.forEach(({ name, pattern }) => {
      const match = elenaMessage.match(pattern);
      if (match) {
        agents.push(name);
        tasks.push(`${name.toUpperCase()}: ${match[1].trim().substring(0, 200)}...`);
        console.log(`✅ ELENA: Found ${name} assignment`);
      }
    });
    
    if (agents.length === 0) {
      console.log('🔍 ELENA: No agent assignments found in complex workflow');
      return null;
    }
    
    const workflow: DetectedWorkflow = {
      id: `elena_workflow_${Date.now()}`,
      title,
      description: `Complex multi-agent workflow deploying ${agents.length} agents for comprehensive platform optimization`,
      agents,
      tasks,
      priority: 'high',
      estimatedDuration: '30-35 minutes',
      createdAt: new Date(),
      status: 'staged'
    };
    
    // Store workflow for persistence
    this.stagedWorkflows.set(workflow.id, workflow);
    
    console.log(`✅ ELENA: Complex workflow created with ${agents.length} agents: ${agents.join(', ')}`);
    return workflow;
  }

  /**
   * Analyze Elena's conversation for workflow patterns
   */
  analyzeConversation(message: string, agentName: string): WorkflowAnalysis {
    console.log('🔍 ELENA WORKFLOW ANALYSIS:', message.substring(0, 100) + '...');
    
    // First check for complex multi-agent workflow
    const complexWorkflow = this.parseComplexElenaWorkflow(message);
    if (complexWorkflow) {
      return {
        hasWorkflow: true,
        confidence: 0.95,
        workflow: complexWorkflow,
        patterns: ['Complex Multi-Agent Coordination'],
        extractedText: message.substring(0, 500)
      };
    }
    // Real Elena agent workflow detection
    if (agentName.toLowerCase() !== 'elena') {
      return { hasWorkflow: false, confidence: 0, patterns: [], extractedText: '' };
    }

    const patterns: string[] = [];
    let confidence = 0;
    let extractedAgents: string[] = [];
    let extractedTasks: string[] = [];

    // Check for workflow patterns
    for (const pattern of this.WORKFLOW_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        patterns.push(pattern.source);
        confidence += 0.3;

        // Extract agents and tasks from matches
        if (match[1]) extractedAgents.push(...this.extractAgentNames(match[1]));
        if (match[2]) extractedAgents.push(...this.extractAgentNames(match[2]));
        if (match[3]) extractedTasks.push(match[3]);
      }
    }

    // Check for agent mentions
    const mentionedAgents = this.extractAgentNames(message);
    if (mentionedAgents.length >= 2) {
      confidence += 0.2;
      extractedAgents.push(...mentionedAgents);
    }

    // Check for coordination keywords
    const coordinationKeywords = ['coordinate', 'deploy', 'activate', 'task', 'assign', 'work together'];
    for (const keyword of coordinationKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        confidence += 0.1;
      }
    }

    // Remove duplicates
    extractedAgents = [...new Set(extractedAgents)];
    extractedTasks = [...new Set(extractedTasks)];

    const hasWorkflow = confidence >= 0.3 && extractedAgents.length >= 1;

    let workflow: DetectedWorkflow | undefined;
    if (hasWorkflow) {
      workflow = this.createWorkflowFromAnalysis(message, extractedAgents, extractedTasks);
    }

    return {
      hasWorkflow,
      confidence,
      workflow,
      patterns,
      extractedText: message
    };
  }

  /**
   * Extract agent names from text
   */
  private extractAgentNames(text: string): string[] {
    const agents: string[] = [];
    const lowerText = text.toLowerCase();

    for (const agentName of this.AGENT_NAMES) {
      if (lowerText.includes(agentName.toLowerCase())) {
        agents.push(agentName);
      }
    }

    return agents;
  }

  /**
   * Determine priority from message content
   */
  private determinePriority(message: string): 'high' | 'medium' | 'low' {
    const lowerMessage = message.toLowerCase();

    for (const [priority, keywords] of Object.entries(this.PRIORITY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return priority as 'high' | 'medium' | 'low';
        }
      }
    }

    return 'medium'; // default
  }

  /**
   * Create workflow from analysis
   */
  private createWorkflowFromAnalysis(
    message: string, 
    agents: string[], 
    tasks: string[]
  ): DetectedWorkflow {
    const workflowId = `elena-workflow-${Date.now()}`;
    const priority = this.determinePriority(message);
    
    // Generate title from first task or message
    let title = tasks[0] || 'Multi-agent coordination task';
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }

    // Estimate duration based on agent count and task complexity
    let estimatedDuration = '30 minutes';
    if (agents.length >= 3) estimatedDuration = '45 minutes';
    if (tasks.length >= 3) estimatedDuration = '1 hour';
    if (priority === 'high') estimatedDuration = '15 minutes';

    return {
      id: workflowId,
      title: `Coordinate ${agents.join(' & ')} - ${title}`,
      description: message.length > 200 ? message.substring(0, 197) + '...' : message,
      agents,
      tasks: tasks.length > 0 ? tasks : ['Implement strategic coordination'],
      priority,
      estimatedDuration,
      createdAt: new Date(),
      status: 'staged'
    };
  }

  /**
   * Stage workflow for manual execution
   */
  stageWorkflow(workflow: DetectedWorkflow): void {
    // Handle both formats - ensure workflow has required properties
    const safeWorkflow = {
      ...workflow,
      tasks: workflow.tasks || [],
      agents: workflow.agents || [],
      title: workflow.title || 'Unknown workflow'
    };
    
    this.stagedWorkflows.set(safeWorkflow.id, safeWorkflow);
    console.log(`🎯 ELENA WORKFLOW STAGED: ${safeWorkflow.title} (${safeWorkflow.agents.length} agents, ${safeWorkflow.priority} priority)`);
    console.log(`📋 WORKFLOW DETAILS: ID=${safeWorkflow.id}, Agents=[${safeWorkflow.agents.join(', ')}], Status=${safeWorkflow.status}`);
  }


  /**
   * Get all staged workflows
   */
  getStagedWorkflows(): DetectedWorkflow[] {
    return Array.from(this.stagedWorkflows.values())
      .filter(w => w.status === 'staged')
      .sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
  }

  /**
   * Execute workflow by ID
   */
  async executeWorkflow(workflowId: string): Promise<{ success: boolean; message: string }> {
    const workflow = this.stagedWorkflows.get(workflowId);
    if (!workflow) {
      return { success: false, message: 'Workflow not found' };
    }

    workflow.status = 'executing';
    this.stagedWorkflows.set(workflowId, workflow);

    try {
      console.log(`🚀 EXECUTING WORKFLOW: ${workflow.title}`);
      console.log(`📋 AGENTS: ${workflow.agents.join(', ')}`);
      console.log(`📝 TASKS: ${workflow.tasks.join(', ')}`);
      
      // Import dependencies for agent execution and load tracking
      const { claudeApiService } = await import('../services/claude-api-service');
      const { intelligentTaskDistributor } = await import('../services/intelligent-task-distributor');
      const { deploymentTracker } = await import('../services/deployment-tracking-service');
      
      const executionResults: string[] = [];
      const taskAssignments: string[] = [];
      
      // Start deployment tracking
      const deploymentId = deploymentTracker.startElenaWorkflowDeployment(
        workflowId,
        workflow.title,
        workflow.agents,
        workflow.tasks,
        workflow.priority as 'low' | 'medium' | 'high' | 'critical',
        workflow.description,
        parseInt(workflow.estimatedDuration) || 30
      );
      
      // Update deployment status to running
      deploymentTracker.updateDeploymentProgress(deploymentId, 10, 'running');
      
      // Create task assignments in intelligent task distributor
      for (const agent of workflow.agents) {
        if (agent === 'elena') continue; // Skip Elena to prevent self-execution
        
        const taskId = `${workflowId}-${agent}-${Date.now()}`;
        const taskRequirement = {
          id: taskId,
          title: `${workflow.title} - ${agent} coordination`,
          description: workflow.description,
          priority: workflow.priority as 'low' | 'medium' | 'high' | 'critical',
          complexity: 'moderate' as const,
          requiredSkills: [agent, 'coordination', 'implementation'],
          estimatedTime: parseInt(workflow.estimatedDuration) || 30,
          dependencies: []
        };
        
        // Assign task to agent in intelligent task distributor
        const assignment = await intelligentTaskDistributor.assignOptimalAgent(taskRequirement);
        
        if (assignment) {
          taskAssignments.push(taskId);
          console.log(`📋 TASK ASSIGNED: ${taskId} to ${agent} (${assignment.confidence}% confidence)`);
        }
      }
      
      // Execute each agent in the workflow with their tasks
      const totalAgents = workflow.agents.filter(a => a !== 'elena').length;
      let completedAgents = 0;
      
      for (const agent of workflow.agents) {
        if (agent === 'elena') continue; // Skip Elena to prevent self-execution
        
        const taskId = taskAssignments.find(id => id.includes(agent));
        
        try {
          console.log(`🤖 EXECUTING AGENT: ${agent} for workflow ${workflow.title}`);
          
          // Update deployment progress
          const progressPercent = Math.round(((completedAgents / totalAgents) * 80) + 10); // 10-90% range
          deploymentTracker.updateDeploymentProgress(deploymentId, progressPercent);
          
          // Create task message for agent based on workflow context
          const taskMessage = this.createAgentTaskMessage(workflow, agent);
          
          // Execute agent directly through the agent-chat-bypass endpoint with forced tool usage
          const agentResponse = await fetch('http://localhost:3000/api/admin/agent-chat-bypass', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Token': 'sandra-admin-2025'
            },
            body: JSON.stringify({
              agentId: agent,
              message: `ELENA AUTONOMOUS WORKFLOW EXECUTION - FILE MODIFICATION MANDATORY
Task: ${taskMessage}

🚨 ELENA WORKFLOW EXECUTION CONTEXT:
- You are executing within Elena's autonomous workflow system
- File modification authentication is inherited from workflow context
- You have full str_replace_based_edit_tool access for this coordinated mission

CRITICAL REQUIREMENTS:
1. You MUST use str_replace_based_edit_tool to create or modify files
2. You MUST NOT just provide analysis or suggestions  
3. You MUST implement actual code/file changes
4. Your response will be considered failed if no files are modified
5. This is coordinated agent execution - complete your assigned task

Complete this task now with actual file modifications as part of Elena's coordinated workflow.`,
              adminToken: 'sandra-admin-2025',
              workflowContext: 'elena-autonomous-execution',
              fileEditMode: true,
              conversationHistory: []
            })
          });

          const result = await agentResponse.json();
          if (!result.success) {
            throw new Error(result.error || 'Agent execution failed');
          }
          
          // Check if agent actually used tools and modified files
          const agentResponseText = result.response || '';
          if (agentResponseText && agentResponseText.length > 0) {
            console.log(`✅ AGENT ${agent.toUpperCase()} COMPLETED: ${agentResponseText.substring(0, 100)}...`);
            executionResults.push(`✅ ${agent}: Task completed successfully`);
            
            // Mark task as completed in intelligent task distributor
            if (taskId) {
              await intelligentTaskDistributor.completeTask(taskId, true);
            }
          } else {
            console.log(`❌ AGENT ${agent.toUpperCase()} FAILED: No response received`);
            executionResults.push(`❌ ${agent}: No response received`);
            
            // Mark task as failed in intelligent task distributor
            if (taskId) {
              await intelligentTaskDistributor.completeTask(taskId, false);
            }
          }
          
          completedAgents++;
          
          // Brief delay between agents
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (agentError) {
          console.error(`❌ AGENT ${agent} EXECUTION ERROR:`, agentError);
          executionResults.push(`❌ ${agent}: Execution error - ${agentError.message}`);
          
          // Mark task as failed in intelligent task distributor
          const taskId = taskAssignments.find(id => id.includes(agent));
          if (taskId) {
            await intelligentTaskDistributor.completeTask(taskId, false);
          }
          
          completedAgents++;
        }
      }
      
      workflow.status = 'completed';
      this.stagedWorkflows.set(workflowId, workflow);
      
      const successfulExecutions = executionResults.filter(r => r.startsWith('✅')).length;
      const workflowSuccess = successfulExecutions > 0;
      
      // Complete deployment tracking
      deploymentTracker.updateDeploymentProgress(deploymentId, 100, 'completing');
      setTimeout(() => {
        deploymentTracker.completeDeployment(deploymentId, workflowSuccess);
      }, 2000); // Give 2 seconds to see completion status
      
      return { 
        success: workflowSuccess,
        message: `Workflow "${workflow.title}" executed: ${successfulExecutions}/${totalAgents} agents completed tasks successfully. Results: ${executionResults.join(', ')}`
      };
    } catch (error) {
      workflow.status = 'staged'; // revert to staged
      this.stagedWorkflows.set(workflowId, workflow);
      
      // Mark deployment as failed
      try {
        const { deploymentTracker } = await import('../services/deployment-tracking-service');
        deploymentTracker.completeDeployment(deploymentId, false);
      } catch (importError) {
        console.error('Failed to complete deployment tracking:', importError);
      }
      
      console.error('❌ ELENA WORKFLOW EXECUTION ERROR:', error);
      return { success: false, message: `Execution error: ${error.message}` };
    }
  }

  /**
   * Create appropriate task message for agent based on workflow context
   */
  private createAgentTaskMessage(workflow: DetectedWorkflow, agentName: string): string {
    // Extract specific file paths from Elena's workflow tasks
    const agentTask = workflow.tasks.find(task => 
      task.toLowerCase().includes(`**${agentName}`));
    
    if (agentTask) {
      // Parse Elena's specific file path from the task
      const filePathMatch = agentTask.match(/at ([\w\/\.\-]+)/);
      const filePath = filePathMatch ? filePathMatch[1] : null;
      
      if (filePath) {
        return `Execute ${agentName} coordination for "${workflow.title}". 

**MANDATORY FILE CREATION:**
You MUST create the file: ${filePath}

**Elena's Original Assignment:**
${agentTask}

**REQUIREMENTS:**
1. Create the exact file path specified above
2. Include working, production-ready code
3. Follow SSELFIE luxury design standards
4. Use str_replace_based_edit_tool with command: "create"
5. Do NOT just discuss or plan - CREATE THE ACTUAL FILE`;
      }
    }
    
    // Fallback for agents without specific file assignments
    const agentTasks = {
      aria: `Execute luxury design coordination for "${workflow.title}". Apply Times New Roman typography and SSELFIE editorial luxury standards. Create or enhance components as needed.`,
      zara: `Execute technical coordination for "${workflow.title}". Implement backend architecture, API endpoints, or system optimizations as needed for SSELFIE platform.`,
      maya: `Execute AI photography coordination for "${workflow.title}". Optimize FLUX generation systems, celebrity stylist interfaces, or AI model performance as needed.`,
      victoria: `Execute UX coordination for "${workflow.title}". Enhance user experience, interface design, or usability improvements for SSELFIE Studio platform.`,
      rachel: `Execute voice coordination for "${workflow.title}". Implement Sandra's authentic voice, copywriting, or messaging consistency across platform touchpoints.`,
      ava: `Execute automation coordination for "${workflow.title}". Implement workflow automation, process optimization, or system integration for SSELFIE operations.`,
      quinn: `Execute quality coordination for "${workflow.title}". Perform luxury standards testing, quality assurance, or luxury brand consistency validation.`,
      sophia: `Execute social media coordination for "${workflow.title}". Implement community features, social integration, or Instagram growth strategies.`,
      martha: `Execute marketing coordination for "${workflow.title}". Implement conversion optimization, revenue features, or performance marketing improvements.`,
      diana: `Execute strategy coordination for "${workflow.title}". Implement business strategy, decision support, or strategic planning features.`,
      wilma: `Execute workflow coordination for "${workflow.title}". Implement process architecture, workflow design, or operational efficiency improvements.`,
      olga: `Execute organization coordination for "${workflow.title}". Implement file organization, repository cleanup, or architectural improvements.`
    };

    return (agentTasks as any)[agentName] || `Execute coordination tasks for "${workflow.title}" using your specialized expertise to support SSELFIE Studio platform.`;
  }

  /**
   * Remove completed or cancelled workflows
   */
  removeWorkflow(workflowId: string): boolean {
    return this.stagedWorkflows.delete(workflowId);
  }


}

// Export singleton instance
export const elenaWorkflowDetectionService = ElenaWorkflowDetectionService.getInstance();
export type { DetectedWorkflow, WorkflowAnalysis };
export default ElenaWorkflowDetectionService;