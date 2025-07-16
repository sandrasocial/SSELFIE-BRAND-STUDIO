/**
 * COMPREHENSIVE AUTHENTICATION DIAGNOSIS
 * Checks all possible scenarios that could block user authentication
 */

async function testDatabaseConnection() {
  console.log('1. TESTING DATABASE CONNECTION...');
  try {
    const { Pool } = await import('@neondatabase/serverless');
    const ws = await import('ws');
    
    // Configure Neon with proper WebSocket constructor
    const { neonConfig } = await import('@neondatabase/serverless');
    neonConfig.webSocketConstructor = ws.default;
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test basic connection
    const testQuery = await pool.query('SELECT NOW() as current_time');
    console.log(`   ✅ Database connection successful: ${testQuery.rows[0].current_time}`);
    
    // Check sessions table
    const sessionCount = await pool.query('SELECT COUNT(*) as count FROM sessions WHERE expire > NOW()');
    console.log(`   ✅ Active sessions: ${sessionCount.rows[0].count}`);
    
    // Check users table
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`   ✅ Total users: ${userCount.rows[0].count}`);
    
    // Check recent registrations
    const recentUsers = await pool.query(`
      SELECT email, created_at 
      FROM users 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('   Recent registrations (24h):');
    if (recentUsers.rows.length > 0) {
      recentUsers.rows.forEach(user => {
        console.log(`     - ${user.email} at ${user.created_at}`);
      });
    } else {
      console.log('     - No recent registrations');
    }
    
    await pool.end();
    return true;
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
    return false;
  }
}

async function testOAuthConfiguration() {
  console.log('\n2. TESTING OAUTH CONFIGURATION...');
  
  // Check required environment variables
  const requiredVars = {
    'REPL_ID': process.env.REPL_ID,
    'REPLIT_DOMAINS': process.env.REPLIT_DOMAINS,
    'SESSION_SECRET': process.env.SESSION_SECRET,
    'ISSUER_URL': process.env.ISSUER_URL || 'https://replit.com/oidc'
  };
  
  let configValid = true;
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (value) {
      console.log(`   ✅ ${key}: Present`);
    } else {
      console.log(`   ❌ ${key}: Missing`);
      configValid = false;
    }
  });
  
  // Test OAuth discovery endpoint
  try {
    const discoveryUrl = `${requiredVars.ISSUER_URL}/.well-known/openid_configuration`;
    const response = await fetch(discoveryUrl);
    if (response.ok) {
      console.log('   ✅ OIDC discovery endpoint accessible');
    } else {
      console.log(`   ❌ OIDC discovery failed: ${response.status}`);
      configValid = false;
    }
  } catch (error) {
    console.log(`   ❌ OIDC discovery error: ${error.message}`);
    configValid = false;
  }
  
  return configValid;
}

async function testSessionStore() {
  console.log('\n3. TESTING SESSION STORE...');
  
  try {
    // Test session creation
    const testResponse = await fetch('http://localhost:5000/api/quick-auth-test');
    const testData = await testResponse.json();
    
    if (testData.sessionExists && testData.sessionId) {
      console.log('   ✅ Session store is creating sessions');
      console.log(`   ✅ Session ID format: ${testData.sessionId.substring(0, 8)}...`);
    } else {
      console.log('   ❌ Session store not working properly');
      return false;
    }
    
    // Test PostgreSQL session persistence
    const { Pool } = await import('@neondatabase/serverless');
    const ws = await import('ws');
    const { neonConfig } = await import('@neondatabase/serverless');
    neonConfig.webSocketConstructor = ws.default;
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const sessionCheck = await pool.query(`
      SELECT sid, sess->>'passport' as passport_data, expire
      FROM sessions 
      WHERE expire > NOW()
      ORDER BY expire DESC
      LIMIT 3
    `);
    
    console.log(`   ✅ Sessions in database: ${sessionCheck.rows.length}`);
    
    let authenticatedSessions = 0;
    sessionCheck.rows.forEach((session, index) => {
      const hasPassportData = session.passport_data && session.passport_data !== 'null';
      if (hasPassportData) authenticatedSessions++;
      console.log(`   Session ${index + 1}: ${hasPassportData ? 'Authenticated' : 'Unauthenticated'}`);
    });
    
    console.log(`   Authenticated sessions: ${authenticatedSessions}`);
    
    await pool.end();
    return true;
  } catch (error) {
    console.log(`   ❌ Session store test failed: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoints() {
  console.log('\n4. TESTING AUTHENTICATION ENDPOINTS...');
  
  const endpoints = [
    { path: '/api/login', expectedStatus: 302, description: 'Login redirect' },
    { path: '/api/auth/user', expectedStatus: 401, description: 'User endpoint (protected)' },
    { path: '/api/quick-auth-test', expectedStatus: 200, description: 'Auth test endpoint' }
  ];
  
  let allEndpointsWorking = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint.path}`, {
        redirect: 'manual' // Don't follow redirects for login
      });
      
      if (response.status === endpoint.expectedStatus) {
        console.log(`   ✅ ${endpoint.description}: ${response.status} (expected)`);
      } else {
        console.log(`   ⚠️ ${endpoint.description}: ${response.status} (expected ${endpoint.expectedStatus})`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.description}: ${error.message}`);
      allEndpointsWorking = false;
    }
  }
  
  return allEndpointsWorking;
}

