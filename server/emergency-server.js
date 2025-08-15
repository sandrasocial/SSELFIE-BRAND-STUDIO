/**
 * EMERGENCY STABLE SERVER
 * Minimal, stable server for admin agent functionality
 */

import http from 'http';
import url from 'url';

const port = process.env.PORT || 3000;

console.log('🚀 EMERGENCY SERVER: Starting minimal stable server...');

// Admin agents configuration
const ADMIN_AGENTS = {
  zara: "Technical Architect & UI/UX Implementation Expert",
  elena: "Project Management & Process Optimization Expert", 
  olga: "Data Analysis & AI Model Training Specialist",
  aria: "Content Strategy & Brand Voice Expert",
  quinn: "Quality Assurance & Testing Specialist",
  victoria: "Payment Systems & Revenue Optimization Expert",
  rachel: "User Experience & Interface Design Expert",
  martha: "Operations & Infrastructure Management Expert",
  diana: "Security & Compliance Specialist",
  maya: "Customer Success & Support Expert",
  sophia: "Research & Strategy Development Expert",
  ava: "Performance Optimization & Analytics Expert"
};

// Real AI agent processing
async function processAIAgent(agentId, message, res) {
  try {
    console.log(`🤖 ${agentId.toUpperCase()}: Processing with Claude AI...`);
    
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const agentPrompt = `You are ${agentId}, ${ADMIN_AGENTS[agentId]}.

You are a specialized AI expert who takes initiative and works autonomously. When given tasks or asked questions, you use your expertise to provide actionable solutions and insights.

COMMUNICATION STYLE: Professional, confident, and results-focused with your unique expertise.

WORK APPROACH: You actively analyze, recommend solutions, and provide concrete value. You provide expert guidance and actionable insights.

Remember: Be authentic to your expertise while providing real value and practical solutions.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: agentPrompt,
      messages: [{ role: 'user', content: message }]
    });
    
    let agentResponse = '';
    for (const contentBlock of response.content) {
      if (contentBlock.type === 'text') {
        agentResponse += contentBlock.text;
      }
    }
    
    console.log(`✅ ${agentId.toUpperCase()}: Response generated`);
    
    // Stream response
    const lines = agentResponse.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.trim()) {
        res.write(`data: ${JSON.stringify({
          type: 'text_delta',
          content: `\\n💬 ${agentId}: ${line.trim()}`
        })}\\n\\n`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${agentId.toUpperCase()} ERROR:`, error);
    res.write(`data: ${JSON.stringify({
      type: 'text_delta',
      content: `\\n💬 ${agentId}: Error - ${error.message}`
    })}\\n\\n`);
    return false;
  }
}

// Create server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`📡 ${req.method} ${pathname}`);

  // Health check
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      server: 'emergency-stable',
      timestamp: Date.now()
    }));
    return;
  }

  // Authentication
  if (pathname === '/api/auth/user') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: '42585527',
      email: 'ssa@ssasocial.com',
      firstName: 'Sandra',
      lastName: 'Sigurjonsdottir',
      role: 'admin',
      plan: 'sselfie-studio',
      emergencyServer: true
    }));
    return;
  }

  // Admin agent consultation
  if (pathname === '/api/admin/consulting-chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    
    req.on('end', async () => {
      try {
        const { agentId, message, adminToken } = JSON.parse(body);
        
        if (adminToken !== 'sandra-admin-2025') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Unauthorized' }));
          return;
        }
        
        console.log(`🚀 ${agentId?.toUpperCase()}: Admin consultation request`);
        
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });
        
        res.write(`data: ${JSON.stringify({
          type: 'message_start',
          message: `🔧 ${agentId}: Emergency server - deploying AI capabilities`
        })}\\n\\n`);
        
        await processAIAgent(agentId, message, res);
        
        res.write(`data: ${JSON.stringify({
          type: 'message_complete',
          message: `\\n🎯 ${agentId}: Emergency server analysis complete`
        })}\\n\\n`);
        
        res.end();
        
      } catch (error) {
        console.error('❌ Request error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Bad request' }));
      }
    });
    return;
  }

  // Default response
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Emergency server operational',
    server: 'emergency-stable',
    availableAgents: Object.keys(ADMIN_AGENTS)
  }));
});

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ EMERGENCY SERVER running on port ${port}`);
  console.log(`🌐 Health: http://localhost:${port}/health`);
  console.log(`🔐 Auth: http://localhost:${port}/api/auth/user`);
  console.log(`🤖 Admin agents: ${Object.keys(ADMIN_AGENTS).length} available`);
});

// Keep server alive and stable
const keepAlive = setInterval(() => {
  // Heartbeat to prevent shutdown
}, 30000);

process.on('SIGINT', () => {
  console.log('🛑 Emergency server shutting down...');
  clearInterval(keepAlive);
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('🛑 Emergency server terminated');
  clearInterval(keepAlive);
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep server running
});

export default server;