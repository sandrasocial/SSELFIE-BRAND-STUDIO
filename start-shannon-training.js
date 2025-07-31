import fs from 'fs';
import fetch from 'node-fetch';

async function startShannonTraining() {
  try {
    // Read Shannon's training data
    const trainingData = JSON.parse(fs.readFileSync('shannon-training-data.json', 'utf8'));
    
    console.log('🚀 Starting Shannon\'s model training...');
    console.log(`📊 Training with ${trainingData.imageCount} images`);
    
    // Create training request payload
    const trainingPayload = {
      selfieImages: trainingData.imagePaths,
      userId: trainingData.userId
    };
    
    // Start training via authenticated API call
    const response = await fetch('http://localhost:5000/api/start-model-training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'sandra-admin-2025'  // Admin token for training
      },
      body: JSON.stringify(trainingPayload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Shannon training started successfully!');
      console.log('📈 Training details:', result);
    } else {
      console.error('❌ Training failed:', result);
    }
    
    return result;
    
  } catch (error) {
    console.error('💥 Error starting Shannon training:', error);
    throw error;
  }
}

// Run the training
startShannonTraining()
  .then(result => {
    console.log('🎉 Shannon training initiated:', result.success ? 'SUCCESS' : 'FAILED');
  })
  .catch(error => {
    console.error('💥 Training setup failed:', error);
  });