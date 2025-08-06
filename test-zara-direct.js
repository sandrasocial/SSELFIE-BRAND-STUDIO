// Direct test to verify Zara can create files
const fetch = require('node-fetch');

async function testZaraFileCreation() {
  console.log('🧪 Testing Zara file creation directly...');
  
  const response = await fetch('http://localhost:5000/api/admin/agents/consulting-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agentId: 'zara',
      message: 'Use str_replace_based_edit_tool with command "create" to create a file at zara-test-file.txt with file_text "This is a test file created by Zara through real tools!"',
      conversationId: `direct-test-${Date.now()}`,
      userId: '42585527',
      adminToken: 'sandra-admin-2025'
    })
  });

  if (response.ok) {
    console.log('✅ Request sent to Zara');
    const text = await response.text();
    console.log('Response preview:', text.substring(0, 300));
    
    // Wait for file creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync('zara-test-file.txt')) {
      const content = fs.readFileSync('zara-test-file.txt', 'utf8');
      console.log('✅ FILE CREATED! Content:', content);
    } else {
      console.log('❌ File not found after waiting');
    }
  } else {
    console.log('❌ Request failed:', response.status);
  }
}

testZaraFileCreation().catch(console.error);
