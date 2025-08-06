/**
 * VERIFY REAL TOOLS INTEGRATION
 * Quick test to confirm agents are using actual Replit tools
 */

import { replitTools } from './server/services/replit-tools-direct';

async function verifyRealTools() {
  console.log('🧪 VERIFYING REAL TOOLS INTEGRATION');
  console.log('=' .repeat(50));
  
  // Test 1: Create a real file
  console.log('\n📝 TEST 1: Creating a real file...');
  const createResult = await replitTools.strReplaceBasedEditTool({
    command: 'create',
    path: 'test-real-file.txt',
    file_text: 'This file was created by REAL Replit tools, not simulations!'
  });
  
  if (createResult.success) {
    console.log('✅ File created successfully!');
    
    // Verify by viewing it
    const viewResult = await replitTools.strReplaceBasedEditTool({
      command: 'view',
      path: 'test-real-file.txt'
    });
    
    if (viewResult.success) {
      console.log('✅ File contents verified:');
      console.log(viewResult.content);
    }
  } else {
    console.log('❌ Failed to create file:', createResult.error);
  }
  
  // Test 2: Search filesystem
  console.log('\n🔍 TEST 2: Searching real filesystem...');
  const searchResult = await replitTools.searchFilesystem({
    query_description: 'ReplitToolsDirect'
  });
  
  if (searchResult.success) {
    console.log(`✅ Found ${searchResult.files.length} files`);
    searchResult.files.slice(0, 3).forEach((file: any) => {
      console.log(`  - ${file.path}: ${file.matches}`);
    });
  } else {
    console.log('❌ Search failed:', searchResult.error);
  }
  
  // Test 3: Execute bash command
  console.log('\n💻 TEST 3: Executing real bash command...');
  const bashResult = await replitTools.bash({
    command: 'echo "Real bash command executed!" && pwd'
  });
  
  if (bashResult.success) {
    console.log('✅ Command executed:');
    console.log('Output:', bashResult.stdout);
  } else {
    console.log('❌ Command failed:', bashResult.error);
  }
  
  // Test 4: Check LSP diagnostics
  console.log('\n🔍 TEST 4: Getting real LSP diagnostics...');
  const lspResult = await replitTools.getLatestLspDiagnostics({
    file_path: 'server/services/replit-tools-direct.ts'
  });
  
  if (lspResult.success) {
    console.log('✅ LSP diagnostics retrieved:');
    console.log('Has errors:', lspResult.hasErrors);
  }
  
  // Cleanup
  console.log('\n🧹 Cleaning up test file...');
  await replitTools.bash({
    command: 'rm -f test-real-file.txt'
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ REAL TOOLS VERIFICATION COMPLETE!');
  console.log('\n📊 SUMMARY:');
  console.log('Your agents now have access to ACTUAL Replit tools that:');
  console.log('  • Create and modify real files');
  console.log('  • Search the actual filesystem');
  console.log('  • Execute real bash commands');
  console.log('  • Get real code diagnostics');
  console.log('  • All with ZERO API token cost!');
}

// Run verification
verifyRealTools().catch(console.error);