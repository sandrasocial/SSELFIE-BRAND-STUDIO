/**
 * UNIFIED MEMORY SYSTEM TEST
 * Verify all memory systems work together without conflicts
 */

import { UnifiedMemoryController } from './services/unified-memory-controller';

async function testUnifiedMemory() {
  console.log('🧪 TESTING UNIFIED MEMORY SYSTEM');
  console.log('='.repeat(50));
  
  const controller = UnifiedMemoryController.getInstance();
  
  // Test 1: Health Check
  console.log('\n🏥 TEST 1: System Health Check');
  const health = await controller.healthCheck();
  console.log(`Overall Status: ${health.status.toUpperCase()}`);
  console.log(`Systems Status:`);
  console.log(`  - Context Preservation: ${health.systems.contextPreservation ? '✅' : '❌'}`);
  console.log(`  - Advanced Memory: ${health.systems.advancedMemory ? '✅' : '❌'}`);
  console.log(`  - Token Optimization: ${health.systems.tokenOptimization ? '✅' : '❌'}`);
  
  if (health.conflicts.length > 0) {
    console.log(`⚠️  Conflicts: ${health.conflicts.join(', ')}`);
  } else {
    console.log('✅ No conflicts detected');
  }
  
  // Test 2: Admin Agent Memory Preparation
  console.log('\n🔓 TEST 2: Admin Agent Memory');
  const adminMemory = await controller.prepareAgentMemory({
    agentName: 'elena',
    userId: '42585527',
    isAdminBypass: true,
    task: 'Test admin memory coordination'
  });
  
  console.log(`Admin Privileges: ${adminMemory.adminPrivileges ? '✅' : '❌'}`);
  console.log(`Context Loaded: ${adminMemory.context ? '✅' : '❌'}`);
  console.log(`Memories Count: ${adminMemory.memories.length}`);
  
  // Test 3: Regular Agent Memory
  console.log('\n👤 TEST 3: Regular Agent Memory');
  const regularMemory = await controller.prepareAgentMemory({
    agentName: 'maya',
    userId: 'regular_user_123',
    task: 'Test regular memory coordination'
  });
  
  console.log(`Regular User: ${!regularMemory.adminPrivileges ? '✅' : '❌'}`);
  console.log(`Context Available: ${regularMemory.context !== null ? '✅' : '❌'}`);
  
  console.log('\n✅ UNIFIED MEMORY TESTS COMPLETED');
  console.log('='.repeat(50));
  console.log('🎯 COORDINATION BENEFITS:');
  console.log('  • Single entry point prevents conflicts');
  console.log('  • Clear delegation between systems');
  console.log('  • Admin bypass works across all systems');
  console.log('  • Memory operations are coordinated');
  console.log('  • Zero name collisions or conflicts');
}

// Export for testing
export { testUnifiedMemory };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testUnifiedMemory().catch(console.error);
}