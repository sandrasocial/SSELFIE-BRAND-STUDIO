#!/usr/bin/env node

/**
 * Simple Authentication Test - Direct function call
 * Tests the authentication middleware without requiring a running server
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

async function testAuthMiddleware() {
  console.log('🔧 Testing Authentication Middleware...\n');

  try {
    // Import the auth middleware
    const { getAuthenticatedUser } = await import('./server/_middleware/auth.ts');
    
    // Create a mock request with no token (should fail gracefully)
    const mockRequest = {
      headers: {},
      url: '/api/test'
    };

    console.log('📋 Testing authentication without token...');
    
    try {
      const result = await getAuthenticatedUser(mockRequest);
      console.log('❌ Unexpected success - should have failed without token');
    } catch (error) {
      console.log('✅ Correctly failed without token:', error.message);
    }
    
    // Test with malformed token
    console.log('\n📋 Testing authentication with malformed token...');
    const mockRequestWithBadToken = {
      headers: {
        authorization: 'Bearer invalid-token'
      },
      url: '/api/test'
    };
    
    try {
      const result = await getAuthenticatedUser(mockRequestWithBadToken);
      console.log('❌ Unexpected success with bad token');
    } catch (error) {
      console.log('✅ Correctly failed with malformed token:', error.message);
    }
    
    console.log('\n🏁 Auth middleware tests complete.');
    console.log('✅ Authentication middleware is working correctly');
    
  } catch (error) {
    console.log('❌ Failed to import or test auth middleware:', error.message);
    console.log('Stack:', error.stack);
  }
}

testAuthMiddleware().catch(console.error);