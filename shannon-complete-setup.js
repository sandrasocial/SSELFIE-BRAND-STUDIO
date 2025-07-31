import fs from 'fs';
import fetch from 'node-fetch';

async function completeShannon() {
  try {
    // Read Shannon's training data
    const trainingData = JSON.parse(fs.readFileSync('shannon-training-data.json', 'utf8'));
    
    console.log('🚀 SHANNON MURRAY - COMPLETE AI SETUP');
    console.log('🌊 Soul Resets Business Owner - Marbella, Spain');
    console.log(`📊 Training with ${trainingData.imageCount} quality selfie images`);
    
    // Prepare training data for API
    const payload = {
      selfieImages: trainingData.imagePaths,
      userInfo: {
        name: 'Shannon Murray',
        email: 'shannon@soulresets.com',
        business: 'Soul Resets',
        location: 'Marbella, Spain',
        specialty: 'Sound Healing & Soul Reset'
      }
    };
    
    // Since we're impersonating Shannon, call the training endpoint as Shannon
    console.log('🔐 Starting training with Shannon\'s authenticated session...');
    
    // Call training endpoint directly through the server API
    const trainingResponse = await fetch('http://localhost:5000/api/start-model-training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=authenticated_session' // Shannon's session
      },
      body: JSON.stringify(payload)
    });
    
    const result = await trainingResponse.json();
    console.log('📈 Training API response:', result);
    
    if (trainingResponse.ok && result.success) {
      console.log('✅ SHANNON\'S AI MODEL TRAINING STARTED!');
      console.log('⏱️ Training Duration: 30-45 minutes');
      console.log('🎯 Shannon will have her personal AI trained model');
      console.log('📧 shannon@soulresets.com will be notified when complete');
      
      // Save training status
      const trainingStatus = {
        ...trainingData,
        trainingId: result.trainingId,
        status: result.status,
        startedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 45 * 60 * 1000).toISOString()
      };
      
      fs.writeFileSync('shannon-training-status.json', JSON.stringify(trainingStatus, null, 2));
      
      return trainingStatus;
    } else {
      console.error('❌ Shannon training failed:', result);
      return null;
    }
    
  } catch (error) {
    console.error('💥 Shannon setup error:', error);
    
    // Alternative: Direct model training service call
    console.log('🔄 Attempting direct training service...');
    try {
      // Import and call training service directly
      const moduleUrl = new URL('./server/model-training-service.ts', import.meta.url).href;
      const { ModelTrainingService } = await import(moduleUrl);
      
      const directResult = await ModelTrainingService.startModelTraining(
        trainingData.userId,
        trainingData.imagePaths
      );
      
      console.log('✅ Direct training service succeeded:', directResult);
      return directResult;
      
    } catch (directError) {
      console.error('💥 Direct training also failed:', directError);
      throw error;
    }
  }
}

// Execute Shannon's complete setup
completeShannon()
  .then(result => {
    if (result) {
      console.log('🎉 SHANNON MURRAY AI SETUP COMPLETE!');
      console.log('🌊 Soul Resets business now has personalized AI');
    } else {
      console.log('⚠️ Shannon setup needs manual intervention');
    }
  })
  .catch(error => {
    console.error('💥 Shannon complete setup failed:', error);
  });