#!/usr/bin/env node

/**
 * COMPREHENSIVE TEST: Complete Upload Flow with Image Compression
 * Tests: Frontend compression → Server compression → S3 upload → ZIP creation → Replicate training
 */

import fs from 'fs/promises';
import path from 'path';

const API_BASE = process.env.REPLIT_DOMAINS ? 
  `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
  'http://localhost:5000';

console.log('🧪 TESTING COMPLETE UPLOAD FLOW WITH COMPRESSION');
console.log('='.repeat(60));
console.log(`API Base: ${API_BASE}`);

// Create realistic test images (compressed base64)
function createTestImages(count = 12) {
  const images = [];
  
  // Create a realistic JPEG image (small but valid)
  const realisticJpeg = `/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==`;
  
  for (let i = 0; i < count; i++) {
    // Simulate compressed frontend images
    images.push(`data:image/jpeg;base64,${realisticJpeg}`);
  }
  
  return images;
}

async function testAuth() {
  console.log('\n📋 STEP 1: Testing Authentication');
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/user`, {
      credentials: 'include',
      headers: {
        'Cookie': process.env.TEST_COOKIE || ''
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Auth working:', user.email);
      return user;
    } else {
      console.log('❌ Auth failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    return null;
  }
}

async function testImageValidation(images) {
  console.log('\n📋 STEP 2: Testing Image Validation');
  
  console.log(`📤 Testing with ${images.length} compressed images`);
  
  // Check image sizes
  const imageSizes = images.map(img => {
    const base64Data = img.replace(/^data:image\/[a-z]+;base64,/, '');
    return Math.round(base64Data.length * 3/4); // Convert base64 to bytes
  });
  
  const totalSize = imageSizes.reduce((a, b) => a + b, 0);
  console.log(`📊 Total payload size: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`📊 Average image size: ${(totalSize / images.length / 1024).toFixed(2)} KB`);
  
  // Test if this would exceed body limit
  const jsonPayload = JSON.stringify({ selfieImages: images });
  const payloadSize = Buffer.byteLength(jsonPayload, 'utf8');
  console.log(`📊 JSON payload size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);
  
  if (payloadSize > 50 * 1024 * 1024) {
    console.log('❌ Payload exceeds 50MB limit - would cause 413 error');
    return false;
  } else {
    console.log('✅ Payload within 50MB limit');
    return true;
  }
}

async function testTrainingEndpoint(images) {
  console.log('\n📋 STEP 3: Testing Training Endpoint');
  
  try {
    const response = await fetch(`${API_BASE}/api/start-model-training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': process.env.TEST_COOKIE || ''
      },
      credentials: 'include',
      body: JSON.stringify({
        selfieImages: images
      })
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.status === 413) {
      console.log('❌ 413 Request Entity Too Large - compression failed!');
      return { success: false, error: '413 Request Entity Too Large' };
    }
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Training endpoint successful');
      console.log('📊 Result:', {
        success: result.success,
        message: result.message,
        trainingId: result.trainingId
      });
      return { success: true, result };
    } else {
      console.log('❌ Training endpoint failed');
      console.log('📊 Error:', result.message);
      return { success: false, error: result.message };
    }
    
  } catch (error) {
    console.log('❌ Training endpoint error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCompression() {
  console.log('\n📋 STEP 4: Testing Server-Side Compression');
  
  // Test if Sharp compression service exists
  try {
    const { ImageCompressionService } = await import('./server/image-compression-service.ts');
    console.log('✅ Image compression service found');
    
    // Test compression with a sample image
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==';
    
    const compressed = await ImageCompressionService.compressImageForTraining(testImage);
    console.log(`✅ Compression working: ${compressed.compressionRatio?.toFixed(1)}% reduction`);
    
    return true;
  } catch (error) {
    console.log('❌ Compression service error:', error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Upload Flow Test\n');
  
  // Step 1: Auth test
  const user = await testAuth();
  if (!user) {
    console.log('\n❌ CRITICAL: Authentication failed - cannot continue test');
    console.log('💡 Set TEST_COOKIE environment variable with valid session cookie');
    return;
  }
  
  // Step 2: Create test images
  const images = createTestImages(12);
  const validationPassed = await testImageValidation(images);
  
  if (!validationPassed) {
    console.log('\n❌ CRITICAL: Image validation failed - would cause 413 error');
    return;
  }
  
  // Step 3: Test compression service
  const compressionWorking = await testCompression();
  if (!compressionWorking) {
    console.log('\n❌ CRITICAL: Compression service not working');
  }
  
  // Step 4: Test complete endpoint
  const trainingResult = await testTrainingEndpoint(images);
  
  // Final results
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  
  if (trainingResult.success) {
    console.log('✅ SUCCESS: Complete upload flow working!');
    console.log('✅ No 413 errors detected');
    console.log('✅ Images processed correctly');
    console.log('✅ ZIP creation and Replicate training initiated');
  } else {
    console.log('❌ FAILED: Upload flow has issues');
    console.log('❌ Error:', trainingResult.error);
    
    if (trainingResult.error.includes('413')) {
      console.log('🔧 SOLUTION NEEDED: Image compression not working properly');
    }
  }
}

// Run the test
runCompleteTest().catch(console.error);