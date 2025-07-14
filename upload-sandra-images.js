#!/usr/bin/env node

/**
 * SANDRA'S PERSONAL TRAINING IMAGE UPLOAD SCRIPT
 * Downloads and processes Sandra's training images for AI model creation
 */

import fs from 'fs/promises';
import fetch from 'node-fetch';

const SANDRA_TRAINING_IMAGES = [
  {
    url: 'https://i.postimg.cc/x12VBCkc/IMG-5627.jpg',
    description: 'CLOSE-UP, NATURAL LIGHT'
  },
  {
    url: 'https://i.postimg.cc/nzMyq9Ww/IMG-4827.jpg', 
    description: 'PROFILE ANGLE LEFT'
  },
  {
    url: 'https://i.postimg.cc/TPk8yJtD/IMG-4086.jpg',
    description: 'PROFILE ANGLE RIGHT'
  },
  {
    url: 'https://i.postimg.cc/85q0WKMj/IMG-0670.jpg',
    description: 'DIFFERENT EXPRESSION 1'
  },
  {
    url: 'https://i.postimg.cc/bN0BDRJw/IMG-2639.jpg',
    description: 'DIFFERENT EXPRESSION 2'
  },
  {
    url: 'https://i.postimg.cc/KYpVcvY7/IMG-3516.jpg',
    description: 'SITTING-SHOT'
  },
  {
    url: 'https://i.postimg.cc/VLX39871/IMG-3484.jpg',
    description: 'FULL BODY SHOT'
  },
  {
    url: 'https://i.postimg.cc/Hk91mg53/IMG-3168.jpg',
    description: 'FRONT FACING SHOT'
  },
  {
    url: 'https://i.postimg.cc/ZR9QWt9G/IMG-3047-2.png',
    description: 'SMILING SHOT'
  },
  {
    url: 'https://i.postimg.cc/59CG1JWv/IMG-0698.jpg',
    description: 'SHOT OF WHERE I FELT CUTE'
  }
];

const API_BASE = process.env.REPLIT_DOMAINS ? 
  `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
  'http://localhost:5000';

console.log('🎯 SANDRA\'S PERSONAL AI MODEL TRAINING');
console.log('=' .repeat(50));
console.log(`📸 Processing ${SANDRA_TRAINING_IMAGES.length} training images`);

async function downloadImageAsBase64(url, description) {
  try {
    console.log(`  📥 Downloading: ${description}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');
    
    // Determine content type from URL extension
    const contentType = url.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
    const dataUri = `data:${contentType};base64,${base64}`;
    
    console.log(`    ✅ Downloaded: ${(buffer.length / 1024).toFixed(1)}KB`);
    
    return dataUri;
  } catch (error) {
    console.log(`    ❌ Failed: ${error.message}`);
    return null;
  }
}

async function uploadToTrainingService(images) {
  try {
    console.log('\n🚀 Starting AI model training...');
    
    const response = await fetch(`${API_BASE}/api/train-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3AjhSp8dCUwi6jdJnW0tZ5z71YFXuovnpz.%2F6U6aOpOr6kZYVZxZkNIqZJ%2F%2FoXNlN4m5Qeo%2Bv8YwZ8'
      },
      body: JSON.stringify({ images })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('  ✅ Training initiated successfully!');
      console.log(`  🎯 Trigger word: ${result.triggerWord}`);
      console.log(`  📊 Training ID: ${result.trainingId}`);
      console.log(`  ⏱️  Estimated time: 20-30 minutes`);
      return result;
    } else {
      console.log(`  ❌ Training failed: ${result.message || result.error}`);
      return null;
    }
  } catch (error) {
    console.log(`  ❌ Upload error: ${error.message}`);
    return null;
  }
}

async function processTrainingImages() {
  const processedImages = [];
  
  console.log('\n📸 DOWNLOADING TRAINING IMAGES:');
  
  for (const imageInfo of SANDRA_TRAINING_IMAGES) {
    const base64Image = await downloadImageAsBase64(imageInfo.url, imageInfo.description);
    if (base64Image) {
      processedImages.push(base64Image);
    }
  }
  
  console.log(`\n📊 PROCESSING SUMMARY:`);
  console.log(`  ✅ Successfully downloaded: ${processedImages.length}/${SANDRA_TRAINING_IMAGES.length} images`);
  console.log(`  📋 Minimum required: 10 images`);
  console.log(`  🎯 Training requirement: ${processedImages.length >= 10 ? 'MET' : 'NOT MET'}`);
  
  if (processedImages.length >= 10) {
    console.log('\n🎯 All requirements met - proceeding with training...');
    const trainingResult = await uploadToTrainingService(processedImages);
    
    if (trainingResult) {
      console.log('\n🎉 SUCCESS! Sandra\'s AI model training started');
      console.log('🔔 You\'ll receive updates as training progresses');
      console.log('📱 Check your workspace for real-time status updates');
    }
  } else {
    console.log('\n⚠️  Insufficient images for training');
    console.log('   Need at least 10 images, but only got', processedImages.length);
  }
  
  return processedImages;
}

// Execute the training process
processTrainingImages().catch(console.error);