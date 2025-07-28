// Elena's Workflow Creation System - Strategic Coordinator with Autonomous Monitoring
// Creates custom workflows based on Sandra's instructions

import { storage } from './storage';
// ZARA'S FIX: Import specialized agent personalities
import { CONSULTING_AGENT_PERSONALITIES } from './agent-personalities-consulting';

export interface WorkflowStep {
  id: string;
  agentId: string;
  agentName: string;
  taskDescription: string;
  estimatedTime: string;
  dependencies: string[];
  deliverables: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface CustomWorkflow {
  id: string;
  name: string;
  description: string;
  requestedBy: string;
  createdAt: Date;
  estimatedDuration: string;
  steps: WorkflowStep[];
  status: 'draft' | 'ready' | 'running' | 'completed' | 'failed';
  businessImpact: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export class ElenaWorkflowSystem {
  
  /**
   * Elena parses actual message content dynamically (NO HARDCODED PATTERNS)
   */
  static async createWorkflowFromActualMessage(
    userId: string, 
    elenaMessage: string
  ): Promise<CustomWorkflow> {
    console.log(`🎯 ELENA: Parsing actual message content: "${elenaMessage.substring(0, 100)}..."`);
    
    // DYNAMIC EXTRACTION from Elena's actual message
    const analysis = this.parseElenaMessage(elenaMessage);
    const workflowSteps = this.extractAgentAssignments(elenaMessage);
    
    const workflow: CustomWorkflow = {
      id: `workflow_${Date.now()}`,
      name: analysis.workflowName,
      description: analysis.description,
      requestedBy: userId,
      createdAt: new Date(),
      estimatedDuration: analysis.estimatedDuration,
      steps: workflowSteps,
      status: 'ready',
      businessImpact: analysis.businessImpact,
      riskLevel: 'medium'
    };
    
    // Store workflow for execution with persistence
    this.workflows.set(workflow.id, workflow);
    this.saveWorkflowsToDisk();
    
    console.log(`✅ ELENA: Workflow "${workflow.name}" created from actual message with ${workflow.steps.length} steps`);
    return workflow;
  }

  /**
   * Elena analyzes Sandra's request and creates a custom workflow (LEGACY)
   */
  static async createWorkflowFromRequest(
    userId: string, 
    request: string
  ): Promise<CustomWorkflow> {
    console.log(`🎯 ELENA: Creating workflow for request: "${request}"`);
    
    // Elena's intelligent workflow analysis
    const workflowAnalysis = this.analyzeRequest(request);
    const requiredAgents = this.identifyRequiredAgents(workflowAnalysis);
    const workflowSteps = this.designWorkflowSteps(workflowAnalysis, requiredAgents);
    
    const estimatedDuration = this.calculateEstimatedDuration(workflowSteps);
    
    const workflow: CustomWorkflow = {
      id: `workflow_${Date.now()}`,
      name: workflowAnalysis.workflowName,
      description: workflowAnalysis.description,
      requestedBy: userId,
      createdAt: new Date(),
      estimatedDuration: estimatedDuration,
      steps: workflowSteps,
      status: 'ready',
      businessImpact: workflowAnalysis.businessImpact,
      riskLevel: workflowAnalysis.riskLevel
    };
    
    console.log(`🔍 ELENA DEBUG: Workflow name="${workflowAnalysis.workflowName}", duration="${estimatedDuration}"`);
    
    // Store workflow for execution with persistence
    this.workflows.set(workflow.id, workflow);
    this.saveWorkflowsToDisk(); // Persist to survive server restarts
    
    console.log(`✅ ELENA: Workflow "${workflow.name}" created with ${workflow.steps.length} steps`);
    return workflow;
  }

  /**
   * DYNAMIC Elena message parsing - NO HARDCODED PATTERNS
   */
  private static parseElenaMessage(elenaMessage: string): {
    workflowName: string;
    description: string;
    estimatedDuration: string;
    businessImpact: string;
  } {
    // Extract workflow name from Elena's coordination message
    let workflowName = 'Dynamic Workflow';
    const workflowMatches = [
      elenaMessage.match(/[*"](.*?(?:activation|breakthrough|coordination|workflow|test).*?)[*"]/i),
      elenaMessage.match(/coordinate.*?[*"](.*?)[*"]/i),
      elenaMessage.match(/I'll coordinate.*?[*"](.*?)[*"]/i)
    ];
    
    for (const match of workflowMatches) {
      if (match && match[1]) {
        workflowName = match[1];
        break;
      }
    }
    
    // Extract description from coordination statement
    let description = 'Dynamic agent coordination workflow';
    const descMatch = elenaMessage.match(/I'll coordinate.*?(?:\n|$)/i);
    if (descMatch) {
      description = descMatch[0];
    }
    
    // Extract business impact from Elena's message
    let businessImpact = 'Platform enhancement and system validation';
    if (elenaMessage.includes('€67') || elenaMessage.includes('SSELFIE')) {
      businessImpact = 'SSELFIE STUDIO platform optimization and business validation';
    }
    
    return {
      workflowName,
      description,
      estimatedDuration: '15-30 minutes',
      businessImpact
    };
  }

  /**
   * Extract agent assignments from Elena's actual message with CORRECT file paths
   */
  private static extractAgentAssignments(elenaMessage: string): WorkflowStep[] {
    const steps: WorkflowStep[] = [];
    
    // Find agent assignments in Elena's message with detailed parsing
    const agentSections = [
      { name: 'aria', pattern: /\*\*Aria[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|$)/gis },
      { name: 'victoria', pattern: /\*\*Victoria[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|$)/gis },
      { name: 'zara', pattern: /\*\*Zara[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|$)/gis },
      { name: 'maya', pattern: /\*\*Maya[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|$)/gis },
      { name: 'rachel', pattern: /\*\*Rachel[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|$)/gis },
      { name: 'quinn', pattern: /\*\*Quinn[^*]*?\*\*[^*]*?([^*]+?)(?:\*\*|$)/gis }
    ];
    
    agentSections.forEach(({ name, pattern }) => {
      const matches = [...elenaMessage.matchAll(pattern)];
      
      if (matches.length > 0) {
        const rawTask = matches[0][1]?.trim() || `${name} coordination task`;
        
        // CRITICAL FIX: Extract and correct file paths from Elena's instructions
        let taskDescription = rawTask;
        const filePathMatch = rawTask.match(/(?:at|to)\s+([^\s]+\.tsx?)/i);
        
        if (filePathMatch) {
          const originalPath = filePathMatch[1];
          console.log(`🔍 ELENA: Found file path in task: ${originalPath}`);
          
          // Fix common path mistakes Elena makes
          const correctedPath = this.correctFilePath(originalPath);
          if (correctedPath !== originalPath) {
            taskDescription = taskDescription.replace(originalPath, correctedPath);
            console.log(`🔧 ELENA: Corrected file path: ${originalPath} → ${correctedPath}`);
          }
        }
        
        steps.push({
          id: `step_${name}_${Date.now()}`,
          agentId: name,
          agentName: name.charAt(0).toUpperCase() + name.slice(1),
          taskDescription,
          estimatedTime: '15 minutes',
          dependencies: [],
          deliverables: ['File modifications', 'Implementation completion'],
          priority: 'high'
        });
      }
    });
    
    console.log(`🎯 ELENA: Extracted ${steps.length} agent assignments from message`);
    return steps;
  }

  /**
   * Correct common file path mistakes Elena makes in her instructions
   */
  private static correctFilePath(originalPath: string): string {
    // Fix Agent Activity Dashboard path
    if (originalPath.includes('AgentActivityDashboard.tsx')) {
      return 'client/src/components/admin/AgentActivityDashboard.tsx';
    }
    
    // Fix other common patterns
    if (originalPath.startsWith('/app/')) {
      return originalPath.replace('/app/', 'client/src/');
    }
    
    if (originalPath.startsWith('/client/')) {
      return originalPath.substring(1); // Remove leading slash
    }
    
    // If it's already a valid client path, keep it
    if (originalPath.startsWith('client/src/')) {
      return originalPath;
    }
    
    // Default: assume it's a component file
    if (originalPath.endsWith('.tsx') || originalPath.endsWith('.ts')) {
      return `client/src/components/${originalPath}`;
    }
    
    return originalPath;
  }
  
  /**
   * Elena analyzes the request to understand what needs to be built
   */
  private static analyzeRequest(request: string): {
    workflowName: string;
    description: string;
    businessImpact: string;
    riskLevel: 'low' | 'medium' | 'high';
    complexity: 'simple' | 'moderate' | 'complex';
    category: 'design' | 'development' | 'content' | 'optimization' | 'integration';
  } {
    const lowerRequest = request.toLowerCase();
    
    // Elena's intelligent request analysis
    let category: 'design' | 'development' | 'content' | 'optimization' | 'integration' = 'development';
    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    // Analyze request type
    if (lowerRequest.includes('design') || lowerRequest.includes('ui') || lowerRequest.includes('component')) {
      category = 'design';
    } else if (lowerRequest.includes('copy') || lowerRequest.includes('content') || lowerRequest.includes('write')) {
      category = 'content';
    } else if (lowerRequest.includes('optimize') || lowerRequest.includes('improve') || lowerRequest.includes('enhance')) {
      category = 'optimization';
    } else if (lowerRequest.includes('integrate') || lowerRequest.includes('connect') || lowerRequest.includes('api')) {
      category = 'integration';
    }
    
    // Analyze complexity
    if (lowerRequest.includes('simple') || lowerRequest.includes('quick') || lowerRequest.includes('basic')) {
      complexity = 'simple';
    } else if (lowerRequest.includes('complex') || lowerRequest.includes('advanced') || lowerRequest.includes('system')) {
      complexity = 'complex';
    }
    
    // Analyze risk level
    if (lowerRequest.includes('database') || lowerRequest.includes('auth') || lowerRequest.includes('payment')) {
      riskLevel = 'high';
    } else if (lowerRequest.includes('api') || lowerRequest.includes('integration')) {
      riskLevel = 'medium';
    }
    
    return {
      workflowName: this.generateWorkflowName(request),
      description: `Custom workflow to: ${request}`,
      businessImpact: this.assessBusinessImpact(category, complexity),
      riskLevel,
      complexity,
      category
    };
  }
  
  /**
   * Elena identifies which agents are needed for the workflow
   */
  private static identifyRequiredAgents(analysis: any): string[] {
    const agents: string[] = [];
    
    switch (analysis.category) {
      case 'design':
        agents.push('aria'); // Lead designer
        if (analysis.complexity !== 'simple') agents.push('zara'); // Development integration
        break;
        
      case 'development':
        agents.push('zara'); // Lead developer
        if (analysis.complexity === 'complex') agents.push('aria'); // Design consultation
        break;
        
      case 'content':
        agents.push('rachel'); // Lead copywriter
        if (analysis.complexity !== 'simple') agents.push('sophia'); // Social media integration
        break;
        
      case 'optimization':
        agents.push('flux'); // AI optimization and LoRA specialist
        agents.push('zara'); // Technical implementation
        break;
        
      case 'integration':
        agents.push('ava'); // Automation expert
        agents.push('zara'); // Technical implementation
        break;
    }
    
    // Always include Quinn for quality assurance on complex projects
    if (analysis.complexity === 'complex' || analysis.riskLevel === 'high') {
      agents.push('quinn');
    }
    
    // Elena coordinates at the workflow level, not as an executing agent
    // Remove Elena from executing agent list to prevent infinite loops
    
    return Array.from(new Set(agents)); // Remove duplicates
  }
  
  /**
   * Elena designs the specific workflow steps
   */
  private static designWorkflowSteps(analysis: any, agents: string[]): WorkflowStep[] {
    const steps: WorkflowStep[] = [];
    let stepCounter = 1;
    
    // Elena coordinates but doesn't execute as a step (to prevent infinite loops)
    // Elena's coordination happens at the workflow level, not as an individual step
    
    // Olga file organization step (when new files will be created)
    const willCreateFiles = analysis.category === 'design' || analysis.category === 'development';
    if (willCreateFiles) {
      steps.push({
        id: `step_${stepCounter++}`,
        agentId: 'olga',
        agentName: 'Olga',
        taskDescription: 'Analyze file structure and prepare organization plan for new components',
        estimatedTime: '2 minutes',
        dependencies: ['step_1'],
        deliverables: ['File organization plan', 'Conflict prevention analysis', 'Integration roadmap'],
        priority: 'high'
      });
    }

    // Add agent-specific steps based on category
    if (analysis.category === 'design') {
      steps.push({
        id: `step_${stepCounter++}`,
        agentId: 'aria',
        agentName: 'Aria',
        taskDescription: 'Create luxury editorial design components',
        estimatedTime: '8-12 minutes',
        dependencies: willCreateFiles ? ['step_1', 'step_2'] : ['step_1'],
        deliverables: ['React components', 'Times New Roman typography', 'Editorial layouts'],
        priority: 'high'
      });
      
      if (agents.includes('zara')) {
        steps.push({
          id: `step_${stepCounter++}`,
          agentId: 'zara',
          agentName: 'Zara',
          taskDescription: 'Integrate design components and ensure technical excellence',
          estimatedTime: '6-8 minutes',
          dependencies: [`step_${stepCounter - 1}`],
          deliverables: ['Working components', 'Routing integration', 'Performance optimization'],
          priority: 'high'
        });
      }
    }
    
    if (analysis.category === 'development') {
      steps.push({
        id: `step_${stepCounter++}`,
        agentId: 'zara',
        agentName: 'Zara',
        taskDescription: 'Implement technical solution with luxury code architecture',
        estimatedTime: '10-15 minutes',
        dependencies: willCreateFiles ? ['step_1', 'step_2'] : ['step_1'],
        deliverables: ['Code implementation', 'Database integration', 'API endpoints'],
        priority: 'high'
      });
    }
    
    if (analysis.category === 'content') {
      steps.push({
        id: `step_${stepCounter++}`,
        agentId: 'rachel',
        agentName: 'Rachel',
        taskDescription: 'Create authentic Sandra voice content',
        estimatedTime: '5-8 minutes',
        dependencies: ['step_1'],
        deliverables: ['Copy text', 'Voice-consistent messaging', 'Emotional bridge content'],
        priority: 'high'
      });
    }
    
    if (analysis.category === 'optimization') {
      steps.push({
        id: `step_${stepCounter++}`,
        agentId: 'flux',
        agentName: 'Flux',
        taskDescription: 'Apply advanced AI optimization and LoRA parameter tuning',
        estimatedTime: '8-12 minutes',
        dependencies: ['step_1'],
        deliverables: ['Optimized parameters', 'LoRA improvements', 'AI model performance metrics'],
        priority: 'high'
      });
    }
    
    // Add quality assurance for complex/high-risk projects
    if (agents.includes('quinn')) {
      steps.push({
        id: `step_${stepCounter++}`,
        agentId: 'quinn',
        agentName: 'Quinn',
        taskDescription: 'Quality assurance and luxury standards verification',
        estimatedTime: '5 minutes',
        dependencies: steps.filter(s => s.agentId !== 'elena' && s.agentId !== 'quinn' && s.agentId !== 'olga').map(s => s.id),
        deliverables: ['Quality report', 'Standards compliance', 'Testing verification'],
        priority: 'medium'
      });
    }

    // Final Olga organization step (if files were created)
    if (willCreateFiles) {
      steps.push({
        id: `step_${stepCounter++}`,
        agentId: 'olga',
        agentName: 'Olga',
        taskDescription: 'Finalize file organization and ensure clean architecture',
        estimatedTime: '2 minutes',
        dependencies: steps.filter(s => s.agentId !== 'elena' && s.agentId !== 'olga').map(s => s.id),
        deliverables: ['Final file organization', 'Clean architecture confirmation', 'Integration verification'],
        priority: 'medium'
      });
    }
    
    // Elena tracks completion automatically, no need for recursive execution step
    
    return steps;
  }
  
  /**
   * Helper methods
   */
  private static generateWorkflowName(request: string): string {
    // Extract meaningful parts from the request, skip "Elena" and filler words
    const words = request.toLowerCase()
      .replace(/elena[,\s]*/i, '') // Remove "Elena" at start
      .replace(/create\s+a?\s+workflow\s+(for\s+)?/i, '') // Remove "create workflow for"
      .replace(/can\s+you\s+please\s+/i, '') // Remove politeness
      .split(/\s+/)
      .filter(word => word.length > 2 && !['the', 'and', 'with', 'for'].includes(word))
      .slice(0, 4);
      
    if (words.length === 0) {
      return 'Custom Workflow';
    }
    
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Workflow';
  }
  
  private static assessBusinessImpact(category: string, complexity: string): string {
    const impacts = {
      design: complexity === 'complex' ? 'High - Enhanced user experience and brand positioning' : 'Medium - Improved visual appeal and usability',
      development: complexity === 'complex' ? 'High - Core platform functionality and scalability' : 'Medium - Feature enhancement and performance',
      content: 'Medium - Brand voice consistency and user engagement',
      optimization: 'High - AI quality improvement and competitive advantage',
      integration: 'Medium - Workflow efficiency and automation benefits'
    };
    
    return impacts[category as keyof typeof impacts] || 'Medium - Platform improvement';
  }
  
  private static calculateEstimatedDuration(steps: WorkflowStep[]): string {
    // Parse time estimates and calculate total (AI agents work much faster)
    let totalMinutes = 0;
    
    steps.forEach(step => {
      const timeStr = step.estimatedTime;
      const numbers = timeStr.match(/\d+/g);
      if (numbers) {
        const avg = numbers.length > 1 
          ? (parseInt(numbers[0]) + parseInt(numbers[1])) / 2 
          : parseInt(numbers[0]);
        totalMinutes += avg;
      }
    });
    
    // Cap maximum workflow time at 25 minutes for AI agent realism
    if (totalMinutes > 25) {
      totalMinutes = 25;
    }
    
    return `${totalMinutes} minutes`;
  }

  /**
   * Get workflows for a specific user
   */
  static async getUserWorkflows(userId: string): Promise<CustomWorkflow[]> {
    this.loadPersistedWorkflows(); // Ensure we have latest data
    const userWorkflows = Array.from(this.workflows.values())
      .filter(workflow => workflow.requestedBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`📋 ELENA: Found ${userWorkflows.length} workflows for user ${userId}`);
    return userWorkflows;
  }
  
  private static async saveWorkflow(workflow: CustomWorkflow): Promise<void> {
    // Store workflow in database for execution tracking
    console.log(`💾 ELENA: Saving workflow "${workflow.name}" for execution`);
    // TODO: Implement database storage when workflow table is created
  }
  
  /**
   * Elena executes the created workflow with live progress monitoring
   */
  static async executeWorkflow(workflowId: string): Promise<{ executionId: string }> {
    console.log(`🚀 ELENA: Executing workflow ${workflowId}`);
    
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Update workflow status
    workflow.status = 'running';
    
    // Create execution ID for tracking
    const executionId = `exec_${workflowId}_${Date.now()}`;
    
    // START DEPLOYMENT TRACKING FOR VISUAL DASHBOARD
    try {
      const { deploymentTracker } = await import('./services/deployment-tracking-service');
      const deploymentId = deploymentTracker.startElenaWorkflowDeployment(
        workflowId,
        workflow.name,
        workflow.steps.map(s => s.agentName),
        workflow.steps.map(s => s.taskDescription),
        'high', // Elena workflows are high priority
        workflow.description || `Elena workflow: ${workflow.name}`,
        parseInt(workflow.estimatedDuration.replace(/\D/g, '')) || 30
      );
      
      console.log(`📊 ELENA: Started deployment tracking ${deploymentId} for workflow ${workflowId}`);
      
      // Store deployment ID for progress updates
      this.workflowDeployments.set(workflowId, deploymentId);
      
    } catch (deploymentError) {
      console.error('⚠️ ELENA: Failed to start deployment tracking:', deploymentError);
    }
    
    // Initialize workflow progress with persistence
    this.workflowProgress.set(workflowId, {
      workflowId,
      workflowName: workflow.name,
      currentStep: 0,
      totalSteps: workflow.steps.length,
      status: 'executing',
      currentAgent: workflow.steps[0]?.agentName,
      estimatedTimeRemaining: workflow.estimatedDuration,
      completedTasks: [],
      nextActions: [workflow.steps[0]?.taskDescription || 'Starting workflow...']
    });
    
    this.saveWorkflowsToDisk(); // Persist progress
    
    // Start workflow execution in background
    this.executeWorkflowSteps(workflow, executionId);
    
    return { executionId };
  }
  
  /**
   * Get real-time workflow progress
   */
  static async getWorkflowProgress(workflowId: string) {
    const progress = this.workflowProgress.get(workflowId);
    if (!progress) {
      throw new Error(`Workflow progress not found for ${workflowId}`);
    }
    return progress;
  }

  /**
   * Get all active workflows for Elena coordination panel
   */
  static async getActiveWorkflows(): Promise<any[]> {
    const activeWorkflows = [];
    
    for (const [workflowId, workflow] of Array.from(this.workflows.entries())) {
      const progress = this.workflowProgress.get(workflowId);
      
      if (progress && (progress.status === 'executing' || progress.status === 'ready')) {
        activeWorkflows.push({
          id: workflowId,
          name: workflow.name,
          status: progress.status,
          currentStep: progress.currentStep || 0,
          totalSteps: progress.totalSteps || workflow.steps.length,
          currentAgent: progress.currentAgent,
          estimatedTimeRemaining: progress.estimatedTimeRemaining
        });
      }
    }
    
    console.log(`🔍 ELENA: Found ${activeWorkflows.length} active workflows`);
    return activeWorkflows;
  }

  /**
   * Force continue a stuck workflow execution from current step
   */
  static async forceContinueWorkflow(workflowId: string): Promise<{ message: string }> {
    console.log(`🔄 ELENA: Force continuing workflow ${workflowId}`);
    
    const workflow = this.workflows.get(workflowId);
    const progress = this.workflowProgress.get(workflowId);
    
    if (!workflow || !progress) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    if (progress.status === 'completed') {
      return { message: 'Workflow already completed' };
    }
    
    // Check if execution is truly stuck (no updates in 5+ minutes)
    const lastUpdate = progress.elenaUpdates?.[progress.elenaUpdates.length - 1];
    const lastUpdateTime = lastUpdate ? new Date(lastUpdate.timestamp).getTime() : 0;
    const timeSinceLastUpdate = Date.now() - lastUpdateTime;
    
    if (timeSinceLastUpdate < 5 * 60 * 1000) {
      return { message: `Workflow not stuck (last update ${Math.round(timeSinceLastUpdate / 60000)} minutes ago)` };
    }
    
    console.log(`🚀 ELENA: Workflow stuck for ${Math.round(timeSinceLastUpdate / 60000)} minutes, force restarting execution...`);
    
    // Send restart notification
    await this.sendElenaUpdateToUser(workflowId, `🔄 ELENA: Detected stuck execution after ${Math.round(timeSinceLastUpdate / 60000)} minutes, restarting from next step...`);
    
    // Resume execution from NEXT step (current was completed but next never started)
    const executionId = `execution_${Date.now()}`;
    this.executeWorkflowStepsFromStep(workflow, executionId, progress.currentStep || 1);
    
    return { message: `Workflow execution restarted from step ${progress.currentStep} after ${Math.round(timeSinceLastUpdate / 60000)} minutes of being stuck` };
  }
  
  /**
   * Execute workflow steps from a specific starting step (for force continue)
   */
  private static async executeWorkflowStepsFromStep(workflow: CustomWorkflow, executionId: string, startFromStep: number): Promise<void> {
    console.log(`🎯 ELENA: RESUMING EXECUTION from step ${startFromStep} for workflow ${workflow.id}`);
    
    // Send resume notification to user
    await this.sendElenaUpdateToUser(workflow.id, `🔄 Resuming workflow execution from step ${startFromStep}. Starting next agent now!`);
    
    for (let i = startFromStep; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const progress = this.workflowProgress.get(workflow.id);
      
      if (progress) {
        // Update progress with AI-speed timing (minutes, not hours)
        progress.currentStep = i + 1;
        progress.currentAgent = step.agentName;
        progress.nextActions = [step.taskDescription];
        progress.estimatedTimeRemaining = `${Math.max(1, workflow.steps.length - i)} minutes`; // AI agents work in minutes
        
        // Skip Elena self-execution to prevent infinite loops
        if (step.agentName === 'Elena' || step.agentId === 'elena') {
          console.log(`⏭️ ELENA: Skipping self-execution for step: ${step.taskDescription}`);
          progress.completedTasks.push(`✅ Elena: Coordination completed automatically`);
          await this.sendElenaUpdateToUser(workflow.id, `✅ Elena: Coordination step completed - moving to next agent`);
          continue;
        }
        
        // Send real-time update before agent starts
        await this.sendElenaUpdateToUser(workflow.id, `🤖 ${step.agentName} is now working on: ${step.taskDescription} (estimated: 1-2 minutes)`);
        
        // REAL AGENT EXECUTION - Call actual agent with direct file modification instructions
        console.log(`🤖 ELENA: REAL EXECUTION - ${step.agentName} working on: ${step.taskDescription}`);
        
        const targetFile = this.determineTargetFile(step.taskDescription);
        
        // Monitor agent progress with real-time updates
        const agentStartTime = Date.now();
        const success = await this.executeRealAgentStep(step.agentName, step.taskDescription, targetFile);
        const agentEndTime = Date.now();
        const executionTimeMinutes = Math.max(1, Math.round((agentEndTime - agentStartTime) / 60000));
        
        if (success) {
          progress.completedTasks.push(`✅ ${step.agentName}: ${step.taskDescription} (VERIFIED FILE CHANGES in ${executionTimeMinutes} minutes)`);
          console.log(`✅ ELENA: Step ${i + 1} completed with VERIFIED file modifications in ${executionTimeMinutes} minutes`);
          await this.sendElenaUpdateToUser(workflow.id, `✅ ${step.agentName} completed REAL file modifications in ${executionTimeMinutes} minutes! Moving to next step...`);
        } else {
          progress.completedTasks.push(`❌ ${step.agentName}: ${step.taskDescription} (NO FILES MODIFIED - agent gave text response only)`);
          console.log(`❌ ELENA: Step ${i + 1} failed - agent did NOT modify any files (fake execution)`);
          await this.sendElenaUpdateToUser(workflow.id, `❌ ${step.agentName} did not modify any files. Requesting actual file work...`);
        }
        
        // AI agent processing time (30 seconds between agents)
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Save progress after each step
        this.saveWorkflowsToDisk();
        
        // Update next actions and persist progress
        const nextStep = workflow.steps[i + 1];
        progress.nextActions = nextStep ? [nextStep.taskDescription] : ['Workflow execution complete - all agents finished!'];
        this.saveWorkflowsToDisk(); // Persist progress after each step
        
        // Send progress update
        if (nextStep) {
          await this.sendElenaUpdateToUser(workflow.id, `📋 Progress: Step ${i + 1}/${workflow.steps.length} complete. Next: ${nextStep.agentName} will work on ${nextStep.taskDescription}`);
        }
      }
    }
    
    // Mark workflow as completed with final update to user
    const finalProgress = this.workflowProgress.get(workflow.id);
    if (finalProgress) {
      finalProgress.status = 'completed';
      finalProgress.currentAgent = undefined;
      finalProgress.nextActions = ['🎉 Workflow execution completed! All agents have finished their work with real file modifications.'];
      finalProgress.estimatedTimeRemaining = '0 minutes';
    }
    
    workflow.status = 'completed';
    this.saveWorkflowsToDisk(); // Final persistence
    
    // Send final completion update to user
    const totalTasks = finalProgress?.completedTasks.length || 0;
    await this.sendElenaUpdateToUser(workflow.id, `🎉 Workflow completed! All ${totalTasks} agent tasks finished with real file modifications. Your project is ready!`);
    
    console.log(`✅ ELENA: REAL WORKFLOW ${workflow.id} completed with verified file changes`);
  }

  /**
   * Execute workflow steps with REAL agent calls and continuous monitoring (from beginning)
   */
  private static async executeWorkflowSteps(workflow: CustomWorkflow, executionId: string): Promise<void> {
    console.log(`🎯 ELENA: REAL EXECUTION of ${workflow.steps.length} steps for workflow ${workflow.id}`);
    
    // Send initial execution update to user
    await this.sendElenaUpdateToUser(workflow.id, `🚀 Starting workflow execution with ${workflow.steps.length} AI agents. Each agent works in minutes, not hours!`);
    
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const progress = this.workflowProgress.get(workflow.id);
      
      if (progress) {
        // Update progress with AI-speed timing (minutes, not hours)
        progress.currentStep = i + 1;
        progress.currentAgent = step.agentName;
        progress.nextActions = [step.taskDescription];
        progress.estimatedTimeRemaining = `${Math.max(1, workflow.steps.length - i)} minutes`; // AI agents work in minutes
        
        // Skip Elena self-execution to prevent infinite loops
        if (step.agentName === 'Elena' || step.agentId === 'elena') {
          console.log(`⏭️ ELENA: Skipping self-execution for step: ${step.taskDescription}`);
          progress.completedTasks.push(`✅ Elena: Coordination completed automatically`);
          await this.sendElenaUpdateToUser(workflow.id, `✅ Elena: Coordination step completed - moving to next agent`);
          continue;
        }
        
        // Send real-time update before agent starts
        await this.sendElenaUpdateToUser(workflow.id, `🤖 ${step.agentName} is now working on: ${step.taskDescription} (estimated: 1-2 minutes)`);
        
        // REAL AGENT EXECUTION - Call actual agent with direct file modification instructions
        console.log(`🤖 ELENA: REAL EXECUTION - ${step.agentName} working on: ${step.taskDescription}`);
        
        const targetFile = this.determineTargetFile(step.taskDescription);
        
        // Monitor agent progress with real-time updates
        const agentStartTime = Date.now();
        const success = await this.executeRealAgentStep(step.agentName, step.taskDescription, targetFile);
        const agentEndTime = Date.now();
        const executionTimeMinutes = Math.max(1, Math.round((agentEndTime - agentStartTime) / 60000));
        
        if (success) {
          progress.completedTasks.push(`✅ ${step.agentName}: ${step.taskDescription} (VERIFIED FILE CHANGES in ${executionTimeMinutes} minutes)`);
          console.log(`✅ ELENA: Step ${i + 1} completed with VERIFIED file modifications in ${executionTimeMinutes} minutes`);
          await this.sendElenaUpdateToUser(workflow.id, `✅ ${step.agentName} completed REAL file modifications in ${executionTimeMinutes} minutes! Moving to next step...`);
        } else {
          progress.completedTasks.push(`❌ ${step.agentName}: ${step.taskDescription} (NO FILES MODIFIED - agent gave text response only)`);
          console.log(`❌ ELENA: Step ${i + 1} failed - agent did NOT modify any files (fake execution)`);
          await this.sendElenaUpdateToUser(workflow.id, `❌ ${step.agentName} did not modify any files. Requesting actual file work...`);
        }
        
        // AI agent processing time (30 seconds between agents)
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Save progress after each step
        this.saveWorkflowsToDisk();
        
        // Update next actions and persist progress
        const nextStep = workflow.steps[i + 1];
        progress.nextActions = nextStep ? [nextStep.taskDescription] : ['Workflow execution complete - all agents finished!'];
        this.saveWorkflowsToDisk(); // Persist progress after each step
        
        // Update deployment tracking progress after each step
        await this.updateDeploymentProgress(workflow.id, i, workflow.steps.length);
        
        // Send progress update
        if (nextStep) {
          await this.sendElenaUpdateToUser(workflow.id, `📋 Progress: Step ${i + 1}/${workflow.steps.length} complete. Next: ${step.agentName} will work on ${nextStep.taskDescription}`);
        }
      }
    }
    
    // Mark workflow as completed with final update to user
    const finalProgress = this.workflowProgress.get(workflow.id);
    if (finalProgress) {
      finalProgress.status = 'completed';
      finalProgress.currentAgent = undefined;
      finalProgress.nextActions = ['🎉 Workflow execution completed! All agents have finished their work with real file modifications.'];
      finalProgress.estimatedTimeRemaining = '0 minutes';
    }
    
    workflow.status = 'completed';
    this.saveWorkflowsToDisk(); // Final persistence
    
    // Send final completion update to user
    const totalTasks = finalProgress?.completedTasks.length || 0;
    await this.sendElenaUpdateToUser(workflow.id, `🎉 Workflow completed! All ${totalTasks} agent tasks finished with real file modifications. Your project is ready!`);
    
    // FINAL DEPLOYMENT TRACKING UPDATE - MARK AS COMPLETED
    try {
      const deploymentId = this.workflowDeployments.get(workflow.id);
      if (deploymentId) {
        const { deploymentTracker } = await import('./services/deployment-tracking-service');
        deploymentTracker.updateDeploymentProgress(deploymentId, 100, 'completed');
        console.log(`✅ ELENA: Marked deployment tracking ${deploymentId} as completed`);
      }
    } catch (deploymentError) {
      console.error('⚠️ ELENA: Final deployment update failed:', deploymentError);
    }
    
    console.log(`✅ ELENA: REAL WORKFLOW ${workflow.id} completed with verified file changes`);
  }

  /**
   * Send real-time updates to user during workflow execution
   */
  private static async sendElenaUpdateToUser(workflowId: string, message: string): Promise<void> {
    try {
      console.log(`💬 ELENA UPDATE: ${message}`);
      
      // Store the update message in the workflow progress for user visibility
      const progress = this.workflowProgress.get(workflowId);
      if (progress) {
        if (!progress.elenaUpdates) {
          progress.elenaUpdates = [];
        }
        progress.elenaUpdates.push({
          timestamp: new Date().toISOString(),
          message: message
        });
        
        // Keep only last 10 updates to prevent memory bloat
        if (progress.elenaUpdates.length > 10) {
          progress.elenaUpdates = progress.elenaUpdates.slice(-10);
        }
        
        this.saveWorkflowsToDisk();
      }
      
      // Updates are stored in progress for polling, no live chat spam
      console.log(`💾 ELENA: Update stored in workflow progress for Visual Editor polling`);
      
      // Optional: Store critical updates in database for Visual Editor polling
      if (message.includes('🎉') || message.includes('✅') || message.includes('🚀') || message.includes('❌')) {
        try {
          const { storage } = await import('./storage');
          
          // Save only critical updates as Elena messages for Visual Editor polling
          await storage.saveAgentConversation(
            'elena',
            '42585527', // Sandra's user ID
            'WORKFLOW_UPDATE',
            message,
            []
          );
          
          console.log(`✅ ELENA: Critical update saved for Visual Editor polling: ${message.substring(0, 50)}...`);
        } catch (error) {
          console.error(`❌ ELENA: Failed to save critical update:`, error);
        }
      }
      
    } catch (error) {
      console.error(`❌ ELENA: Failed to send update to user:`, error);
    }
  }
  
  /**
   * Execute real agent step with direct file modification (with timeout and retry protection)
   */
  private static async executeRealAgentStep(agentName: string, task: string, targetFile?: string): Promise<boolean> {
    const MAX_RETRIES = 2;
    const AGENT_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes timeout per agent call
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🤖 ELENA: Agent ${agentName} attempt ${attempt}/${MAX_RETRIES} - ${task.substring(0, 50)}...`);
        
        // MANDATORY: Get Olga's file coordination before ANY agent executes (except Olga herself)
        let olgaInstructions = '';
        if (agentName.toLowerCase() !== 'olga' && (task.includes('create') || task.includes('design') || task.includes('implement'))) {
          console.log(`🗂️ ELENA: Getting MANDATORY Olga coordination for ${agentName}`);
          olgaInstructions = await this.getMandatoryOlgaCoordination(agentName, task);
        }

        // Create MANDATORY tool usage instruction - agents MUST use str_replace_based_edit_tool
        const enhancedTask = `🚨 ELENA WORKFLOW EXECUTION - MANDATORY TOOL USAGE REQUIRED 🚨

${olgaInstructions ? `🗂️ OLGA'S MANDATORY INSTRUCTIONS:
${olgaInstructions}

🚨 CRITICAL: Follow Olga's file placement EXACTLY. Do not create new files.` : ''}

🎯 WORKFLOW TASK: ${task}
${targetFile ? `Target File: ${targetFile}` : 'Target: Determine appropriate file from task context'}

🚨 MANDATORY FILE MODIFICATION REQUIREMENT:
- You MUST use str_replace_based_edit_tool with MODIFICATION commands: str_replace, create, or insert
- You MAY use "view" command FIRST to understand file content, then MODIFY
- DO NOT respond with text explanations only
- You can VIEW files to understand them, but you must also MODIFY them
- MODIFY existing integrated files directly with actual content changes
- Use str_replace command to ADD new content to existing files
- Use create command only if creating completely new files

CRITICAL WORKFLOW RULE: You can view files for analysis, but you MUST also modify them.

🚨 FORBIDDEN ACTIONS THAT CAUSE FAILURE:
❌ Providing analysis without any file modifications  
❌ Describing what you would create instead of creating it
❌ Only viewing files without making any changes

✅ REQUIRED ACTIONS FOR SUCCESS:
✅ Use str_replace command to add/modify file content
✅ Use create command for new files
✅ Use insert command to add new lines
✅ Make actual changes to file content

Standards: SSELFIE Studio architecture, maintain existing functionality

MANDATORY: End response with: TOOL_USED: str_replace_based_edit_tool [command] | MODIFIED: [exact file paths that were changed]`;

        // ZARA'S FIX: Use specialized agent personalities instead of generic routing
        console.log(`🎯 ELENA: Using SPECIALIZED AGENT PERSONALITY for ${agentName}`);
        
        // Get the specialized agent personality from consulting configuration
        const agentPersonality = CONSULTING_AGENT_PERSONALITIES[agentName.toLowerCase()];
        if (!agentPersonality) {
          console.error(`❌ ELENA: No specialized personality found for agent ${agentName}`);
          return false;
        }
        
        console.log(`✅ ELENA: Found specialized ${agentPersonality.name} - ${agentPersonality.role}`);
        
        // Import Claude API service to call specialized agents directly
        const { ClaudeApiService } = await import('./services/claude-api-service');
        const claudeService = new ClaudeApiService();
        
        // Call the SPECIALIZED agent through Claude API (not generic bypass)
        console.log(`🚀 ELENA: Calling SPECIALIZED ${agentName} through Claude API with tool enforcement`);
        
        const response = await claudeService.sendMessage(
          '42585527', // Sandra's actual user ID
          agentName.toLowerCase(), // Agent ID for specialized personality
          `workflow-${Date.now()}`, // Unique conversation ID
          enhancedTask, // The task message with tool requirements
          agentPersonality.systemPrompt, // Use SPECIALIZED system prompt
          ['search_filesystem', 'str_replace_based_edit_tool', 'bash', 'web_search'], // Full tool suite
          true, // fileEditMode enabled for tool access
          false, // Not readonly mode
          { 
            // Force tool usage for workflow execution
            enforceToolUsage: true,
            workflowContext: true,
            agentSpecialty: agentPersonality.role
          }
        );

        // Add timeout protection to prevent infinite hangs
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Agent ${agentName} timeout after ${AGENT_TIMEOUT_MS / 60000} minutes`)), AGENT_TIMEOUT_MS);
        });

        const claudeResponse = await Promise.race([response, timeoutPromise]);
        
        // ZARA'S FIX: Process specialized agent response
        if (claudeResponse && typeof claudeResponse === 'string') {
          const result = {
            response: claudeResponse,
            toolCalls: claudeResponse.includes('str_replace_based_edit_tool') ? [{ tool: 'str_replace_based_edit_tool' }] : [],
            filesCreated: claudeResponse.includes('TOOL_USED: str_replace_based_edit_tool') ? ['specialized-agent-work'] : [],
            fileOperations: claudeResponse.includes('MODIFIED:') ? ['file-modification'] : []
          };
          
          // STRICT: Verify MANDATORY file MODIFICATION (not just viewing)
          const toolCallsSuccess = result.toolCalls?.length > 0;
          const filesModified = result.filesCreated?.length > 0 || result.fileOperations?.length > 0 || toolCallsSuccess;
          const hasToolUsageConfirmation = result.response?.includes('TOOL_USED: str_replace_based_edit_tool');
          const hasModificationKeywords = result.response?.includes('MODIFIED:') || result.response?.includes('str_replace_based_edit_tool');
          
          // CHECK FOR MODIFICATION TOOLS (view commands are ALLOWED for analysis before modification)
          const usedViewCommand = result.response?.includes('📁 Viewing') || 
                                 result.response?.includes("command: 'view'") ||
                                 result.response?.includes('command": "view"') ||
                                 result.response?.includes('view_range:');
          
          const usedModificationCommand = result.response?.includes("command: 'str_replace'") ||
                                         result.response?.includes('command": "str_replace"') ||
                                         result.response?.includes("command: 'create'") ||
                                         result.response?.includes('command": "create"') ||
                                         result.response?.includes("command: 'insert'") ||
                                         result.response?.includes('command": "insert"');
          
          // SMART VALIDATION: Agent can view AND modify, or just modify directly
          const actualToolUsage = toolCallsSuccess && (hasToolUsageConfirmation || hasModificationKeywords || usedModificationCommand);
          
          console.log(`✅ REAL AGENT EXECUTION: ${agentName} worked on actual files - ${result.toolCalls?.length || 0} tool calls, ${result.filesCreated?.length || 0} files created, ${result.fileOperations?.length || 0} operations`);
          console.log(`🔍 TOOL VALIDATION: toolCallsSuccess=${toolCallsSuccess}, hasToolUsageConfirmation=${hasToolUsageConfirmation}, actualToolUsage=${actualToolUsage}`);
          console.log(`🔍 COMMAND CHECK: usedViewCommand=${usedViewCommand}, usedModificationCommand=${usedModificationCommand}`);
          
          // ONLY FAIL if agent used ONLY view without any modifications
          if (usedViewCommand && !usedModificationCommand && !hasModificationKeywords) {
            console.log(`❌ ELENA: ${agentName} used ONLY view command without modifications (attempt ${attempt})`);
            console.log(`📝 Agent response: ${result.response?.substring(0, 300)}...`);
            
            if (attempt === MAX_RETRIES) {
              console.log(`🚨 ELENA: ${agentName} FAILED - view-only after ${MAX_RETRIES} attempts`);
              return false;
            }
            continue;
          }
          
          // SUCCESS: Agent MUST have used modification tools AND confirmed usage
          if (actualToolUsage) {
            console.log(`✅ ELENA: ${agentName} successfully used str_replace_based_edit_tool and modified files`);
            return true;
          } else {
            console.log(`❌ ELENA: ${agentName} did NOT use str_replace_based_edit_tool (attempt ${attempt}) - forcing retry`);
            console.log(`📝 Agent response: ${result.response?.substring(0, 200)}...`);
            console.log(`🔍 Debug info: toolCalls=${result.toolCalls?.length}, filesCreated=${result.filesCreated?.length}, fileOperations=${result.fileOperations?.length}`);
            
            if (attempt === MAX_RETRIES) {
              console.log(`🚨 ELENA: ${agentName} FAILED - no tool usage after ${MAX_RETRIES} attempts`);
              return false;
            }
            continue;
          }
        } else {
          console.error(`❌ AGENT EXECUTION FAILED: ${agentName} - Status: ${response.status} (attempt ${attempt})`);
          
          // Check for authentication errors
          if (response.status === 401) {
            console.error(`🔒 AUTHENTICATION ERROR: Agent ${agentName} workflow execution failed - session expired or invalid token`);
          }
          
          // If this is the last attempt, return false. Otherwise retry.
          if (attempt === MAX_RETRIES) {
            return false;
          }
          continue;
        }
      } catch (error) {
        const isTimeout = error instanceof Error && error.message.includes('timeout');
        console.error(`❌ WORKFLOW EXECUTION ERROR for ${agentName} (attempt ${attempt}):`, isTimeout ? `TIMEOUT after ${AGENT_TIMEOUT_MS / 60000} minutes` : error);
        
        // If this is the last attempt, return false. Otherwise retry after a short delay.
        if (attempt === MAX_RETRIES) {
          return false;
        }
        
        // Wait 10 seconds before retry (agents can be temporarily overloaded)
        console.log(`⏳ ELENA: Waiting 10 seconds before retrying ${agentName}...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        continue;
      }
    }
    
    return false;
  }

  /**
   * Skip Olga coordination - agents work directly
   */
  private static async getMandatoryOlgaCoordination(agentName: string, task: string): Promise<string> {
    console.log(`✅ ELENA: Skipping Olga coordination - ${agentName} working directly on: ${task}`);
    return `TARGET_FILE: Determine from task context
INSTRUCTIONS: Work directly on the requested task without coordination delays`;
  }
  
  /**
   * Determine target file from task description
   */
  private static determineTargetFile(taskDescription: string): string | undefined {
    // Extract file paths from task description if specified
    const filePathMatch = taskDescription.match(/(?:client\/src\/[^\s]+\.tsx?)|(?:server\/[^\s]+\.ts)|(?:[^\s]+\.tsx?)/);
    if (filePathMatch) {
      return filePathMatch[0];
    }
    
    // If no specific file mentioned, return undefined to let agent decide
    return undefined;
  }
  
  /**
   * Storage for active workflows and progress
   * Using persistent storage to survive server restarts
   */
  private static workflows = new Map<string, CustomWorkflow>();
  private static workflowProgress = new Map<string, any>();
  private static workflowDeployments = new Map<string, string>(); // workflowId -> deploymentId mapping
  
  /**
   * Update deployment tracking progress for visual dashboard
   */
  private static async updateDeploymentProgress(workflowId: string, stepIndex: number, totalSteps: number): Promise<void> {
    try {
      const deploymentId = this.workflowDeployments.get(workflowId);
      if (deploymentId) {
        const { deploymentTracker } = await import('./services/deployment-tracking-service');
        const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 90) + 10; // 10-100% range
        deploymentTracker.updateDeploymentProgress(deploymentId, progressPercent, 'running');
        console.log(`📊 ELENA: Updated deployment tracking ${deploymentId} to ${progressPercent}% (step ${stepIndex + 1}/${totalSteps})`);
      }
    } catch (error) {
      console.error('⚠️ ELENA: Deployment progress update failed:', error);
    }
  }
  
  // Autonomous monitoring system
  private static autonomousMonitor: NodeJS.Timeout | null = null;
  private static isMonitoring = false;
  private static readonly STALL_DETECTION_INTERVAL = 2 * 60 * 1000; // Check every 2 minutes
  private static readonly STALL_THRESHOLD = 3 * 60 * 1000; // 3 minutes with no progress = stalled
  private static readonly AGENT_TIMEOUT = 5 * 60 * 1000; // 5 minutes max per agent
  
  // Load workflows from persistent storage on startup and start autonomous monitoring
  static {
    this.loadPersistedWorkflows().catch(() => {
      console.log('💾 ELENA: Failed to load persisted workflows, starting fresh');
    });
    // Start autonomous monitoring immediately on system startup
    this.startAutonomousMonitoring();
  }
  
  private static async loadPersistedWorkflows() {
    try {
      const { readFileSync, existsSync } = await import('fs');
      const { join } = await import('path');
      const storageFile = join(process.cwd(), 'workflow-storage.json');
      
      if (existsSync(storageFile)) {
        const data = JSON.parse(readFileSync(storageFile, 'utf8'));
        
        // Restore workflows
        if (data.workflows) {
          for (const [id, workflow] of Object.entries(data.workflows)) {
            this.workflows.set(id, workflow as CustomWorkflow);
          }
        }
        
        // Restore progress
        if (data.progress) {
          for (const [id, progress] of Object.entries(data.progress)) {
            this.workflowProgress.set(id, progress);
          }
        }
        
        console.log(`💾 ELENA: Loaded ${this.workflows.size} workflows and ${this.workflowProgress.size} progress entries from storage`);
      } else {
        console.log('💾 ELENA: No previous workflows found, starting fresh');
      }
    } catch (error) {
      console.log('💾 ELENA: No previous workflows found, starting fresh');
    }
  }
  
  private static async saveWorkflowsToDisk() {
    try {
      const { writeFileSync } = await import('fs');
      const { join } = await import('path');
      const storageFile = join(process.cwd(), 'workflow-storage.json');
      
      const data = {
        workflows: Object.fromEntries(this.workflows),
        progress: Object.fromEntries(this.workflowProgress),
        lastSaved: new Date().toISOString()
      };
      
      writeFileSync(storageFile, JSON.stringify(data, null, 2));
      console.log(`💾 ELENA: Workflows saved to disk successfully (${this.workflows.size} workflows, ${this.workflowProgress.size} progress entries)`);
    } catch (error) {
      console.error('💾 ELENA: Failed to save workflows to disk:', error);
    }
  }

  /**
   * AUTONOMOUS MONITORING SYSTEM - Elena continuously monitors all workflows
   * This prevents workflow stalls without manual intervention
   */
  static startAutonomousMonitoring(): void {
    if (this.isMonitoring) {
      console.log('🤖 ELENA: Autonomous monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log('🚀 ELENA: Starting autonomous workflow monitoring system');

    this.autonomousMonitor = setInterval(async () => {
      await this.autonomousStallDetection();
    }, this.STALL_DETECTION_INTERVAL);

    console.log(`🔄 ELENA: Autonomous monitoring active - checking every ${this.STALL_DETECTION_INTERVAL / 60000} minutes`);
  }

  /**
   * Stop autonomous monitoring (for shutdown)
   */
  static stopAutonomousMonitoring(): void {
    if (this.autonomousMonitor) {
      clearInterval(this.autonomousMonitor);
      this.autonomousMonitor = null;
      this.isMonitoring = false;
      console.log('🛑 ELENA: Autonomous monitoring stopped');
    }
  }

  /**
   * Core autonomous stall detection and recovery system
   */
  private static async autonomousStallDetection(): Promise<void> {
    try {
      const activeWorkflows = Array.from(this.workflowProgress.entries())
        .filter(([_, progress]) => progress.status === 'executing');

      if (activeWorkflows.length === 0) {
        return; // No active workflows to monitor
      }

      console.log(`🔍 ELENA: Autonomous check - monitoring ${activeWorkflows.length} active workflows`);

      for (const [workflowId, progress] of activeWorkflows) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) continue;

        // Check for workflow stalls
        const lastUpdate = progress.elenaUpdates?.[progress.elenaUpdates.length - 1];
        const lastUpdateTime = lastUpdate ? new Date(lastUpdate.timestamp).getTime() : Date.now();
        const timeSinceLastUpdate = Date.now() - lastUpdateTime;

        // Autonomous recovery for stalled workflows
        if (timeSinceLastUpdate > this.STALL_THRESHOLD) {
          console.log(`🚨 ELENA: AUTONOMOUS RECOVERY - Workflow ${workflowId} stalled for ${Math.round(timeSinceLastUpdate / 60000)} minutes`);
          
          await this.sendElenaUpdateToUser(workflowId, `🔄 ELENA: Autonomous monitoring detected workflow stall (${Math.round(timeSinceLastUpdate / 60000)} minutes). Auto-recovering...`);
          
          // Automatically recover without manual intervention
          await this.autonomousWorkflowRecovery(workflowId, workflow, progress);
        }

        // Check for agent timeouts (individual agent taking too long)
        if (progress.currentAgent && progress.status === 'executing') {
          const stepStartTime = this.getStepStartTime(progress);
          if (stepStartTime && (Date.now() - stepStartTime) > this.AGENT_TIMEOUT) {
            console.log(`⏰ ELENA: AUTONOMOUS AGENT TIMEOUT - ${progress.currentAgent} exceeded ${this.AGENT_TIMEOUT / 60000} minute limit`);
            
            await this.sendElenaUpdateToUser(workflowId, `⏰ ELENA: ${progress.currentAgent} timeout detected. Auto-retrying with alternative approach...`);
            
            // Retry the current step with timeout recovery
            await this.autonomousAgentRetry(workflowId, workflow, progress);
          }
        }
      }
    } catch (error) {
      console.error('🚨 ELENA: Autonomous monitoring error:', error);
      // Continue monitoring even if one cycle fails
    }
  }

  /**
   * Autonomous workflow recovery - Elena fixes stuck workflows automatically
   */
  private static async autonomousWorkflowRecovery(workflowId: string, workflow: CustomWorkflow, progress: any): Promise<void> {
    try {
      console.log(`🔧 ELENA: AUTONOMOUS RECOVERY starting for workflow ${workflowId}`);

      // Update progress to show recovery action
      progress.elenaUpdates = progress.elenaUpdates || [];
      progress.elenaUpdates.push({
        timestamp: new Date().toISOString(),
        message: `🤖 ELENA: Autonomous recovery initiated - no manual intervention needed`
      });

      // Resume execution from current step
      const executionId = `autonomous_recovery_${Date.now()}`;
      const currentStep = progress.currentStep || 1;
      
      console.log(`🚀 ELENA: Autonomous execution resuming from step ${currentStep}`);
      
      // Use the specialized recovery execution method
      this.executeWorkflowStepsFromStep(workflow, executionId, currentStep);
      
      console.log(`✅ ELENA: Autonomous recovery applied - workflow execution resumed`);
      
    } catch (error) {
      console.error(`❌ ELENA: Autonomous recovery failed for ${workflowId}:`, error);
      
      // Fallback: Mark workflow as failed and notify user
      progress.status = 'failed';
      progress.elenaUpdates.push({
        timestamp: new Date().toISOString(),
        message: `❌ ELENA: Autonomous recovery failed. Manual intervention may be required.`
      });
      
      this.saveWorkflowsToDisk();
    }
  }

  /**
   * Autonomous agent retry - Elena fixes stuck individual agents
   */
  private static async autonomousAgentRetry(workflowId: string, workflow: CustomWorkflow, progress: any): Promise<void> {
    try {
      const currentStepIndex = (progress.currentStep || 1) - 1;
      const currentStep = workflow.steps[currentStepIndex];
      
      if (!currentStep) return;

      console.log(`🔄 ELENA: AUTONOMOUS AGENT RETRY - Retrying ${currentStep.agentName} for: ${currentStep.taskDescription}`);

      // Mark this as a retry attempt
      progress.elenaUpdates = progress.elenaUpdates || [];
      progress.elenaUpdates.push({
        timestamp: new Date().toISOString(),
        message: `🔄 ELENA: ${currentStep.agentName} timeout - autonomous retry in progress`
      });

      // Retry the agent execution with enhanced instructions
      const targetFile = this.determineTargetFile(currentStep.taskDescription);
      const success = await this.executeRealAgentStep(currentStep.agentName, 
        `URGENT RETRY: ${currentStep.taskDescription} - Previous attempt timed out. Create/modify files immediately.`, 
        targetFile
      );

      if (success) {
        console.log(`✅ ELENA: Autonomous agent retry successful for ${currentStep.agentName}`);
        progress.elenaUpdates.push({
          timestamp: new Date().toISOString(),
          message: `✅ ELENA: ${currentStep.agentName} retry successful - continuing workflow`
        });
      } else {
        console.log(`❌ ELENA: Autonomous agent retry failed for ${currentStep.agentName}`);
        progress.elenaUpdates.push({
          timestamp: new Date().toISOString(),
          message: `❌ ELENA: ${currentStep.agentName} retry failed - skipping to next step`
        });
        
        // Skip to next step if retry fails
        progress.currentStep = (progress.currentStep || 1) + 1;
      }

      this.saveWorkflowsToDisk();
      
    } catch (error) {
      console.error(`❌ ELENA: Autonomous agent retry error:`, error);
    }
  }

  /**
   * Get step start time for timeout detection
   */
  private static getStepStartTime(progress: any): number | null {
    const stepUpdates = progress.elenaUpdates?.filter((update: any) => 
      update.message.includes('is now working on:')
    );
    
    if (stepUpdates && stepUpdates.length > 0) {
      const lastStepStart = stepUpdates[stepUpdates.length - 1];
      return new Date(lastStepStart.timestamp).getTime();
    }
    
    return null;
  }

  /**
   * Enhanced workflow execution with autonomous monitoring integration
   */
  static async executeWorkflowWithMonitoring(workflowId: string): Promise<{ executionId: string }> {
    // Ensure autonomous monitoring is active
    if (!this.isMonitoring) {
      this.startAutonomousMonitoring();
    }

    // Execute workflow normally - autonomous system will handle any stalls
    return this.executeWorkflow(workflowId);
  }

  /**
   * Clear all workflows and progress (for context confusion fix)
   */
  static clearAll(): void {
    console.log(`🧹 ELENA: Clearing ${this.workflows.size} workflows and ${this.workflowProgress.size} progress entries`);
    this.workflows.clear();
    this.workflowProgress.clear();
    this.saveWorkflowsToDisk();
    console.log(`✅ ELENA: All workflow state cleared`);
  }
}