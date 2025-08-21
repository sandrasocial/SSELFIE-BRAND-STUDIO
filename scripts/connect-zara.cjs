// Direct connection to Zara for performance optimization coordination
const fetch = require('node-fetch');

async function coordinateWithZara() {
  console.log('🔧 Coordinating with Zara for performance optimization...');
  
  try {
    const response = await fetch('http://localhost:5000/api/consulting-agents/admin/consulting-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        agentId: 'zara',
        message: 'COORDINATION UPDATE: Sandra has approved continuing your performance optimization work. Current status: Server stable on port 5000, React fixes complete, new bundle index-BBHDTC63.js deployed. Please continue with your HIGH priority performance analysis - implement the build optimizations, server-side improvements, and chunk splitting you identified. Focus on: 1) Bundle size optimization 2) Server performance tuning 3) Deployment readiness. Start implementation immediately.',
        conversationId: 'zara-performance-optimization-' + Date.now(),
        adminToken: 'sandra-admin-2025'
      })
    });

    if (!response.ok) {
      throw new Error(`Connection failed: ${response.status}`);
    }

    console.log('✅ Zara coordination active - streaming optimization work...');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim()) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                process.stdout.write(parsed.content);
              }
              if (parsed.type === 'tool_use') {
                console.log(`\n🔧 Zara using tool: ${parsed.name}\n`);
              }
            } catch (e) {
              // Skip non-JSON lines
            }
          }
        }
      }
    }
    
    console.log('\n\n✅ Zara performance optimization coordination complete');
    
  } catch (error) {
    console.error('❌ Failed to coordinate with Zara:', error.message);
    console.log('Falling back to direct implementation...');
    return false;
  }
  
  return true;
}

coordinateWithZara();