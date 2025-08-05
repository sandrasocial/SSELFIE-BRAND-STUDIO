/**
 * TEST AGENT CODE GENERATION CONNECTION
 * Verify that agents can now generate actual code in files
 */

const testAgentCodeGeneration = async () => {
  console.log('🧪 TESTING: Agent Code Generation Connection');
  
  try {
    const response = await fetch('http://localhost:5000/api/consulting-agents/consulting-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sandra-admin-2025'
      },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Please create a simple React component called TestButton that shows a blue button with "Click Me" text',
        conversationId: 'test-code-gen-001'
      })
    });
    
    const data = await response.json();
    console.log('📝 AGENT RESPONSE:', data.response.substring(0, 300) + '...');
    
    // Check if file was actually created
    setTimeout(async () => {
      try {
        const fileCheck = await fetch('/api/admin-tools/file-check', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer sandra-admin-2025' },
          body: JSON.stringify({ path: 'client/src/components' })
        });
        
        const files = await fileCheck.json();
        console.log('📁 FILES CREATED:', files);
        
        if (files.includes('TestButton.tsx')) {
          console.log('✅ SUCCESS: Agent successfully created file via orchestrator!');
        } else {
          console.log('❌ FAILED: File not found - connection needs debugging');
        }
      } catch (error) {
        console.log('🔍 FILE CHECK: ' + error.message);
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
};

// Run test
testAgentCodeGeneration();