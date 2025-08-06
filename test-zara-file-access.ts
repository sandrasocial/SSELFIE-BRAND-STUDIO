// Test Zara's ability to see all project files
import fetch from 'node-fetch';

async function testZaraFileAccess() {
  console.log('🧪 Testing Zara\'s file access capabilities...\n');
  
  const response = await fetch('http://localhost:5000/api/admin/agents/consulting-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agentId: 'zara',
      message: 'Show me all the files in the project. I want to see the complete directory structure.',
      conversationId: `access-test-${Date.now()}`,
      userId: '42585527',
      adminToken: 'sandra-admin-2025'
    })
  });

  if (response.ok) {
    console.log('✅ Request sent to Zara');
    const text = await response.text();
    
    // Check if Zara used search_filesystem
    if (text.includes('search_filesystem')) {
      console.log('✅ Zara used search_filesystem tool');
    }
    
    // Count how many files were found
    const fileMatches = text.match(/\.ts|\.tsx|\.js|\.jsx|\.json|\.md/g);
    const fileCount = fileMatches ? fileMatches.length : 0;
    
    console.log(`\n📊 Results:`);
    console.log(`Files mentioned: ${fileCount}`);
    
    if (fileCount > 50) {
      console.log('✅ Zara has FULL ACCESS to repository - can see many files!');
    } else if (fileCount > 20) {
      console.log('⚠️ Zara has PARTIAL ACCESS - seeing some files');
    } else {
      console.log('❌ Zara has LIMITED ACCESS - not seeing enough files');
    }
    
    // Check for key directories
    const hasServer = text.includes('server/');
    const hasClient = text.includes('client/');
    const hasShared = text.includes('shared/');
    
    console.log('\nKey directories detected:');
    console.log(`  server/: ${hasServer ? '✅' : '❌'}`);
    console.log(`  client/: ${hasClient ? '✅' : '❌'}`);
    console.log(`  shared/: ${hasShared ? '✅' : '❌'}`);
    
  } else {
    console.log('❌ Request failed:', response.status);
  }
}

testZaraFileAccess().catch(console.error);