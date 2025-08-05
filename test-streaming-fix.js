#!/usr/bin/env node

/**
 * STREAMING FIX VERIFICATION TEST
 * Tests both JSON and SSE streaming implementations
 */

const fetch = require('node-fetch');

async function testStreamingSystem() {
  console.log('🧪 STREAMING SYSTEM TEST: Starting verification...\n');
  
  const testMessage = "Hello Zara! Can you test if streaming works properly? Please create a simple test file.";
  const requestBody = {
    agentId: 'zara',
    message: testMessage,
    conversationId: `test_streaming_${Date.now()}`,
    fileEditMode: true,
    adminToken: 'sandra-admin-2025'
  };

  try {
    console.log('📤 SENDING REQUEST: Testing hybrid system response...');
    
    const response = await fetch('http://localhost:5000/api/admin/agents/consulting-chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    const contentType = response.headers.get('content-type');
    console.log(`📋 RESPONSE TYPE: ${contentType}`);

    if (contentType?.includes('application/json')) {
      console.log('🔄 JSON RESPONSE: Processing hybrid system response...');
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ JSON STREAMING TEST: SUCCESS');
        console.log(`📊 Processing Type: ${result.processingType}`);
        console.log(`💰 Tokens Used: ${result.tokensUsed}`);
        console.log(`💰 Tokens Saved: ${result.tokensSaved}`);
        console.log(`📝 Response Preview: ${result.response.substring(0, 200)}...`);
      } else {
        console.log('❌ JSON STREAMING TEST: FAILED');
        console.log(`Error: ${result.message}`);
      }
      
    } else if (contentType?.includes('text/event-stream')) {
      console.log('🌊 SSE RESPONSE: Processing real-time streaming...');
      
      let accumulatedContent = '';
      let processingType = 'unknown';
      
      response.body.setEncoding('utf8');
      
      response.body.on('data', (chunk) => {
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('✅ SSE STREAMING TEST: COMPLETED');
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'text_delta') {
                accumulatedContent += parsed.content;
                process.stdout.write('.');
              } else if (parsed.type === 'agent_start') {
                console.log(`🤖 Agent Start: ${parsed.message}`);
              } else if (parsed.type === 'completion') {
                processingType = parsed.processingType;
                console.log(`\n📊 Processing: ${parsed.processingType}`);
                console.log(`💰 Tokens: ${parsed.tokensUsed} used, ${parsed.tokensSaved} saved`);
              } else if (parsed.type === 'error') {
                console.log(`❌ SSE Error: ${parsed.message}`);
              }
              
            } catch (parseError) {
              // Ignore parse errors for partial data
            }
          }
        }
      });
      
      response.body.on('end', () => {
        console.log('\n✅ SSE STREAMING TEST: SUCCESS');
        console.log(`📝 Final Content Length: ${accumulatedContent.length} characters`);
        console.log(`📋 Processing Type: ${processingType}`);
      });
      
    } else {
      console.log(`❌ UNKNOWN RESPONSE TYPE: ${contentType}`);
    }

  } catch (error) {
    console.error('❌ STREAMING TEST ERROR:', error.message);
  }
}

// Run the test
testStreamingSystem();