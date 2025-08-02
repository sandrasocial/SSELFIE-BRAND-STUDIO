// Agent Collaboration Monitor - Track Zara and Quinn without interference
const fs = require('fs');

class AgentCollaborationMonitor {
  constructor() {
    this.startTime = Date.now();
    this.agentActions = [];
    this.fileChanges = [];
    this.toolUsage = [];
    this.errors = [];
    this.collaborationEvents = [];
  }

  log(event, agent, details) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      event,
      agent,
      details,
      timeFromStart: Date.now() - this.startTime
    };
    
    console.log(`📊 MONITOR [${agent}]: ${event} - ${JSON.stringify(details)}`);
    
    switch(event) {
      case 'tool_usage':
        this.toolUsage.push(entry);
        break;
      case 'file_change':
        this.fileChanges.push(entry);
        break;
      case 'error':
        this.errors.push(entry);
        break;
      case 'collaboration':
        this.collaborationEvents.push(entry);
        break;
      default:
        this.agentActions.push(entry);
    }
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    
    return {
      monitoring_duration_ms: duration,
      total_actions: this.agentActions.length,
      total_tool_usage: this.toolUsage.length,
      total_file_changes: this.fileChanges.length,
      total_errors: this.errors.length,
      collaboration_events: this.collaborationEvents.length,
      
      agents_active: [...new Set([
        ...this.agentActions.map(a => a.agent),
        ...this.toolUsage.map(a => a.agent),
        ...this.fileChanges.map(a => a.agent)
      ])],
      
      tools_used: [...new Set(this.toolUsage.map(t => t.details.tool))],
      files_modified: [...new Set(this.fileChanges.map(f => f.details.file))],
      
      latest_actions: this.agentActions.slice(-5),
      latest_tools: this.toolUsage.slice(-5),
      latest_files: this.fileChanges.slice(-5),
      all_errors: this.errors
    };
  }

  saveReport() {
    const report = this.generateReport();
    const filename = `agent-collaboration-report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📊 MONITOR: Report saved to ${filename}`);
    return filename;
  }
}

// Export for monitoring
module.exports = { AgentCollaborationMonitor };

// If run directly, start monitoring
if (require.main === module) {
  const monitor = new AgentCollaborationMonitor();
  console.log('📊 AGENT COLLABORATION MONITOR STARTED');
  console.log('🎯 Tracking: Zara and Quinn collaboration without interference');
  
  // Monitor for 30 minutes then generate report
  setTimeout(() => {
    const report = monitor.generateReport();
    console.log('\n📊 FINAL COLLABORATION REPORT:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(report, null, 2));
    monitor.saveReport();
  }, 30 * 60 * 1000); // 30 minutes
}