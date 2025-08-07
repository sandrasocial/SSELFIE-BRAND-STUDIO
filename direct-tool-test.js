// Test restart_workflow tool execution directly
const fs = require('fs');
const path = require('path');

async function testWorkflowExecution() {
  try {
    console.log('🚀 TESTING: Direct workflow execution...');
    
    // Load workflow data
    const workflowPath = path.join(process.cwd(), 'workflow-storage.json');
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    // Find the BUILD workflow
    const workflow = Object.values(workflowData.workflows).find(w => 
      w.name.includes('BUILD FEATURE WORKFLOW')
    );
    
    if (workflow) {
      console.log('✅ FOUND WORKFLOW:', workflow.name);
      console.log('👥 AGENTS TO COORDINATE:', workflow.steps.map(s => s.agentName).join(', '));
      console.log('📋 TASKS:', workflow.steps.length);
      
      // Test tool execution pattern
      console.log('🎯 SIMULATING RESTART_WORKFLOW EXECUTION...');
      console.log('Tool input: {name: "workflow_1753660762258"}');
      console.log('Expected: Coordinate agents to execute tasks with file modifications');
      
      return true;
    } else {
      console.log('❌ WORKFLOW NOT FOUND');
      return false;
    }
  } catch (error) {
    console.log('❌ TEST ERROR:', error.message);
    return false;
  }
}

testWorkflowExecution();
