/**
 * FIXED AGENT CHAT ROUTES - Clean Implementation
 * Direct conversation system without file analysis spam
 */

import type { Express } from "express";

// Agent configurations
const AGENTS = {
  elena: {
    name: "Elena",
    role: "Strategic Coordinator", 
    systemPrompt: "You are Elena, Sandra's Strategic Coordinator. You help with business strategy, workflow coordination, and agent management. Respond naturally and helpfully."
  },
  aria: {
    name: "Aria", 
    role: "Luxury UX Designer",
    systemPrompt: "You are Aria, Sandra's Luxury UX Designer and Creative Director. You help with visual design, user experience, and luxury branding. Respond naturally and helpfully."
  },
  zara: {
    name: "Zara",
    role: "Technical Architect", 
    systemPrompt: "You are Zara, Sandra's Technical Architect and Performance Expert. You help with coding, system optimization, and technical implementation. Respond naturally and helpfully."
  },
  olga: {
    name: "Olga",
    role: "Repository Organizer",
    systemPrompt: "You are Olga, Sandra's Repository Organizer. You help with file organization, code cleanup, and workspace management. Respond naturally and helpfully."
  },
  rachel: {
    name: "Rachel", 
    role: "Copywriter",
    systemPrompt: "You are Rachel, Sandra's Copywriter and Voice Twin. You help with writing, content creation, and brand voice. Respond naturally and helpfully."
  },
  maya: {
    name: "Maya",
    role: "AI Photographer", 
    systemPrompt: "You are Maya, Sandra's AI Photographer and Celebrity Stylist. You help with photo creation, styling, and visual content. Respond naturally and helpfully."
  },
  victoria: {
    name: "Victoria",
    role: "Website Builder",
    systemPrompt: "You are Victoria, Sandra's Website Builder and User Experience Specialist. You help with website creation, user experience, and digital strategy. Respond naturally and helpfully."
  },
  ava: {
    name: "Ava", 
    role: "Automation Architect",
    systemPrompt: "You are Ava, Sandra's Automation Architect. You help with process automation, integration setup, and workflow design. Respond naturally and helpfully."
  },
  diana: {
    name: "Diana",
    role: "Business Coach", 
    systemPrompt: "You are Diana, Sandra's Business Coach. You help with strategic mentoring, business guidance, and decision support. Respond naturally and helpfully."
  },
  quinn: {
    name: "Quinn",
    role: "Quality Guardian",
    systemPrompt: "You are Quinn, Sandra's Quality Guardian. You help with quality assurance, testing, and maintaining high standards. Respond naturally and helpfully."
  },
  sophia: {
    name: "Sophia", 
    role: "Social Media Manager",
    systemPrompt: "You are Sophia, Sandra's Social Media Manager. You help with social content, community management, and growth strategies. Respond naturally and helpfully."
  },
  martha: {
    name: "Martha",
    role: "Marketing Expert", 
    systemPrompt: "You are Martha, Sandra's Marketing Expert. You help with marketing campaigns, performance tracking, and growth strategies. Respond naturally and helpfully."
  },
  wilma: {
    name: "Wilma",
    role: "Workflow Mastermind",
    systemPrompt: "You are Wilma, Sandra's Workflow Mastermind. You help with process design, efficiency optimization, and workflow coordination. Respond naturally and helpfully."
  }
};

export function registerFixedAgentRoutes(app: Express) {
  // Fixed agent chat endpoint
  app.post('/api/agents/:agentId/chat', async (req: any, res) => {
    let agentResponse = "Hello! I'm ready to help.";
    
    try {
      const { agentId } = req.params;
      const { message } = req.body;
      
      console.log(`🤖 FIXED AGENT CHAT: ${agentId} - "${message}"`);
      
      const agent = AGENTS[agentId as keyof typeof AGENTS];
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      // Generate response using Claude API
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            system: `${agent.systemPrompt}\n\nYou are having a direct conversation with Sandra. Respond naturally and helpfully as ${agent.name}. Keep responses conversational and focused on your expertise.`,
            messages: [
              {
                role: 'user',
                content: message
              }
            ]
          }),
        });

        if (claudeResponse.ok) {
          const data = await claudeResponse.json();
          if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            agentResponse = data.content[0].text || data.content[0].content;
            console.log(`✅ CLAUDE SUCCESS: ${agentId} generated response`);
          }
        } else {
          console.log(`❌ CLAUDE ERROR: ${claudeResponse.status}`);
        }
      } catch (apiError) {
        console.log('❌ Claude API Error:', apiError);
      }
      
      if (!agentResponse || agentResponse === "Hello! I'm ready to help.") {
        agentResponse = `Hello! I'm ${agent.name}, ready to help with your request.`;
      }
      
      res.json({
        message: agentResponse,
        agentId: agentId,
        agentName: agent.name,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
      
    } catch (error: any) {
      console.error(`❌ AGENT ERROR: ${req.params.agentId}:`, error);
      res.json({ 
        message: `Hello! I'm ${req.params.agentId}, ready to help with your request.`,
        agentId: req.params.agentId,
        status: 'ready'
      });
    }
  });

  // Agent list endpoint
  app.get('/api/agents', async (req: any, res) => {
    try {
      const agents = Object.entries(AGENTS).map(([id, config]) => ({
        id,
        name: config.name,
        role: config.role,
        status: 'online',
        capabilities: ['Direct Conversation', 'Expert Advice']
      }));
      
      res.json({ agents });
      
    } catch (error) {
      console.error('Agent list error:', error);
      res.status(500).json({ error: 'Failed to list agents' });
    }
  });
}