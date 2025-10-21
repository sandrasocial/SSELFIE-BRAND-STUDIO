/**
 * Authentication Debugging Utilities
 * Use these functions to diagnose Stack Auth token issues
 */

export function debugStackAuthState() {
  console.log('🔍 === STACK AUTH DEBUG ===');
  
  // Check cookies
  console.log('🍪 Cookies:');
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && (name.toLowerCase().includes('stack') || name.toLowerCase().includes('auth'))) {
      console.log(`  ${name}: ${value?.substring(0, 50)}...`);
    }
  });
  
  // Check localStorage
  console.log('💾 LocalStorage (Stack Auth related):');
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('stack') || key.toLowerCase().includes('auth')) {
      const value = localStorage.getItem(key);
      console.log(`  ${key}: ${value?.substring(0, 50)}...`);
    }
  });
  
  // Check sessionStorage
  console.log('📝 SessionStorage (Stack Auth related):');
  Object.keys(sessionStorage).forEach(key => {
    if (key.toLowerCase().includes('stack') || key.toLowerCase().includes('auth')) {
      const value = sessionStorage.getItem(key);
      console.log(`  ${key}: ${value?.substring(0, 50)}...`);
    }
  });
  
  // Check window globals
  console.log('🌍 Window globals (Stack Auth related):');
  Object.keys(window).forEach(key => {
    if (key.toLowerCase().includes('stack') || key.toLowerCase().includes('auth')) {
      console.log(`  ${key}: ${typeof (window as any)[key]}`);
    }
  });
}

export function extractTokenFromCookies(): string | null {
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    
    if (!name || !value) continue;
    
    const decodedValue = decodeURIComponent(value);
    
    // Try parsing as JSON array (Stack Auth format)
    if (decodedValue.startsWith('[')) {
      try {
        const parsed = JSON.parse(decodedValue);
        if (Array.isArray(parsed) && parsed.length >= 2 && typeof parsed[1] === 'string') {
          const token = parsed[1];
          if (token.split('.').length === 3) {
            console.log(`✅ Found token in cookie: ${name}`);
            return token;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Try direct JWT
    if (decodedValue.split('.').length === 3) {
      console.log(`✅ Found JWT token in cookie: ${name}`);
      return decodedValue;
    }
  }
  
  return null;
}

export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format');
      return null;
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    console.log('🔓 JWT Payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ Failed to decode JWT:', error);
    return null;
  }
}

export function testTokenExtraction() {
  console.log('🧪 Testing token extraction...');
  
  const token = extractTokenFromCookies();
  if (token) {
    console.log('✅ Token found:', token.substring(0, 50) + '...');
    decodeJWT(token);
  } else {
    console.error('❌ No token found in cookies');
    debugStackAuthState();
  }
}

export function testAPICall(endpoint: string = '/api/me') {
  console.log(`🧪 Testing API call to ${endpoint}...`);
  
  const token = extractTokenFromCookies();
  if (!token) {
    console.error('❌ No token available');
    return;
  }
  
  fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-stack-access-token': token,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
    .then(res => {
      console.log(`📊 Response status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log('✅ API Response:', data);
    })
    .catch(error => {
      console.error('❌ API Error:', error);
    });
}

// Export all functions for console access
if (typeof window !== 'undefined') {
  (window as any).__authDebug = {
    debugStackAuthState,
    extractTokenFromCookies,
    decodeJWT,
    testTokenExtraction,
    testAPICall
  };
  
  console.log('🔧 Auth debug tools available at window.__authDebug');
}

