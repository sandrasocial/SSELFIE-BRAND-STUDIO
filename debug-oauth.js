// EMERGENCY OAUTH DEBUG SCRIPT
// Run this to test OAuth configuration outside the main app

const client = require('openid-client');

async function debugOAuth() {
  try {
    console.log('🔍 Testing OAuth configuration...');
    
    const issuerUrl = process.env.ISSUER_URL || 'https://replit.com/oidc';
    const clientId = process.env.REPL_ID;
    const domains = process.env.REPLIT_DOMAINS;
    
    console.log('Environment check:');
    console.log('- ISSUER_URL:', issuerUrl);
    console.log('- REPL_ID:', clientId ? 'Present' : 'MISSING');
    console.log('- REPLIT_DOMAINS:', domains);
    
    if (!clientId) {
      throw new Error('REPL_ID environment variable is missing');
    }
    
    console.log('\n🔍 Testing OIDC discovery...');
    const config = await client.discovery(new URL(issuerUrl), clientId);
    
    console.log('✅ OIDC Discovery successful');
    console.log('- Token endpoint:', config.token_endpoint);
    console.log('- Authorization endpoint:', config.authorization_endpoint);
    console.log('- Issuer:', config.issuer.href);
    
    return config;
    
  } catch (error) {
    console.error('❌ OAuth configuration error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

if (require.main === module) {
  debugOAuth()
    .then(() => console.log('\n✅ OAuth configuration is valid'))
    .catch(() => process.exit(1));
}

module.exports = { debugOAuth };