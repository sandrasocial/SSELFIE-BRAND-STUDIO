// Real-time training monitor for user ID 43782722
const trainingId = '91s9jvvr6hrm80cr0nvam9m38m';
const replicateToken = process.env.REPLICATE_API_TOKEN;

async function checkTrainingStatus() {
  try {
    const response = await fetch(`https://api.replicate.com/v1/trainings/${trainingId}`, {
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`\n🕐 ${timestamp} - Training Status Check:`);
    console.log(`📊 Status: ${data.status}`);
    console.log(`🏷️  Model: ${data.model}`);
    console.log(`🎯 Version: ${data.version || 'N/A'}`);
    
    if (data.logs) {
      console.log(`📝 Recent logs: ${data.logs.slice(-200)}...`);
    }
    
    if (data.status === 'succeeded') {
      console.log(`🎉 TRAINING COMPLETED! Model ready at: ${data.model}`);
      process.exit(0);
    } else if (data.status === 'failed') {
      console.log(`💥 TRAINING FAILED! Error: ${data.error || 'Unknown error'}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.log(`❌ Monitor Error: ${error.message}`);
  }
}

// Check immediately and then every 30 seconds
checkTrainingStatus();
const interval = setInterval(checkTrainingStatus, 30000);

console.log(`🚀 Monitoring training ${trainingId} for user 43782722...`);
console.log(`⏰ Checking every 30 seconds until completion`);