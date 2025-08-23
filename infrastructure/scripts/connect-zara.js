// Direct connection script to get Zara's response about what happened
const fetch = require('node-fetch');

async function connectWithZara() {
  console.log('🔧 Connecting with Zara admin agent...');
  
  try {
    const response = await fetch('http://localhost:5000/api/consulting-agents/admin/consulting-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        agentId: 'zara',
        message: 'URGENT: Sandra needs you to explain what happened after Olgas cleanup yesterday. React components were mass-changed, server became unstable, deployment issues. She says everything broke and needs to know: 1) What exactly did Olga do? 2) Why did it cause React import errors? 3) What should we do next to fix this properly? She needs your technical analysis.',
        conversationId: `zara-emergency-${Date.now()}`,
        adminToken: 'sandra-admin-2025'
      })
    });

    if (!response.ok) {
      throw new Error(`Connection failed: ${response.status}`);
    }

    console.log('✅ Connected to Zara - streaming response...');
    
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
            } catch (e) {
              // Skip non-JSON lines
            }
          }
        }
      }
    }
    
    console.log('\n\n✅ Zara response complete');
    
  } catch (error) {
    console.error('❌ Failed to connect with Zara:', error.message);
  }
}

connectWithZara();