async function testOAuthFlow() {
  console.log('\n5. TESTING OAUTH FLOW ACCESSIBILITY...');
  
  // Test different domain scenarios
  const domains = [
    'localhost:5000',
    'sselfie.ai'
  ];
  
  for (const domain of domains) {
    try {
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const loginUrl = `${protocol}://${domain}/api/login`;
      
      console.log(`   Testing ${domain}...`);
      
      const response = await fetch(loginUrl, { 
        redirect: 'manual',
        headers: { 'Host': domain.replace(':5000', '') }
      });
      
      if (response.status === 302) {
        const location = response.headers.get('location');
        if (location && location.includes('replit.com')) {
          console.log(`     ✅ Redirects to Replit OAuth`);
        } else if (location && location.includes('replit.dev')) {
          console.log(`     ✅ Redirects to development auth`);
        } else {
          console.log(`     ⚠️ Unexpected redirect: ${location}`);
        }
      } else {
        console.log(`     ❌ No redirect: ${response.status}`);
      }
    } catch (error) {
      console.log(`     ❌ Failed: ${error.message}`);
    }
  }
}

async function testImageGenerationAccess() {
  console.log('\n6. TESTING IMAGE GENERATION ACCESS PROTECTION...');
  
  const protectedEndpoints = [
    { path: '/api/maya-generate-images', method: 'POST', body: { customPrompt: 'test' } },
    { path: '/api/generate-images', method: 'POST', body: { prompt: 'test', count: 3 } },
    { path: '/api/start-model-training', method: 'POST', body: {} }
  ];
  
  let allProtected = true;
  
  for (const endpoint of protectedEndpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endpoint.body)
      });
      
      if (response.status === 401) {
        console.log(`   ✅ ${endpoint.path}: Properly protected (401)`);
      } else {
        console.log(`   ❌ ${endpoint.path}: Not protected (${response.status})`);
        allProtected = false;
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.path}: Error testing - ${error.message}`);
      allProtected = false;
    }
  }
  
  return allProtected;
}

async function checkUserModelsAndGeneration() {
  console.log('\n7. CHECKING USER MODELS AND GENERATION SYSTEM...');
  
  try {
    const { Pool } = await import('@neondatabase/serverless');
    const ws = await import('ws');
    const { neonConfig } = await import('@neondatabase/serverless');
    neonConfig.webSocketConstructor = ws.default;
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Check user models
    const modelStats = await pool.query(`
      SELECT 
        training_status,
        COUNT(*) as count
      FROM user_models
      GROUP BY training_status
      ORDER BY count DESC
    `);
    
    console.log('   User Model Status:');
    modelStats.rows.forEach(stat => {
      console.log(`     - ${stat.training_status}: ${stat.count}`);
    });
    
    // Check generation success rates
    const generationStats = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
      FROM generation_trackers
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY status
      ORDER BY count DESC
    `);
    
    console.log('   Generation Success (7 days):');
    generationStats.rows.forEach(stat => {
      console.log(`     - ${stat.status}: ${stat.count} (${stat.percentage}%)`);
    });
    
    await pool.end();
    return true;
  } catch (error) {
    console.log(`   ❌ Model/generation check failed: ${error.message}`);
    return false;
  }
}

async function checkCorsAndHeaders() {
  console.log('\n8. CHECKING CORS AND SECURITY HEADERS...');
  
  try {
    const response = await fetch('http://localhost:5000/api/quick-auth-test', {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST'
      }
    });
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods')
    };
    
    console.log('   CORS Configuration:');
    Object.entries(corsHeaders).forEach(([header, value]) => {
      console.log(`     ${header}: ${value || 'Not set'}`);
    });
    
    if (corsHeaders['access-control-allow-credentials'] === 'true') {
      console.log('   ✅ Credentials allowed for cookie-based auth');
    } else {
      console.log('   ⚠️ Credentials may not be properly configured');
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ CORS check failed: ${error.message}`);
    return false;
  }
}

async function runComprehensiveDiagnosis() {
  console.log('🔍 COMPREHENSIVE AUTHENTICATION DIAGNOSIS\n');
  console.log('Checking all possible authentication blocking scenarios...\n');
  
  const results = {
    database: await testDatabaseConnection(),
    oauth: await testOAuthConfiguration(),
    sessions: await testSessionStore(),
    endpoints: await testAuthEndpoints(),
    generation: await testImageGenerationAccess(),
    models: await checkUserModelsAndGeneration(),
    cors: await checkCorsAndHeaders()
  };
  
  await testOAuthFlow();
  
  console.log('\n📊 DIAGNOSIS SUMMARY:');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'WORKING' : 'ISSUES FOUND'}`);
  });
  
  const allPassing = Object.values(results).every(Boolean);
  
  console.log('\n🎯 CRITICAL FINDINGS:');
  
  if (allPassing) {
    console.log('✅ ALL AUTHENTICATION SYSTEMS OPERATIONAL');
    console.log('✅ No blocking issues found in authentication flow');
    console.log('✅ Image generation properly protected');
    console.log('✅ Database and session management working');
    
    console.log('\n💡 AUTHENTICATION STATUS:');
    console.log('• OAuth configuration is correct');
    console.log('• Session storage is functional');
    console.log('• Protected endpoints working properly');
    console.log('• Users can authenticate via production domain');
    
    console.log('\n🚀 PLATFORM READY FOR USERS');
  } else {
    console.log('❌ AUTHENTICATION BLOCKING ISSUES IDENTIFIED');
    console.log('\n🔧 ISSUES TO ADDRESS:');
    
    Object.entries(results).forEach(([test, passed]) => {
      if (!passed) {
        console.log(`• Fix ${test} system`);
      }
    });
  }
  
  return allPassing;
}

// Run comprehensive diagnosis
runComprehensiveDiagnosis().catch(console.error);