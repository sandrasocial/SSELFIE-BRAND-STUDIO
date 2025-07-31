/**
 * Debug script to check Shannon's training status at Replicate
 * Training ID: q4heca1ma5rme0crbyzsw6hx6r
 */

import fetch from 'node-fetch';

async function checkTrainingStatus() {
  const trainingId = 'q4heca1ma5rme0crbyzsw6hx6r';
  
  console.log(`🔍 Checking training status for ID: ${trainingId}`);
  
  try {
    const response = await fetch(`https://api.replicate.com/v1/trainings/${trainingId}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ Replicate API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const trainingData = await response.json();
    console.log('📊 Training Data:', JSON.stringify(trainingData, null, 2));
    
    console.log(`\n🎯 SUMMARY:`);
    console.log(`Status: ${trainingData.status}`);
    console.log(`Progress: ${trainingData.progress || 'N/A'}`);
    console.log(`Created: ${trainingData.created_at}`);
    console.log(`Started: ${trainingData.started_at || 'Not started'}`);
    console.log(`Completed: ${trainingData.completed_at || 'Not completed'}`);
    
    if (trainingData.error) {
      console.log(`❌ Error: ${trainingData.error}`);
    }
    
    if (trainingData.logs) {
      console.log(`📝 Logs: ${trainingData.logs}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking training:', error);
  }
}

checkTrainingStatus();