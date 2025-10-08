// Simple user check using API calls
async function checkUserStatus() {
  try {
    console.log('🔍 Checking user authentication and model status...');
    
    // Check if user is authenticated properly by calling the auth endpoint
    const authResponse = await fetch('http://localhost:3000/api/me', {
      headers: {
        'Authorization': 'Bearer demo-token'
      }
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('📊 Auth user data:', authData);
    } else {
      console.log('❌ Auth check failed:', authResponse.status);
    }
    
    // Check model status
    const modelResponse = await fetch('http://localhost:3000/api/user-model', {
      headers: {
        'Authorization': 'Bearer demo-token'
      }
    });
    
    if (modelResponse.ok) {
      const modelData = await modelResponse.json();
      console.log('🤖 Model data:', modelData);
    } else {
      console.log('❌ Model check failed:', modelResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error checking user status:', error);
  }
}

checkUserStatus();