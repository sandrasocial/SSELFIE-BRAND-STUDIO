/**
 * MANUAL TEST: Force Maya chat update for completed generation
 */

import('node:fs').then(async (fs) => {
  // Read the current log file to see what happens when we manually trigger
  console.log('🔍 Testing Maya chat update directly...');
  
  try {
    // Make a request to force completion update (we'll monitor logs)
    const response = await fetch('http://localhost:5000/api/generation-tracker/111', {
      method: 'GET',
      headers: {
        'Cookie': 'session=test-session' // We'll check if this works
      }
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Request failed:', error.message);
  }
});
