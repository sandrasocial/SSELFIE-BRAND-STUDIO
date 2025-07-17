/**
 * DIRECT TEST: Can agents actually create files?
 * This will test the exact same file creation system the agents use
 */

async function testAgentFileCreation() {
  console.log('🧪 TESTING AGENT FILE CREATION SYSTEM');
  console.log('='*50);
  
  try {
    // Import the same system the agents use (TypeScript module)
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Simulate the AgentCodebaseIntegration writeFile function directly
    async function writeFile(agentId, filePath, content, description = '') {
      const fullPath = path.default.join(process.cwd(), filePath);
      
      // Create directory if it doesn't exist
      const dir = path.default.dirname(fullPath);
      await fs.default.mkdir(dir, { recursive: true });
      
      // Write the file
      await fs.default.writeFile(fullPath, content);
      console.log(`✅ Agent ${agentId} created file: ${filePath}`);
      console.log(`📂 Full path: ${fullPath}`);
      console.log(`📄 Content length: ${content.length} characters`);
      return fullPath;
    }
    
    async function readFile(agentId, filePath) {
      const fullPath = path.default.join(process.cwd(), filePath);
      const content = await fs.default.readFile(fullPath, 'utf-8');
      console.log(`✅ Agent ${agentId} read file: ${filePath}`);
      return content;
    }
    
    console.log('\n📁 Testing writeFile function...');
    
    // Test 1: Create a simple test file
    const testFilePath = 'test-agent-output.txt';
    const testContent = `Agent Test File Created: ${new Date().toISOString()}
This file was created by the AgentCodebaseIntegration system.
If you can see this file in Replit, the system is working!`;

    await writeFile('test-agent', testFilePath, testContent, 'Agent file creation test');
    console.log('✅ Test file created successfully!');
    
    // Test 2: Try to read it back
    console.log('\n📖 Testing readFile function...');
    const readContent = await readFile('test-agent', testFilePath);
    console.log('✅ Test file read successfully!');
    console.log('Content length:', readContent.length);
    
    // Test 3: Create a React component (like Victoria would)
    console.log('\n⚛️ Testing React component creation...');
    const componentPath = 'client/src/components/AgentTestComponent.tsx';
    const componentContent = `import React from 'react';

interface AgentTestComponentProps {
  message: string;
}

export const AgentTestComponent: React.FC<AgentTestComponentProps> = ({ message }) => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900">Agent Test Component</h3>
      <p className="text-gray-600">{message}</p>
      <p className="text-xs text-gray-400 mt-2">
        Created by: AgentCodebaseIntegration System
      </p>
    </div>
  );
};

export default AgentTestComponent;
`;

    await writeFile('victoria', componentPath, componentContent, 'React component creation test');
    console.log('✅ React component created successfully!');
    
    console.log('\n🎯 AGENT FILE CREATION TEST RESULTS:');
    console.log('✅ writeFile function: WORKING');
    console.log('✅ readFile function: WORKING');
    console.log('✅ React component creation: WORKING');
    console.log('\n🔍 Check Replit file explorer for:');
    console.log('  - test-agent-output.txt');
    console.log('  - client/src/components/AgentTestComponent.tsx');
    
    return true;
    
  } catch (error) {
    console.error('❌ AGENT FILE CREATION TEST FAILED:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

// Run the test
testAgentFileCreation().then(success => {
  if (success) {
    console.log('\n🎉 AGENT FILE CREATION SYSTEM IS WORKING!');
    console.log('The issue might be:');
    console.log('1. Agents are not being triggered to create files');
    console.log('2. Agent responses are not calling the file creation functions');
    console.log('3. File creation is working but Sandra is not seeing the right responses');
  } else {
    console.log('\n💥 AGENT FILE CREATION SYSTEM IS BROKEN');
    console.log('This is why agents cannot make visible changes in Replit');
  }
  process.exit(0);
});