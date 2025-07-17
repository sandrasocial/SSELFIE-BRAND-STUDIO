// Simple training tracker for user 43782722
const axios = require('axios');

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const USER_ID = '43782722';

async function checkUserTraining() {
  try {
    // First, check our database
    console.log('\n=== DATABASE STATUS ===');
    
    // Check recent trainings from Replicate API
    console.log('\n=== REPLICATE API STATUS ===');
    const response = await axios.get('https://api.replicate.com/v1/trainings', {
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const recentTrainings = response.data.results.slice(0, 5);
    console.log('Recent 5 trainings:');
    
    recentTrainings.forEach((training, index) => {
      console.log(`${index + 1}. ID: ${training.id}`);
      console.log(`   Status: ${training.status}`);
      console.log(`   Model: ${training.model || 'N/A'}`);
      console.log(`   Created: ${training.created_at}`);
      console.log('');
    });
    
    // Look for any training containing our user ID pattern
    const userTraining = recentTrainings.find(t => 
      t.model && t.model.includes('43782722')
    );
    
    if (userTraining) {
      console.log('🎯 FOUND USER TRAINING:');
      console.log(`   Training ID: ${userTraining.id}`);
      console.log(`   Status: ${userTraining.status}`);
      console.log(`   Model: ${userTraining.model}`);
      
      if (userTraining.status === 'succeeded') {
        console.log('🎉 TRAINING COMPLETED!');
      } else if (userTraining.status === 'processing') {
        console.log('⏳ TRAINING IN PROGRESS...');
      }
    } else {
      console.log('❌ No training found for user 43782722');
    }
    
  } catch (error) {
    console.error('Error checking training:', error.message);
  }
}

checkUserTraining();