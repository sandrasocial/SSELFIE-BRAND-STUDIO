/**
 * Vertical Slice Integration Test
 * 
 * Tests the complete image generation workflow end-to-end.
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER_ID = 'test-user-vertical-slice';

interface TestResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
}

async function testVerticalSlice(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Step 1: Test health endpoint
  try {
    const response = await fetch(`${BASE_URL}/vertical-slice/health`);
    const data = await response.json();
    
    results.push({
      step: 'Health Check',
      success: response.ok,
      data: data
    });
  } catch (error) {
    results.push({
      step: 'Health Check',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Step 2: Test Maya chat
  try {
    const response = await fetch(`${BASE_URL}/maya/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I need professional headshots for my business',
        userId: TEST_USER_ID
      })
    });
    
    const data = await response.json();
    
    results.push({
      step: 'Maya Chat',
      success: response.ok && data.conceptCards && data.conceptCards.length > 0,
      data: {
        response: data.response,
        conceptCardsCount: data.conceptCards?.length || 0,
        conversationId: data.conversationId
      }
    });

    // Step 3: Test image generation with first concept card
    if (response.ok && data.conceptCards && data.conceptCards.length > 0) {
      const conceptCard = data.conceptCards[0];
      
      try {
        const genResponse = await fetch(`${BASE_URL}/maya/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conceptCard,
            userId: TEST_USER_ID
          })
        });
        
        const genData = await genResponse.json();
        
        results.push({
          step: 'Image Generation',
          success: genResponse.ok && genData.success,
          data: {
            generationId: genData.generationId,
            estimatedTime: genData.estimatedTime
          }
        });
      } catch (error) {
        results.push({
          step: 'Image Generation',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Step 4: Wait and check generated images
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

    try {
      const imagesResponse = await fetch(`${BASE_URL}/user/ai-images?userId=${TEST_USER_ID}`);
      const images = await imagesResponse.json();
      
      results.push({
        step: 'Fetch Generated Images',
        success: imagesResponse.ok,
        data: {
          imagesCount: Array.isArray(images) ? images.length : 0,
          images: Array.isArray(images) ? images.slice(0, 2) : [] // Show first 2 images
        }
      });
    } catch (error) {
      results.push({
        step: 'Fetch Generated Images',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    results.push({
      step: 'Maya Chat',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return results;
}

// Run the test
async function runTest() {
  console.log('🧪 Running Vertical Slice Integration Test...\n');
  
  const results = await testVerticalSlice();
  
  console.log('📊 Test Results:');
  console.log('================\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const result of results) {
    totalTests++;
    if (result.success) passedTests++;
    
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.step}`);
    
    if (result.data) {
      console.log(`   Data:`, JSON.stringify(result.data, null, 2));
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    console.log('');
  }
  
  console.log(`📈 Summary: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Vertical slice is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
  
  // Test workflow summary
  console.log('\n🔄 Workflow Verification:');
  console.log('========================');
  console.log('1. Health Check: Verify API endpoints are available');
  console.log('2. Maya Chat: Send message and receive concept cards');
  console.log('3. Image Generation: Start FLUX generation for concept');
  console.log('4. Fetch Images: Retrieve generated images from database');
  console.log('\nThis demonstrates the complete end-to-end pipeline! 🚀');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().catch(console.error);
}

export { testVerticalSlice, runTest };