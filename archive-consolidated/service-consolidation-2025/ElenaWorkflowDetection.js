// Elena Conversational-to-Autonomous Bridge System
// CRITICAL: Detects Elena coordination language and creates executable workflows

const { v4: uuidv4 } = require('uuid');

class ElenaWorkflowDetection {
  constructor() {
    this.workflowPatterns = [
      // Elena coordination patterns
      /I'll coordinate (.*?) and (.*?) to (.*)/i,
      /Let me have (.*?) and (.*?) work on (.*)/i,
      /I'll assign (.*?) to handle (.*)/i,
      /Let's deploy (.*?) for (.*)/i,
      /I'll orchestrate (.*?) to (.*)/i
    ];
    
    this.stagedWorkflows = new Map();
  }

  detectWorkflow(elenaMessage) {
    console.log('🔍 Elena Workflow Detection:', elenaMessage);
    
    for (const pattern of this.workflowPatterns) {
      const match = pattern.exec(elenaMessage);
      if (match) {
        const workflow = this.createWorkflow(match, elenaMessage);
        this.stageWorkflow(workflow);
        return workflow;
      }
    }
    
    return null;
  }

  createWorkflow(match, originalMessage) {
    const workflow = {
      id: uuidv4(),
      type: 'elena_coordination',
      originalMessage,
      agents: this.extractAgents(match),
      tasks: this.extractTasks(match),
      status: 'staged',
      createdAt: new Date(),
      priority: 'high'
    };
    
    console.log('✅ Workflow Created:', workflow);
    return workflow;
  }

  extractAgents(match) {
    const agents = [];
    if (match[1]) agents.push(match[1].toLowerCase());
    if (match[2]) agents.push(match[2].toLowerCase());
    return agents.filter(agent => agent && agent !== 'and');
  }

  extractTasks(match) {
    return match[3] || match[2] || 'coordinate implementation';
  }

  stageWorkflow(workflow) {
    this.stagedWorkflows.set(workflow.id, workflow);
    console.log('📋 Workflow Staged:', workflow.id);
    return workflow;
  }

  getStagedWorkflows() {
    return Array.from(this.stagedWorkflows.values());
  }

  getWorkflow(id) {
    return this.stagedWorkflows.get(id);
  }
}

module.exports = new ElenaWorkflowDetection();