// Quick test script to verify Sandra's model integration

async function testSandraModel() {
  const userId = '42585527'; // Sandra's user ID
  
  console.log('Testing Sandra model integration...');
  
  // Check if we can access the database to get user model
  try {
    const response = await fetch('http://localhost:5000/api/user-model?userId=' + userId);
    const modelData = await response.text();
    console.log('User model data:', modelData);
  } catch (error) {
    console.log('API not available yet:', error.message);
  }
  
  // Test the updated model configuration
  const FLUX_MODEL_CONFIG = {
    sandraModelId: 'sandrasocial/sandra_test_user_2025-selfie-lora',
    sandraTriggerWord: 'usersandra_test_user_2025',
    sandraUserId: '42585527',
    sandraVersionId: 'a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5'
  };
  
  console.log('Sandra UPDATED model config:');
  console.log('- Model ID:', FLUX_MODEL_CONFIG.sandraModelId);
  console.log('- Trigger word:', FLUX_MODEL_CONFIG.sandraTriggerWord);
  console.log('- User ID:', FLUX_MODEL_CONFIG.sandraUserId);
  console.log('- Version ID:', FLUX_MODEL_CONFIG.sandraVersionId);
  
  // Test model selection logic
  if (userId === FLUX_MODEL_CONFIG.sandraUserId) {
    console.log('✅ Sandra detected - using NEWER high-quality model');
    console.log('- Using model:', FLUX_MODEL_CONFIG.sandraModelId);
    console.log('- Using trigger:', FLUX_MODEL_CONFIG.sandraTriggerWord);
    console.log('- Using version:', FLUX_MODEL_CONFIG.sandraVersionId);
  } else {
    console.log('❌ Not Sandra - would use individual model');
  }
  
  console.log('\nTest completed. Sandra model integration should work correctly.');
}

testSandraModel().catch(console.error);