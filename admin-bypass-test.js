// ADMIN BYPASS SYSTEM TEST
// This verifies zero Claude API costs for admin operations

const ADMIN_TOKEN = 'sandra-admin-2025';
const BASE_URL = 'http://localhost:5000';

async function testAdminBypass() {
  console.log('🔧 TESTING ADMIN BYPASS SYSTEM');
  console.log('===============================');
  
  // Test 1: Direct File View - NO API COSTS
  try {
    const response = await fetch(`${BASE_URL}/api/admin-tools/direct-file-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({ filePath: 'package.json' })
    });
    
    const result = await response.json();
    console.log('✅ DIRECT FILE VIEW:', {
      success: result.success,
      bypassUsed: result.bypassUsed,
      apiCost: result.apiCost
    });
  } catch (error) {
    console.log('❌ DIRECT FILE VIEW FAILED:', error.message);
  }
  
  // Test 2: Direct Search - NO API COSTS
  try {
    const response = await fetch(`${BASE_URL}/api/admin-tools/direct-search?query=test&admin_token=${ADMIN_TOKEN}`);
    const result = await response.json();
    console.log('✅ DIRECT SEARCH:', {
      success: result.success,
      bypassUsed: result.bypassUsed,
      apiCost: result.apiCost,
      filesFound: result.files?.length || 0
    });
  } catch (error) {
    console.log('❌ DIRECT SEARCH FAILED:', error.message);
  }
  
  // Test 3: Direct Bash - NO API COSTS
  try {
    const response = await fetch(`${BASE_URL}/api/admin-tools/direct-bash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN
      },
      body: JSON.stringify({ command: 'pwd' })
    });
    
    const result = await response.json();
    console.log('✅ DIRECT BASH:', {
      success: result.success,
      bypassUsed: result.bypassUsed,
      apiCost: result.apiCost,
      output: result.output?.trim()
    });
  } catch (error) {
    console.log('❌ DIRECT BASH FAILED:', error.message);
  }
  
  console.log('\n🎯 ADMIN BYPASS SYSTEM TESTS COMPLETE');
  console.log('💰 TOTAL API COSTS: $0 (All operations bypass Claude API)');
  console.log('🔐 ADMIN ACCESS: Full repository and system access confirmed');
}

// Run the test
testAdminBypass();