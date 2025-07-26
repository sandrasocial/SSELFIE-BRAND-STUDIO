/**
 * Elena Workflow Detection Service
 * Detects when Elena creates workflows through conversation and stages them for manual execution
 */

interface DetectedWorkflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  customRequirements: string[];
  detectedAt: Date;
  status: 'staged' | 'executed' | 'expired';
  conversationId?: string;
}

class WorkflowDetectionService {
  private stagedWorkflows: Map<string, DetectedWorkflow> = new Map();
  
  /**
   * Analyze Elena's response for workflow creation patterns
   */
  detectWorkflowCreation(elenaResponse: string, conversationId?: string): DetectedWorkflow | null {
    console.log('🔍 WORKFLOW DETECTION: Analyzing Elena response for workflow patterns');
    
    // Keywords that indicate Elena is creating a workflow
    const workflowKeywords = [
      'AUTONOMOUS WORKFLOW CREATION',
      'ACTIVATING NOW',
      'Deploying Test Workflow',
      'Agent Selection',
      'Mission ID',
      'WORKFLOW EXECUTION',
      'ACTIVATING TEST PROTOCOL',
      'autonomous workflow',
      'creating and activating',
      'workflow with',
      'agents should be working'
    ];
    
    const hasWorkflowKeywords = workflowKeywords.some(keyword => 
      elenaResponse.toUpperCase().includes(keyword.toUpperCase())
    );
    
    if (!hasWorkflowKeywords) {
      console.log('🔍 WORKFLOW DETECTION: No workflow keywords found');
      return null;
    }
    
    console.log('✅ WORKFLOW DETECTION: Workflow creation detected!');
    
    // Extract workflow details from Elena's response
    const workflowName = this.extractWorkflowName(elenaResponse);
    const agents = this.extractAgents(elenaResponse);
    const priority = this.extractPriority(elenaResponse);
    const estimatedDuration = this.extractDuration(elenaResponse);
    const requirements = this.extractRequirements(elenaResponse);
    
    const workflowId = `elena-workflow-${Date.now()}`;
    
    const detectedWorkflow: DetectedWorkflow = {
      id: workflowId,
      name: workflowName,
      description: `Elena created workflow: ${workflowName}`,
      agents,
      priority,
      estimatedDuration,
      customRequirements: requirements,
      detectedAt: new Date(),
      status: 'staged',
      conversationId
    };
    
    // Stage the workflow for manual execution
    this.stagedWorkflows.set(workflowId, detectedWorkflow);
    
    console.log(`🎯 WORKFLOW STAGED: ${workflowName} with ${agents.length} agents`);
    console.log(`📋 WORKFLOW DETAILS:`, {
      id: workflowId,
      name: workflowName,
      agents: agents.join(', '),
      priority,
      duration: estimatedDuration
    });
    
    return detectedWorkflow;
  }
  
  /**
   * Extract workflow name from Elena's response
   */
  private extractWorkflowName(response: string): string {
    // Look for workflow names in quotes or after specific keywords
    const patterns = [
      /Deploying Test Workflow:\s*"([^"]+)"/i,
      /workflow:\s*"([^"]+)"/i,
      /Mission ID[:\s]*([A-Z-0-9]+)/i,
      /Test Workflow[:\s]*([A-Z-\s]+)/i,
      /DESIGN-CONSISTENCY-VALIDATION/i
    ];
    
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Elena Custom Workflow';
  }
  
  /**
   * Extract agent names from Elena's response
   */
  private extractAgents(response: string): string[] {
    const agentNames = ['elena', 'aria', 'zara', 'maya', 'victoria', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'];
    const detectedAgents: string[] = [];
    
    for (const agent of agentNames) {
      if (response.toLowerCase().includes(agent.toLowerCase())) {
        detectedAgents.push(agent);
      }
    }
    
    // If no specific agents found, default to common workflow agents
    if (detectedAgents.length === 0) {
      return ['aria', 'victoria', 'zara'];
    }
    
    return detectedAgents;
  }
  
  /**
   * Extract priority from Elena's response
   */
  private extractPriority(response: string): 'low' | 'medium' | 'high' | 'critical' {
    if (response.toLowerCase().includes('critical')) return 'critical';
    if (response.toLowerCase().includes('urgent')) return 'critical';
    if (response.toLowerCase().includes('high')) return 'high';
    if (response.toLowerCase().includes('medium')) return 'medium';
    return 'high'; // Default for Elena workflows
  }
  
  /**
   * Extract estimated duration from Elena's response
   */
  private extractDuration(response: string): number {
    const durationPatterns = [
      /(\d+)-minute/i,
      /(\d+)\s*minutes/i,
      /(\d+)\s*hour/i
    ];
    
    for (const pattern of durationPatterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        const duration = parseInt(match[1]);
        // Convert hours to minutes if needed
        return response.toLowerCase().includes('hour') ? duration * 60 : duration;
      }
    }
    
    return 45; // Default 45 minutes
  }
  
  /**
   * Extract requirements from Elena's response
   */
  private extractRequirements(response: string): string[] {
    const requirements: string[] = [];
    
    // Look for bullet points or list items
    const bulletPatterns = [
      /[•✅]\s*([^\n]+)/g,
      /[-*]\s*([^\n]+)/g
    ];
    
    for (const pattern of bulletPatterns) {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim()) {
          requirements.push(match[1].trim());
        }
      }
    }
    
    // If no specific requirements found, extract from context
    if (requirements.length === 0) {
      if (response.includes('design')) requirements.push('Design consistency validation');
      if (response.includes('luxury')) requirements.push('Luxury standards compliance');
      if (response.includes('test')) requirements.push('System functionality testing');
    }
    
    return requirements.slice(0, 5); // Limit to 5 requirements
  }
  
  /**
   * Get all staged workflows waiting for manual execution
   */
  getStagedWorkflows(): DetectedWorkflow[] {
    // Filter out expired workflows (older than 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const validWorkflows = Array.from(this.stagedWorkflows.values()).filter(workflow => 
      workflow.status === 'staged' && workflow.detectedAt > twoHoursAgo
    );
    
    return validWorkflows;
  }
  
  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): DetectedWorkflow | undefined {
    return this.stagedWorkflows.get(workflowId);
  }
  
  /**
   * Mark workflow as executed
   */
  markWorkflowExecuted(workflowId: string): boolean {
    const workflow = this.stagedWorkflows.get(workflowId);
    if (workflow) {
      workflow.status = 'executed';
      console.log(`✅ WORKFLOW EXECUTED: ${workflow.name}`);
      return true;
    }
    return false;
  }
  
  /**
   * Clear old workflows
   */
  cleanupOldWorkflows(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [id, workflow] of this.stagedWorkflows.entries()) {
      if (workflow.detectedAt < oneDayAgo) {
        this.stagedWorkflows.delete(id);
        console.log(`🗑️ CLEANED UP OLD WORKFLOW: ${workflow.name}`);
      }
    }
  }
}

// Export singleton instance
export const workflowDetectionService = new WorkflowDetectionService();
export type { DetectedWorkflow };