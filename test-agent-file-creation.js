/**
 * DIRECT TEST: Can agents actually create files?
 * This will test the exact same file creation system the agents use
 */

import fs from 'fs/promises';
import path from 'path';

async function testAgentFileCreation() {
  console.log('🧪 TESTING AGENT FILE CREATION SYSTEM...');
  
  try {
    // Test 1: Can we create a test component like Maya would?
    const testComponentPath = 'client/src/components/AgentTestComponent.tsx';
    const testComponentCode = `import React from 'react';

export default function AgentTestComponent() {
  return (
    <div className="bg-white p-6">
      <h3 className="text-xl mb-4">Agent Test Component</h3>
      <p className="text-gray-600">
        This component was created by the agent file system test on {new Date().toISOString()}
      </p>
      <div className="mt-4 text-sm text-green-600">
        ✅ If you can see this file, agents CAN create real files!
      </div>
    </div>
  );
}`;

    console.log('📝 Creating test component file...');
    const fullPath = path.join(process.cwd(), testComponentPath);
    await fs.writeFile(fullPath, testComponentCode, 'utf-8');
    console.log('✅ Test component created successfully at:', testComponentPath);
    
    // Test 2: Verify the file was actually written
    console.log('🔍 Verifying file exists...');
    const createdContent = await fs.readFile(fullPath, 'utf-8');
    console.log('✅ File verified - contains:', createdContent.substring(0, 100) + '...');
    
    // Test 3: Test directory permissions
    console.log('🔍 Testing directory access...');
    const componentsDir = 'client/src/components';
    const componentsDirPath = path.join(process.cwd(), componentsDir);
    const files = await fs.readdir(componentsDirPath);
    console.log('✅ Components directory accessible, contains:', files.length, 'files');
    
    console.log('\n🎉 AGENT FILE SYSTEM TEST RESULTS:');
    console.log('✅ Agents CAN write files to the codebase');
    console.log('✅ File system permissions are working');
    console.log('✅ Components directory is accessible');
    console.log('✅ AgentTestComponent.tsx created successfully');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Check if AgentTestComponent.tsx appears in client/src/components/');
    console.log('2. If YES: Agent file system is working');
    console.log('3. If NO: There might be a permission or path issue');
    
    return { success: true, filePath: testComponentPath };
    
  } catch (error) {
    console.error('❌ AGENT FILE SYSTEM TEST FAILED:', error.message);
    console.error('📋 This means agents CANNOT actually modify files');
    return { success: false, error: error.message };
  }
}

testAgentFileCreation();