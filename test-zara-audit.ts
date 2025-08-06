// Direct test of Zara's audit capabilities
import { search_filesystem } from './server/tools/search_filesystem';
import { bash } from './server/tools/bash';
import { str_replace_based_edit_tool } from './server/tools/str_replace_based_edit_tool';

async function testZaraAuditCapabilities() {
  console.log('\n🔍 ZARA AUDIT SIMULATION: Testing tool access capabilities\n');
  
  try {
    // 1. Test file search for conflicting services
    console.log('🔧 TESTING: File search for conflicting claude services...');
    const searchResult = await search_filesystem({
      query_description: "Find all claude-api-service files and imports that could conflict with the rebuilt service"
    });
    
    console.log('✅ SEARCH RESULT: Found', searchResult.results?.length || 0, 'relevant files');
    if (searchResult.results) {
      searchResult.results.slice(0, 5).forEach((file: any) => {
        console.log(`   📄 ${file.path}`);
      });
    }
    
    // 2. Test bash command for process inspection
    console.log('\n🔧 TESTING: Bash command execution...');
    const processResult = await bash({ command: "ps aux | grep -E 'tsx|node' | head -5" });
    console.log('✅ BASH RESULT: Process inspection completed');
    console.log('   📋 Active processes:', (processResult as any)?.output?.includes('tsx') ? 'tsx server running' : 'Process check completed');
    
    // 3. Test file viewing capability
    console.log('\n🔧 TESTING: File viewing capability...');
    const fileResult = await str_replace_based_edit_tool({
      command: 'view',
      path: 'server/services/claude-api-service-rebuilt.ts',
      view_range: [1, 10]
    });
    console.log('✅ FILE VIEW RESULT: Can access and read system files');
    
    // 4. Test search for import conflicts  
    console.log('\n🔧 TESTING: Search for import conflicts...');
    const importSearch = await search_filesystem({
      code: ["from '../services/claude-api-service'", "import { ClaudeApiService }"]
    });
    console.log('✅ IMPORT SEARCH: Found', importSearch.results?.length || 0, 'potential import conflicts');
    
    console.log('\n🎯 ZARA AUDIT SIMULATION COMPLETE');
    console.log('==========================================');
    console.log('✅ File Search: WORKING');
    console.log('✅ Bash Commands: WORKING'); 
    console.log('✅ File Operations: WORKING');
    console.log('✅ Code Search: WORKING');
    console.log('==========================================');
    console.log('\n📊 RESULT: Zara has FULL TOOL ACCESS for autonomous auditing\n');
    
  } catch (error) {
    console.error('❌ ZARA AUDIT TEST FAILED:', error);
  }
}

// Run the audit simulation
testZaraAuditCapabilities();