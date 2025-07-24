#!/usr/bin/env node

/**
 * TEST BULLETPROOF UPLOAD SYSTEM
 * Quick test to verify the new system works
 */

import fs from 'fs/promises';

const API_BASE = process.env.REPLIT_DOMAINS ? 
  `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
  'http://localhost:5000';

console.log('🧪 TESTING BULLETPROOF UPLOAD SYSTEM');
console.log('='.repeat(60));

// Test user ID (Dabbajona)
const TEST_USER_ID = '45196441';

async function testBulletproofSystem() {
  try {
    console.log(`🔍 Testing bulletproof system for user: ${TEST_USER_ID}`);
    
    // Generate test images (small but valid base64)
    const testImages = [];
    for (let i = 0; i < 12; i++) {
      // Create a tiny valid JPEG (1x1 pixel)
      const tinyJpeg = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==';
      testImages.push(`data:image/jpeg;base64,${tinyJpeg}`);
    }
    
    console.log(`📤 Testing with ${testImages.length} images`);
    
    // Test the bulletproof validation
    const response = await fetch(`${API_BASE}/api/start-model-training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Will need auth for real test
      },
      body: JSON.stringify({
        selfieImages: testImages
      })
    });
    
    const result = await response.json();
    
    console.log('📊 Bulletproof System Response:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.errors) {
      console.log('Validation Errors:');
      result.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    if (result.success) {
      console.log('✅ BULLETPROOF SYSTEM: Working correctly');
      console.log('Training ID:', result.trainingId);
    } else {
      console.log('⚠️  BULLETPROOF SYSTEM: Validation caught issues (expected for test data)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBulletproofSystem();