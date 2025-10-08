#!/usr/bin/env node

/**
 * High Level API Connection Test
 * 
 * Quick test script to validate your High Level API key and connection
 * Run: node test-highlevel-connection.js
 */

import { config } from 'dotenv';
import { HighLevelService } from './server/services/highlevel-service.js';

// Load environment variables
config();

async function testHighLevelConnection() {
  console.log('🔗 Testing High Level API Connection...\n');

  const apiKey = process.env.HIGHLEVEL_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: HIGHLEVEL_API_KEY not found in .env file');
    console.log('💡 Please add your High Level API key to your .env file:');
    console.log('   HIGHLEVEL_API_KEY=your_actual_api_key_here\n');
    process.exit(1);
  }

  console.log(`✅ API Key found: ***${apiKey.slice(-4)}`);

  try {
    const highLevelService = new HighLevelService(apiKey);
    
    // Test 1: Create a test contact
    console.log('\n📋 Testing contact creation...');
    const contactResult = await highLevelService.createContact(
      'test@sselfie.studio', 
      'SSELFIE Test User'
    );
    
    console.log('✅ Contact creation test:', contactResult.success ? 'PASSED' : 'FAILED');
    if (contactResult.success) {
      console.log(`   Contact ID: ${contactResult.contactId}`);
    }

    // Test 2: Create a test funnel
    console.log('\n🎯 Testing funnel creation...');
    const funnelResult = await highLevelService.createFunnel(
      'SSELFIE Studio Test Funnel',
      '<h1>Welcome to Our Test Landing Page</h1><p>This is a test funnel created by SSELFIE Studio.</p>',
      '<h1>Thank You!</h1><p>Your submission was successful.</p>'
    );
    
    console.log('✅ Funnel creation test:', funnelResult.success ? 'PASSED' : 'FAILED');
    if (funnelResult.success) {
      console.log(`   Funnel ID: ${funnelResult.funnelId}`);
      console.log(`   Landing Page: ${funnelResult.data.landingPageUrl}`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('💡 Your SSELFIE Studio app is now connected to High Level!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check that your HIGHLEVEL_API_KEY is correct');
    console.log('2. Ensure your High Level account has API access enabled');
    console.log('3. Verify the API key has the necessary permissions');
    console.log('4. Check High Level API documentation for any changes');
  }
}

// Run the test
testHighLevelConnection();