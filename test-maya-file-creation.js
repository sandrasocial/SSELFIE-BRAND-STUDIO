/**
 * TEST: Maya Agent File Creation Flow
 * Simulates exactly what happens when you ask Maya to create a component
 */

async function testMayaFileCreation() {
  console.log('🧪 TESTING MAYA FILE CREATION FLOW');
  console.log('='*50);
  
  try {
    // Simulate asking Maya to create a component
    const response = await fetch('http://localhost:5000/api/agent-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-test' // Admin user
      },
      body: JSON.stringify({
        agentId: 'maya',
        message: `Maya, I need you to create a simple React component for testing. Can you create a file called "TestComponent.tsx" in the client/src/components folder? Make it a basic component that displays "Hello from Maya!"

Please use the FILE_CREATE action to actually create this file in Replit.

FILE_CREATE: {
  "path": "client/src/components/TestComponent.tsx",
  "content": "import React from 'react';\n\nexport const TestComponent: React.FC = () => {\n  return (\n    <div className=\"p-4\">\n      <h2>Hello from Maya!</h2>\n      <p>This component was created by Maya AI agent.</p>\n    </div>\n  );\n};\n\nexport default TestComponent;",
  "description": "React component created by Maya for testing"
}`
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Maya responded successfully');
      console.log('Response:', result.message.substring(0, 200) + '...');
      
      // Check if Maya actually created the file
      const fs = await import('fs/promises');
      const path = await import('path');
      
      try {
        const testFilePath = path.default.join(process.cwd(), 'client/src/components/TestComponent.tsx');
        const content = await fs.default.readFile(testFilePath, 'utf-8');
        console.log('✅ FILE FOUND! Maya successfully created TestComponent.tsx');
        console.log('File content length:', content.length);
        return true;
      } catch (fileError) {
        console.log('❌ FILE NOT FOUND: Maya responded but did not create the file');
        console.log('This means the agent response system is not triggering file creation');
        return false;
      }
      
    } else {
      console.log('❌ Maya request failed:', response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testMayaFileCreation().then(success => {
  if (success) {
    console.log('\n🎉 MAYA FILE CREATION IS WORKING!');
    console.log('Check client/src/components/TestComponent.tsx in Replit');
  } else {
    console.log('\n💥 MAYA FILE CREATION IS NOT WORKING');
    console.log('Agent responses are not triggering actual file creation');
    console.log('The AgentCodebaseIntegration system exists but is not being called');
  }
  process.exit(0);
});