/**
 * Direct Claude API Test
 * Test Claude API connection and content generation outside the agent system
 */

import fetch from 'node-fetch';

async function testClaudeAPI() {
  console.log('🧪 TESTING CLAUDE API DIRECTLY...\n');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    return false;
  }
  
  console.log(`🔑 API Key found: ${apiKey.substring(0, 20)}...`);
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: `You are ARIA, a luxury UX/UI specialist. You create complete React components with actual working code.

CRITICAL: Generate COMPLETE, FUNCTIONAL code. Never create empty files or placeholders.`,
        messages: [
          {
            role: 'user',
            content: `Create a complete React component for ServiceSetupWizard.tsx. Include:
1. Complete TypeScript interfaces
2. Working React component with hooks
3. Proper imports
4. Luxury design with Tailwind CSS
5. Times New Roman typography

Generate COMPLETE working code - not placeholders or comments.`
          }
        ]
      }),
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${errorText}`);
      return false;
    }

    const data = await response.json();
    console.log(`📊 Response Structure:`, Object.keys(data));
    
    if (data.content && Array.isArray(data.content) && data.content.length > 0) {
      const content = data.content[0].text || data.content[0].content;
      console.log(`✅ Content Generated: ${content.length} characters`);
      console.log(`📝 Content Preview:`, content.substring(0, 200) + '...');
      
      // Check if it contains actual React code
      const hasReactCode = content.includes('import React') || 
                          content.includes('export function') || 
                          content.includes('interface') ||
                          content.includes('const ');
      
      if (hasReactCode) {
        console.log('🎉 SUCCESS: Claude API generated actual React code!');
        return true;
      } else {
        console.log('⚠️  WARNING: Claude API responded but no React code detected');
        return false;
      }
    } else {
      console.error('❌ No content in Claude API response');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Claude API Test Failed:', error.message);
    return false;
  }
}

// Run the test
testClaudeAPI().then(success => {
  if (success) {
    console.log('\n🎯 CONCLUSION: Claude API is working and can generate code!');
    console.log('💡 The issue is in the agent integration, not the API itself.');
  } else {
    console.log('\n❌ CONCLUSION: Claude API test failed');
    console.log('🔧 Need to check API key or connection issues.');
  }
  process.exit(success ? 0 : 1);
});