// Test Maya Pipeline After Database Optimization
import { Storage } from './server/storage.js';

async function testMayaPipeline() {
  console.log('🧪 Testing Maya Pipeline with Database Optimizations...');
  
  const storage = new Storage();
  
  try {
    // Test user lookup performance
    console.log('\n1. Testing Stack Auth User Lookup Performance...');
    const startUserTime = Date.now();
    
    // Use a real Stack Auth ID from the database 
    const testStackAuthId = 'f7af7b09-6299-4ad8-a915-cdb324d8bfb6'; // Shannon's ID
    const user = await storage.getUserByStackAuthId(testStackAuthId);
    const userLookupTime = Date.now() - startUserTime;
    
    console.log(`   ✅ User lookup completed in ${userLookupTime}ms`);
    console.log(`   👤 Found user: ${user ? user.email : 'Not found'}`);
    
    if (user) {
      // Test model lookup performance 
      console.log('\n2. Testing User Model Lookup Performance...');
      const startModelTime = Date.now();
      
      const model = await storage.getUserModel(user.id);
      const modelLookupTime = Date.now() - startModelTime;
      
      console.log(`   ✅ Model lookup completed in ${modelLookupTime}ms`);
      console.log(`   🤖 Found model: ${model ? `${model.trainingStatus} (${model.triggerWord})` : 'Not found'}`);
      
      // Test direct Stack Auth ID model lookup (new optimized path)
      console.log('\n3. Testing Direct Stack Auth Model Lookup...');
      const startDirectTime = Date.now();
      
      const directModel = await storage.getUserModel(testStackAuthId);
      const directLookupTime = Date.now() - startDirectTime;
      
      console.log(`   ✅ Direct model lookup completed in ${directLookupTime}ms`);
      console.log(`   🔄 Model consistency: ${model?.id === directModel?.id ? 'PASS' : 'FAIL'}`);
    }
    
    // Test performance summary
    console.log('\n📊 Performance Summary:');
    console.log(`   📈 Total user lookup: ${userLookupTime}ms (target: <1000ms)`);
    console.log(`   📈 Total model lookup: ${userLookupTime}ms (target: <1000ms)`);
    console.log(`   🎯 Performance target: ${userLookupTime < 1000 ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('\n🎉 Maya Pipeline Test Complete!');
    
  } catch (error) {
    console.error('❌ Maya Pipeline Test Failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testMayaPipeline()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });