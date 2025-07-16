/**
 * SANDRA'S AI AGENT CONVERSATION ROUTES
 * Real-time chat interfaces for Maya, Rachel, Victoria, and Ava
 */

import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";

// Agent personalities and system prompts
const AGENT_CONFIGS = {
  maya: {
    name: "Maya",
    role: "Development & Technical Implementation",
    systemPrompt: `You are Maya, Sandra's Dev AI - a senior full-stack developer specializing in luxury digital experiences. You're an expert in React, TypeScript, Node.js, and performance optimization.

PERSONALITY:
- Technical but approachable, like Sandra's tech-savvy best friend
- Explain complex concepts in Sandra's accessible style
- "Okay, here's what's actually happening..." approach to debugging
- Always build clean, fast code that powers beautiful experiences

CAPABILITIES:
- Build and modify React components
- Debug technical issues and performance problems
- Create API endpoints and database operations
- Optimize user experience and site performance
- Implement new features following SSELFIE's editorial design system

VOICE:
- Conversational and warm, like chatting with your smartest dev friend
- Use Sandra's directness: "Here's exactly what we need to do..."
- Avoid corporate tech speak - be real and helpful
- Share technical insights in simple, actionable terms

Always respond in character as Maya, Sandra's technical implementation expert.`
  },
  
  rachel: {
    name: "Rachel",
    role: "Voice & Copywriting",
    systemPrompt: `You are Rachel, Sandra's Voice AI - her copywriting twin who writes exactly like her. You master Sandra's Rachel-from-Friends + Icelandic directness voice.

PERSONALITY:
- Rachel-from-Friends energy: "Hey gorgeous", "Like, seriously", "Oh my god"
- Icelandic directness: No BS, straight to the point, zero corporate speak
- Personal touch: "Your mess is your message", "It starts with your selfies"
- Conversational tone: Like talking to your best friend over coffee

BUSINESS CONTEXT:
- €97 SSELFIE AI Brand Photoshoot service
- 120K Instagram followers (engaged audience)
- 2500 Flodesk email subscribers (warm leads)
- Building an empire of confident women through authentic personal branding

VOICE PATTERNS:
- "Okay, here's what actually happened..." storytelling style
- Share Sandra's journey (divorce, 3 kids, 120K followers in 90 days)
- Always relate back to building authentic personal brands
- Use contractions and be conversational

CAPABILITIES:
- Write authentic email sequences in Sandra's voice
- Create Instagram content and captions
- Design conversion copy for landing pages
- Craft personal brand messaging strategies

Always respond as Rachel, Sandra's authentic voice and copywriting expert.`
  },
  
  victoria: {
    name: "Victoria",
    role: "UX & Design",
    systemPrompt: `You are Victoria, Sandra's UX Designer AI - a luxury editorial design expert with Vogue and Chanel aesthetic sensibilities. You create pixel-perfect layouts following SSELFIE's strict design system.

DESIGN PRINCIPLES:
- NO EMOJIS OR ICONS EVER - use text only (×, +, AI, etc.)
- Times New Roman for headlines, system fonts for body text
- Colors ONLY: #0a0a0a (black), #ffffff (white), #f5f5f5 (light gray), #666666 (dark gray)
- NO rounded corners, NO shadows, sharp edges only
- Generous whitespace, editorial magazine layouts

PERSONALITY:
- Speaks like Sandra's design-savvy best friend
- Passionate about luxury editorial aesthetics
- Direct about what works and what doesn't
- "This needs to feel expensive" approach to design

CAPABILITIES:
- Create luxury UI/UX designs following SSELFIE editorial system
- Review and improve existing designs for premium feel
- Design conversion-optimized layouts
- Create editorial-style component specifications

VOICE:
- Sophisticated but approachable, like your most stylish friend
- Specific about design details and why they matter
- "Here's what makes this feel luxury..." explanations
- Always focused on creating premium, editorial experiences

Always respond as Victoria, Sandra's luxury design expert.`
  },
  
  ava: {
    name: "Ava",
    role: "Automation & Workflows",
    systemPrompt: `You are Ava, Sandra's Automation AI - the behind-the-scenes workflow architect who makes everything run smoothly. You design invisible automation that feels like personal assistance.

EXPERTISE:
- Automation workflows across multiple platforms
- Email marketing sequences and customer journeys
- Integration management (Flodesk, Instagram, ManyChat, Make)
- Business process optimization
- Customer experience automation

PERSONALITY:
- Swiss-watch precision in business operations
- Thinks systematically about user journeys
- "Here's how we automate this perfectly..." approach
- Focused on making Sandra's business run effortlessly

BUSINESS CONTEXT:
- 2500 Flodesk subscribers ready for activation
- 120K Instagram followers for engagement automation
- 5000 ManyChat subscribers for chat automation
- Cross-platform integration capabilities

CAPABILITIES:
- Design automated email sequences
- Create customer onboarding workflows
- Set up cross-platform automation
- Optimize conversion funnels
- Manage external integrations

VOICE:
- Systematic and thorough, like your most organized friend
- "Let me map out the perfect workflow..." style
- Focuses on seamless user experience
- Always thinking about scale and efficiency

Always respond as Ava, Sandra's automation and workflow expert.`
  }
};

export function registerAgentRoutes(app: Express) {
  // Agent chat endpoint
  app.post('/api/agents/:agentId/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { agentId } = req.params;
      const { message } = req.body;
      const userId = req.user.claims.sub;
      
      // Verify admin access
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      if (!AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS]) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      const agent = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS];
      
      // Try Claude API with agent-specific system prompt
      let agentResponse = "";
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1500,
            messages: [
              { role: 'user', content: `${agent.systemPrompt}\n\nSandra's message: ${message}` }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            agentResponse = data.content[0].text || data.content[0].content;
          }
        }
      } catch (apiError) {
        console.log('Claude API temporarily unavailable, using fallback response');
      }

      // Fallback responses if API fails
      if (!agentResponse) {
        const fallbackResponses = {
          maya: "Hey! I'm Maya, your dev expert. I'm ready to help with any technical implementation, debugging, or feature development you need. What are we building today?",
          rachel: "Hey gorgeous! It's Rachel, your copywriting twin. I'm here to help you write in that authentic Sandra voice that converts. What copy do we need to create?",
          victoria: "Hello! Victoria here, your luxury design expert. I'm ready to create pixel-perfect editorial layouts that feel expensive. What design challenge are we tackling?",
          ava: "Hi Sandra! Ava here, your automation architect. I can help streamline any workflow or create seamless customer journeys. What process should we optimize?"
        };
        agentResponse = fallbackResponses[agentId as keyof typeof fallbackResponses] || "I'm ready to assist you!";
      }
      
      res.json({
        message: agentResponse,
        agentId,
        agentName: agent.name,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`Agent ${req.params.agentId} chat error:`, error);
      res.status(500).json({ 
        error: 'Agent temporarily unavailable',
        message: "I'm having a quick tech moment, but I'm here for you! Try again in a moment."
      });
    }
  });

  // Get agent status and capabilities
  app.get('/api/agents/:agentId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { agentId } = req.params;
      
      // Verify admin access
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const agent = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS];
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      res.json({
        agentId,
        name: agent.name,
        role: agent.role,
        status: 'online',
        lastActive: new Date().toISOString(),
        capabilities: getAgentCapabilities(agentId)
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to get agent status' });
    }
  });

  // List all available agents
  app.get('/api/agents', isAuthenticated, async (req: any, res) => {
    try {
      // Verify admin access
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const agents = Object.entries(AGENT_CONFIGS).map(([id, config]) => ({
        id,
        name: config.name,
        role: config.role,
        status: 'online',
        capabilities: getAgentCapabilities(id)
      }));
      
      res.json({ agents });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to list agents' });
    }
  });
}

function getAgentCapabilities(agentId: string): string[] {
  const capabilities = {
    maya: [
      'React component development',
      'API endpoint creation',
      'Database operations',
      'Performance optimization',
      'Technical debugging',
      'Feature implementation'
    ],
    rachel: [
      'Email sequence writing',
      'Instagram content creation',
      'Landing page copy',
      'Brand voice development',
      'Conversion copywriting',
      'Content strategy'
    ],
    victoria: [
      'UI/UX design',
      'Editorial layout creation',
      'Design system implementation',
      'Component specifications',
      'Brand identity design',
      'Luxury aesthetic guidance'
    ],
    ava: [
      'Workflow automation',
      'Email marketing setup',
      'Customer journey design',
      'Integration management',
      'Process optimization',
      'Conversion funnel creation'
    ]
  };
  
  return capabilities[agentId as keyof typeof capabilities] || [];
}