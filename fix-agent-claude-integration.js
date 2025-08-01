/**
 * Force agents to use Claude API instead of autonomous workspace system
 */

import fs from 'fs';

async function fixAgentClaudeIntegration() {
  console.log('🔧 FIXING AGENT CLAUDE INTEGRATION...\n');
  
  // The issue: agents are using autonomous workspace system instead of Claude API
  // Solution: Force Claude API usage by modifying the agent route to prioritize Claude
  
  const routeFile = 'server/routes/agent-conversation-routes.ts';
  
  try {
    let content = fs.readFileSync(routeFile, 'utf8');
    
    // Find and replace the autonomous execution with Claude-first approach
    const oldPattern = /\/\/ For all agents, process the message through Claude API/;
    const newCode = `// FORCE CLAUDE API USAGE - NEVER USE AUTONOMOUS WORKSPACE FOR CONTENT GENERATION
    // Agents MUST use Claude API to generate actual code content`;
    
    if (content.includes('// For all agents, process the message through Claude API')) {
      content = content.replace(
        '// For all agents, process the message through Claude API',
        newCode
      );
      
      console.log('✅ Updated Claude API priority comment');
    }
    
    // Also modify the bypass to autonomous system
    if (content.includes('autonomousAgentIntegration.processRequest')) {
      // Add a check to disable autonomous system for file operations
      const bypassDisable = `
    // DISABLE AUTONOMOUS BYPASS FOR FILE OPERATIONS
    // Force Claude API usage for actual content generation
    if (req.body.fileEditMode === true) {
      console.log('🚫 AUTONOMOUS BYPASS DISABLED FOR FILE OPERATIONS');
      // Continue to Claude API instead of autonomous system
    } else {`;
      
      content = content.replace(
        'if (agent.canModifyFiles && req.body.fileEditMode === true) {',
        'if (false) { // DISABLED AUTONOMOUS BYPASS - USE CLAUDE API'
      );
      
      console.log('✅ Disabled autonomous bypass for file operations');
    }
    
    fs.writeFileSync(routeFile, content);
    console.log('✅ Agent route file updated to force Claude API usage');
    
    // Now test with Aria again
    console.log('\n🧪 Testing Aria with Claude API...');
    
    const testResponse = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'sandra-admin-2025'
      },
      body: JSON.stringify({
        agentId: 'aria',
        message: 'ARIA CLAUDE TEST! Create client/src/components/admin/TestClaudeIntegration.tsx with COMPLETE React component code including imports, interfaces, and working implementation. Generate FULL WORKING CODE!',
        fileEditMode: true,
        conversationId: 'aria-claude-test-' + Date.now()
      })
    });
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Aria test response received');
      console.log('📊 Response length:', data.response?.length || 0);
      
      // Check if the file was created with content
      setTimeout(() => {
        try {
          const testFile = fs.readFileSync('client/src/components/admin/TestClaudeIntegration.tsx', 'utf8');
          if (testFile.length > 100) {
            console.log('🎉 SUCCESS! Aria generated actual code content!');
            console.log('📁 File size:', testFile.length, 'characters');
          } else {
            console.log('⚠️  File created but still empty or minimal content');
          }
        } catch (error) {
          console.log('❌ Test file not found or error reading it');
        }
      }, 2000);
      
    } else {
      console.log('❌ Aria test failed');
    }
    
  } catch (error) {
    console.error('❌ Error fixing agent integration:', error.message);
  }
}

// Run the fix
fixAgentClaudeIntegration();