import fs from 'fs';

async function initiateShannonTraining() {
  try {
    // Read Shannon's training data
    const trainingData = JSON.parse(fs.readFileSync('shannon-training-data.json', 'utf8'));
    
    console.log('🚀 Initiating Shannon\'s AI model training...');
    console.log(`📊 Training with ${trainingData.imageCount} images`);
    console.log('💪 Shannon Murray - Soul Resets Business Owner');
    
    // Call the training service directly
    const { ModelTrainingService } = await import('./server/model-training-service.js');
    
    console.log('🔥 Starting FLUX LoRA training...');
    
    // Start training with Shannon's images
    const result = await ModelTrainingService.startTraining(
      trainingData.userId,
      trainingData.imagePaths
    );
    
    console.log('✅ Shannon training initiated successfully!');
    console.log('📈 Training details:', result);
    
    return result;
    
  } catch (error) {
    console.error('💥 Error initiating Shannon training:', error);
    throw error;
  }
}

// Run the training
initiateShannonTraining()
  .then(result => {
    console.log('🎉 Shannon AI model training started!');
    console.log('⏱️ Training typically takes 30-45 minutes');
    console.log('🔔 Shannon will be notified when complete');
  })
  .catch(error => {
    console.error('💥 Training initiation failed:', error);
  });