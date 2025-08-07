import fs from 'fs';
import path from 'path';

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
      console.log('📋 TASKS:');
      workflow.steps.forEach(step => {
        console.log(`  - ${step.agentName}: ${step.taskDescription.slice(0, 50)}...`);
      });
      
      // Test if restart_workflow would find this
      console.log('\n🎯 RESTART_WORKFLOW TOOL WOULD EXECUTE:');
      console.log('1. Find workflow by name/ID');
      console.log('2. Execute each step with agents');
      console.log('3. Coordinate file modifications');
      console.log('4. Return success/failure status');
      
      return true;
    } else {
      console.log('❌ WORKFLOW NOT FOUND');
      console.log('Available workflows:', Object.keys(workflowData.workflows));
      return false;
    }
  } catch (error) {
    console.log('❌ TEST ERROR:', error.message);
    return false;
  }
}

testWorkflowExecution();
