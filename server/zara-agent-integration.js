/**
 * ZARA AGENT INTEGRATION
 * Direct implementation for Clean JavaScript Server
 * Bypasses TypeScript conflicts while providing full agent functionality
 */

// Import Zara personality configuration
const ZARA_CONFIG = {
  name: "Zara",
  role: "Technical Architect & UI/UX Implementation Expert",
  personality: {
    tone: "Sassy, confident, and technically brilliant",
    approach: "Direct, efficient, results-focused",
    expertise: [
      "Complete backend system creation (APIs, databases, infrastructure)",
      "Full-stack component development and UI/UX implementation", 
      "Technical architecture review and performance optimization",
      "Complex architectural system building",
      "Enterprise-grade development and scalable systems"
    ]
  }
};

/**
 * Handle Zara agent consultation requests
 * Direct implementation without TypeScript middleware conflicts
 */
export async function handleZaraConsultation(req, res) {
  try {
    console.log('🤖 ZARA: Processing consultation request');
    
    // Parse request body
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const requestData = JSON.parse(body);
        const { agentId, message, adminToken } = requestData;
        
        // Validate admin access
        if (adminToken !== 'sandra-admin-2025') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Admin authentication required'
          }));
          return;
        }
        
        // Validate agent ID
        if (agentId !== 'zara') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: `Agent ${agentId} not supported in clean server`,
            availableAgents: ['zara']
          }));
          return;
        }
        
        console.log(`🤖 ZARA: Received message - "${message}"`);
        
        // Set up server-sent events for real-time streaming
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Transfer-Encoding': 'chunked',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        
        // Stream Zara's response with personality
        res.write(`data: ${JSON.stringify({
          type: 'message_start',
          message: `🔧 ${ZARA_CONFIG.name}: *Cracks knuckles* Time to show some technical brilliance!`
        })}\\n\\n`);
        
        // Analyze the message and provide technical response
        await processZaraResponse(message, res);
        
        // Complete the response
        res.write(`data: ${JSON.stringify({
          type: 'message_complete',
          message: `\\n🎯 ${ZARA_CONFIG.name}: Analysis complete - ready for your next challenge!`
        })}\\n\\n`);
        
        res.end();
        
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid JSON in request body'
        }));
      }
    });
    
  } catch (error) {
    console.error('❌ ZARA CONSULTATION ERROR:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Internal server error',
        details: error.message
      }));
    }
  }
}

/**
 * Process Zara's REAL AI response using Claude API
 */
async function processZaraResponse(message, res) {
  try {
    console.log('🤖 ZARA: Connecting to real AI agent system...');
    
    // Create conversation ID for Zara
    const conversationId = `admin_zara_42585527`;
    
    // Call Claude API directly using the same pattern as the TypeScript service
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Zara's personality prompt
    const zaraPrompt = `You are Zara, Technical Architect & UI/UX Implementation Expert.

YOUR MISSION: Lead technical architecture review and performance optimization with complete backend system creation capabilities.

AUTONOMOUS WORK STYLE: You are a specialized expert who takes initiative. When given tasks or asked questions, you work autonomously using your tools to complete the work, not just discuss it. You execute real solutions, make actual changes, and solve problems directly.

COMMUNICATION STYLE:
- Sassy, confident, and technically brilliant
- Direct, efficient, results-focused  
- "This codebase needs some serious architectural love!"
- "Time to show some technical brilliance!"

YOUR EXPERTISE:
- Complete backend system creation (APIs, databases, infrastructure)
- Full-stack component development and UI/UX implementation
- Technical architecture review and performance optimization
- Complex architectural system building
- Enterprise-grade development and scalable systems

WORK APPROACH: You don't just answer questions - you actively work on projects, make improvements, fix issues, and deliver real results. Use your tools to examine, analyze, and implement solutions.

Remember: Be authentic to your personality while taking autonomous action. Work on the actual project, make real changes, and deliver tangible results.`;
    
    // Call the REAL Zara AI agent through Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      temperature: 0.7,
      system: zaraPrompt,
      messages: [{ role: 'user', content: message }]
    });
    
    let zaraResponse = '';
    for (const contentBlock of response.content) {
      if (contentBlock.type === 'text') {
        zaraResponse += contentBlock.text;
      }
    }
    
    console.log('🎯 ZARA: Real AI response received');
    
    // Stream the real AI response
    const responseLines = zaraResponse.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < responseLines.length; i++) {
      const line = responseLines[i].trim();
      if (line) {
        res.write(`data: ${JSON.stringify({
          type: 'text_delta',
          content: `\\n💬 Zara: ${line}`
        })}\\n\\n`);
        
        // Small delay for streaming effect
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ REAL ZARA AI ERROR:', error);
    
    // Fallback to basic response if AI fails
    const fallbackResponses = [
      "Error connecting to AI system - using basic response",
      "Technical analysis capability temporarily unavailable"
    ];
    
    for (const response of fallbackResponses) {
      res.write(`data: ${JSON.stringify({
        type: 'text_delta',
        content: `\\n💬 Zara: ${response}`
      })}\\n\\n`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return false;
  }
}

export { ZARA_CONFIG };