// Direct test to verify Zara can create files
import fetch from 'node-fetch';
import * as fs from 'fs/promises';

async function testZaraFileCreation() {
  console.log('🧪 Testing Zara file creation directly...');
  
  const testFilePath = 'zara-real-test-file.txt';
  
  // Remove file if it exists
  try {
    await fs.unlink(testFilePath);
    console.log('Cleaned up existing test file');
  } catch {}
  
  const response = await fetch('http://localhost:5000/api/admin/agents/consulting-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agentId: 'zara',
      message: `Please use the str_replace_based_edit_tool to create a file. Use these exact parameters: command="create", path="${testFilePath}", file_text="This is a REAL file created by Zara using ACTUAL Replit tools!\nCreated at: ${new Date().toISOString()}"`,
      conversationId: `direct-test-${Date.now()}`,
      userId: '42585527',
      adminToken: 'sandra-admin-2025'
    })
  });

  if (response.ok) {
    console.log('✅ Request sent to Zara');
    const text = await response.text();
    
    // Extract tool execution from streaming response
    if (text.includes('str_replace_based_edit_tool')) {
      console.log('✅ Tool execution detected in response');
    }
    
    // Wait for file creation
    console.log('⏳ Waiting 5 seconds for file creation...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if file exists
    try {
      const content = await fs.readFile(testFilePath, 'utf8');
      console.log('');
      console.log('=' .repeat(60));
      console.log('✅✅✅ SUCCESS: FILE ACTUALLY CREATED BY ZARA! ✅✅✅');
      console.log('=' .repeat(60));
      console.log('File path:', testFilePath);
      console.log('File content:');
      console.log(content);
      console.log('=' .repeat(60));
      console.log('');
      console.log('🎉 ADMIN AGENTS ARE USING REAL TOOLS!');
      return true;
    } catch (error) {
      console.log('');
      console.log('=' .repeat(60));
      console.log('❌❌❌ FAILURE: File was not created ❌❌❌');
      console.log('=' .repeat(60));
      console.log('File path checked:', testFilePath);
      console.log('Error:', error);
      console.log('');
      console.log('⚠️ AGENTS ARE STILL SIMULATING TOOLS!');
      return false;
    }
  } else {
    console.log('❌ Request failed:', response.status);
    const error = await response.text();
    console.log('Error:', error);
    return false;
  }
}

testZaraFileCreation().catch(console.error);