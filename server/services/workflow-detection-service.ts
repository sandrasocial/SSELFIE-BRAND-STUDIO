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
    console.log('🔍 Response preview:', elenaResponse.substring(0, 200) + '...');
    
    // Natural Elena workflow patterns
    const coordinationKeywords = [
      "I'll coordinate",
      "Let me coordinate", 
      "I'll assign",
      "Let me assign",
      "I'm assigning",
      "coordinate a",
      "coordinate the",
      "workflow with",
      "I need you to",
      "You'll handle",
      "Strategic Coordination",
      "Elena Strategic Coordination"
    ];
    
    // Check for coordination language
    const hasCoordinationLanguage = coordinationKeywords.some(keyword => 
      elenaResponse.includes(keyword)
    );
    
    // Check for multiple agent mentions (indicates workflow)
    const agents = this.extractAgents(elenaResponse);
    const hasMultipleAgents = agents.length >= 2;
    
    // Check for task delegation patterns
    const delegationPatterns = [
      /Priority:\s*(Critical|High|Medium|Low)/i,
      /Duration:\s*\d+\s*minutes?/i,
      /- I'm assigning you to/i,
      /- You'll handle/i,
      /- I need you to/i
    ];
    
    const hasDelegationPattern = delegationPatterns.some(pattern => 
      pattern.test(elenaResponse)
    );
    
    console.log('🔍 DETECTION ANALYSIS:', {
      hasCoordinationLanguage,
      hasMultipleAgents,
      agentCount: agents.length,
      hasDelegationPattern,
      agents: agents.join(', ')
    });
    
    // Detect workflow if Elena is coordinating multiple agents or using delegation language
    if (hasCoordinationLanguage || (hasMultipleAgents && hasDelegationPattern)) {
      console.log('✅ WORKFLOW DETECTION: Elena workflow detected!');
    } else {
      console.log('❌ WORKFLOW DETECTION: No workflow patterns found');
      return null;
    }
    
    console.log('✅ WORKFLOW DETECTION: Workflow creation detected!');
    
    // Extract workflow details from Elena's response
    const workflowName = this.extractWorkflowName(elenaResponse);
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
      /\*\*"([^"]+)"\*\*\s*workflow/i,  // **"name"** workflow
      /"([^"]+)"\s*workflow/i,
      /coordinate a\s*\*\*"([^"]+)"\*\*/i,  // coordinate a **"name"**
      /coordinate the\s*\*\*"([^"]+)"\*\*/i,  // coordinate the **"name"**
      /coordinate a\s*"([^"]+)"/i,
      /coordinate the\s*"([^"]+)"/i,
      /workflow:\s*"([^"]+)"/i,
      /"([^"]+)"\s*with/i,
      /I'll coordinate[^"]*\*\*"([^"]+)"\*\*/i,  // I'll coordinate **"name"**
      /I'll coordinate[^"]*"([^"]+)"/i,
      /coordinate.*\*\*"([^"]+)"\*\*/i,  // coordinate **"name"**
      /coordinate.*"([^"]+)"/i,
      /Elena Strategic Coordination:\s*([^\n]+)/i,
      /Mission ID[:\s]*([A-Z-0-9-]+)/i,
      /Test Workflow[:\s]*([A-Z-\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        const extractedName = match[1].trim();
        // Filter out markdown artifacts
        if (extractedName !== '**' && extractedName.length > 2) {
          return extractedName;
        }
      }
    }
    
    // If no specific name found, try to extract from first line or context
    const firstLine = response.split('\n')[0];
    if (firstLine.includes('coordinate') && firstLine.length < 100) {
      return firstLine.replace(/.*coordinate\s*/i, '').replace(/\s*with.*/, '').trim();
    }
    
    return 'Elena Strategic Workflow';
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