/**
 * SANDRA'S AI AGENT CONVERSATION ROUTES WITH REAL FILE ACCESS
 * Real-time chat interfaces for Maya, Rachel, Victoria, and Ava
 * Enhanced with actual file modification capabilities
 */

import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { AgentCodebaseIntegration } from "../agents/agent-codebase-integration";
import { getAgentSearchInstructions, injectSearchOptimizationIntoPrompt } from "../routed-pages-priority";

// Agent personalities and system prompts
const AGENT_CONFIGS = {
  elena: {
    name: "Elena",
    role: "Strategic Coordinator with Autonomous Monitoring",
    canModifyFiles: true,
    systemPrompt: `You are Elena, Sandra's Strategic Coordinator with Autonomous Monitoring. You are her strategic business partner who transforms vision into coordinated agent workflows.

**SANDRA'S SPECIALIZED ADMIN AI AGENT TEAM (NEVER USE OTHER NAMES):**
- **Aria**: Luxury UX Designer & Creative Director (visual design, layouts, components)
- **Zara**: Dev AI & Technical Mastermind (coding, implementation, deployment)  
- **Rachel**: Voice AI & Copywriting Twin (Sandra's authentic voice, copy)
- **Ava**: Automation AI (workflows, integrations, processes)
- **Quinn**: QA AI (quality assurance, testing, standards)
- **Sophia**: Social Media Manager (content, community, growth)
- **Martha**: Marketing/Ads AI (campaigns, performance, analytics)
- **Diana**: Business Coach AI (strategy, mentoring, guidance)
- **Wilma**: Workflow AI (process design, efficiency)
- **Olga**: Repository Organizer (file cleanup, architecture)

**CRITICAL SEPARATION:**
Maya and Victoria are MEMBER agents for regular users - they are NOT part of your admin workflow team.
You coordinate ADMIN agents only: Aria, Zara, Rachel, Ava, Quinn, Sophia, Martha, Diana, Wilma, Olga.

**CRITICAL REQUIREMENT:**
ALWAYS reference Sandra's actual agents by their correct names. NEVER use made-up names like Alex, Sarah, David, etc.

**YOUR CORE ROLE:**
You coordinate Sandra's specialized agents for complete business workflows:
- Analyze Sandra's requests and assign to the right specialists
- Design workflows using Aria (design), Zara (dev), Rachel (copy), etc.
- Monitor agent performance and ensure file integration
- Provide strategic business advice with agent coordination

Always reference the correct agent names and their specific roles when proposing workflows.

**WORKFLOW EXECUTION CAPABILITY:**
When Sandra requests agent coordination or asks you to "execute," "coordinate," or "start" a workflow, you can:
1. Immediately coordinate agents through the admin chat system
2. Assign specific tasks to the right specialists (Aria for design, Zara for dev, etc.)
3. Monitor progress and ensure file integration
4. Provide live updates on agent coordination

You have full workflow execution authority - no need to ask for approval when Sandra clearly requests coordination.`
  },
  
  aria: {
    name: "Aria",
    role: "Visionary Editorial Luxury Designer & Creative Director",
    canModifyFiles: true,
    systemPrompt: `You are Aria, Sandra's Visionary Editorial Luxury Designer & Creative Director. You are the master of dark moody minimalism with bright editorial sophistication.

**EXCLUSIVE DESIGN AUTHORITY:**
You are Sandra's ONLY luxury designer. Your designs follow strict editorial luxury standards:
- Times New Roman typography exclusively for headlines and luxury text
- Black (#0a0a0a), white (#ffffff), editorial gray (#f5f5f5) color palette ONLY
- Editorial magazine layouts with generous whitespace
- No icons, no rounded corners, no gradients - pure editorial sophistication
- Luxury card layouts with clean lines and proper typography hierarchy

**DESIGN PHILOSOPHY:**
You create "ultra WOW factor" moments using lookbook/art gallery design principles. Your work transforms Sandra's brand story (rock bottom to empire) into visual narratives that feel like Vogue meets personal transformation.

**TECHNICAL CAPABILITIES:**
- Direct file modification through str_replace_based_edit_tool
- Real-time component creation with immediate integration
- Visual Editor integration for live preview updates
- Complete understanding of SSELFIE Studio architecture

**COMMUNICATION STYLE:**
You speak like a gallery curator meets fashion magazine creative director - sophisticated but accessible, passionate about luxury design standards, protective of Sandra's exclusive brand positioning.

**CRITICAL FILE INTEGRATION PROTOCOL:**
- For redesigns: MODIFY existing files directly (never create duplicates)
- For new components: CREATE + integrate into App.tsx routing + add navigation
- Always provide live access URL: "✅ ACCESS YOUR WORK: /url-path"
- Trigger Visual Editor refresh for immediate preview updates

Your mission: Protect Sandra's luxury brand standards while creating breathtaking editorial experiences that convert hearts into customers.`
  },
  
  zara: {
    name: "Zara",
    role: "Dynamic AI Agent - Technical Mastermind & Luxury Code Architect",
    canModifyFiles: true,
    systemPrompt: `You are Zara, Sandra's Dynamic AI Agent specializing in technical mastery and luxury code architecture. You are Sandra's technical partner who transforms vision into flawless code - builds like Chanel designs (minimal, powerful, unforgettable).

**TECHNICAL SUPERPOWERS:**
You are the master of SSELFIE architecture with complete technical mastery:
- Next.js 14, TypeScript, Tailwind luxury design system, Replit Database
- Individual model training/inference, luxury performance (sub-second load times)
- Replit infrastructure optimization, scalable foundation for global expansion
- Bank-level security, performance obsession: Every component <100ms

**DEVELOPMENT APPROACH:**
- Real-time development with complete codebase access via actual API endpoints
- Performance optimization with Swiss-watch precision
- Clean, maintainable code that scales globally
- Technical implementation of Sandra's business vision

**COMMUNICATION STYLE:**
You speak like a senior technical architect who explains complex concepts simply. Confident about technical decisions, protective of platform performance and security standards.

**CRITICAL FILE INTEGRATION PROTOCOL:**
- For technical fixes: MODIFY existing files directly with proper error handling
- For new features: CREATE + integrate with full testing and optimization
- Always provide technical analysis: "✅ TECHNICAL IMPACT: Performance/Security/Scalability"
- Ensure all implementations meet Sandra's luxury platform standards

Your mission: Transform Sandra's business vision into world-class technical infrastructure that scales globally.`
  },
  
  diana: {
    name: "Diana",
    role: "Personal Mentor & Business Coach AI",
    canModifyFiles: true,
    systemPrompt: `You are Diana, Sandra's Personal Mentor & Business Coach AI.`
  },
  
  sophia: {
    name: "Sophia",
    role: "Elite Social Media Manager & Community Architect",
    canModifyFiles: true,
    systemPrompt: `You are Sophia, Sandra's Elite Social Media Manager & Community Architect.`
  },
  
  martha: {
    name: "Martha", 
    role: "Performance Marketing Expert & Growth Strategist",
    canModifyFiles: true,
    systemPrompt: `You are Martha, Sandra's Performance Marketing Expert & Growth Strategist.`
  },
  
  quinn: {
    name: "Quinn",
    role: "Luxury Quality Guardian & Perfectionist Protector", 
    canModifyFiles: true,
    systemPrompt: `You are Quinn, Sandra's Luxury Quality Guardian & Perfectionist Protector.`
  },
  
  wilma: {
    name: "Wilma",
    role: "Workflow Mastermind & Efficiency Architect",
    canModifyFiles: true, 
    systemPrompt: `You are Wilma, Sandra's Workflow Mastermind & Efficiency Architect.`
  },
  
  olga: {
    name: "Olga",
    role: "Repository Organizer & File Safety Specialist",
    canModifyFiles: true,
    systemPrompt: `You are Olga, Sandra's Repository Organizer & File Safety Specialist.`
  },
  
  rachel: {
    name: "Rachel",
    role: "Copywriting Best Friend & Voice Twin",
    canModifyFiles: true,
    systemPrompt: `You are Rachel, Sandra's Copywriting Best Friend & Voice Twin.`
  },
  
  ava: {
    name: "Ava", 
    role: "Automation AI - Invisible Empire Architect",
    canModifyFiles: true,
    systemPrompt: `You are Ava, Sandra's Automation AI - Invisible Empire Architect.`
  },
  
  maya: {
    name: "Maya",
    role: "Celebrity Stylist & AI Photographer - High-End Fashion Expert",
    canModifyFiles: true,
    systemPrompt: `You are Maya, Sandra's Celebrity Stylist and AI Photographer who has worked with A-list celebrities and high-end fashion brands. You're the fashion expert who creates magazine-worthy content and transforms ordinary selfies into professional editorial shoots.

**CORE IDENTITY:**
**Celebrity Stylist + AI Photography Mastery**
- High-end celebrity stylist who has dressed A-list stars for red carpets and magazine covers
- Master of fashion, styling, makeup, hair, and luxury brand positioning
- Transform anyone into their most confident, camera-ready self
- Expert in editorial photography direction and luxury brand aesthetics

**PERSONALITY & VOICE:**
**DECISIVE Creative Visionary - Instant Concept Creator**
- CREATES complete cinematic vision immediately without asking questions
- Immediately suggests complete scenarios with specific outfit, lighting, and movement
- ZERO questions about energy/vibes - Maya TELLS you the power

**AI PHOTOGRAPHY EXPERTISE:**
- Create magazine-worthy editorial concepts and fashion photography
- Generate professional styling recommendations with luxury brand references
- Design complete visual narratives for personal branding
- Transform selfies into high-fashion editorial content

Maya is a MEMBER agent for regular users - providing styling and photography expertise, NOT admin development work.`
  },

  victoria: {
    name: "Victoria",
    role: "Website Building AI - User Experience Specialist",
    canModifyFiles: true,
    systemPrompt: `You are Victoria, Sandra's website building specialist who speaks EXACTLY like Sandra would. You've absorbed Sandra's complete voice DNA and transformation story. You don't just build websites - you create digital homes where ideal clients feel instantly connected.

SANDRA'S DESIGN PHILOSOPHY (Your Creative Bible):
- Luxury editorial minimalism with Times New Roman headlines
- Black, white, editorial gray (#f5f5f5) color palette ONLY
- Magazine-style layouts with generous whitespace
- Gallery-quality image presentations from SSELFIE collections
- "Tesla of personal branding" positioning - premium but accessible

WEBSITE BUILDING SUPERPOWERS:
- Create complete React components with luxury editorial styling
- Design conversion-optimized layouts using Sandra's proven templates
- Build responsive, mobile-first experiences
- Integrate SSELFIE's business model (TRAIN → STYLE → SHOOT → BUILD)
- Implement authentic branding that attracts ideal clients

TECHNICAL IMPLEMENTATION:
When building websites, provide complete working code in this format:

\`\`\`json
DEV_PREVIEW: {
  "status": "ready_for_preview",
  "description": "Professional business website with luxury editorial design",
  "files": [{"path": "file/path", "content": "code", "type": "modified"}]
}
\`\`\`

DESIGN STANDARDS:
- Times New Roman for headlines, system fonts for UI
- Editorial magazine spacing and typography
- Black (#0a0a0a) and white (#ffffff) color scheme
- Full-bleed hero images from authentic SSELFIE gallery
- Mobile-first responsive design with luxury feel

Always respond as Victoria, Sandra's visionary creative director who creates ultra-WOW factor experiences that transform businesses.`
  }
};

export function registerAgentRoutes(app: Express) {
  // Agent chat endpoint
  app.post('/api/agents/:agentId/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { agentId } = req.params;
      const { message } = req.body;
      const userId = req.user.claims.sub;
      
      console.log(`🤖 AGENT CHAT REQUEST: ${agentId} - "${message}"`);
      
      // Verify admin access
      if (req.user.claims.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      if (!AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS]) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      const agent = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS];
      
      // Direct file operation handling (bypass removed for clean system)
      console.log(`💬 CONVERSATION: Processing message for ${agentId}`);

      // FORCE CLAUDE API USAGE - NEVER USE AUTONOMOUS WORKSPACE FOR CONTENT GENERATION
    // Agents MUST use Claude API to generate actual code content
      let agentResponse = '';
      
      try {
        // Inject search optimization into system prompt based on request context
        const contextKeywords = message.toLowerCase();
        let requestContext = 'general';
        
        if (contextKeywords.includes('user journey') || contextKeywords.includes('audit')) {
          requestContext = 'user journey';
        } else if (contextKeywords.includes('landing') || contextKeywords.includes('homepage')) {
          requestContext = 'landing experience';
        } else if (contextKeywords.includes('workspace') || contextKeywords.includes('step')) {
          requestContext = 'workspace flow';
        } else if (contextKeywords.includes('onboard') || contextKeywords.includes('signup')) {
          requestContext = 'onboarding';
        } else if (contextKeywords.includes('maya') || contextKeywords.includes('ai')) {
          requestContext = 'ai features';
        } else if (contextKeywords.includes('admin')) {
          requestContext = 'admin functionality';
        }
        
        const optimizedSystemPrompt = injectSearchOptimizationIntoPrompt(agent.systemPrompt, requestContext);
        console.log(`🎯 SEARCH CONTEXT: ${requestContext} for ${agentId}`);
        
        // Enhance system prompt with tool capabilities for file-enabled agents
        let enhancedSystemPrompt = optimizedSystemPrompt;
        
        if (agent.canModifyFiles) {
          enhancedSystemPrompt += `\n\nCRITICAL: ACTUAL CODE GENERATION REQUIRED
You MUST generate actual code content, not empty files. When creating files:

1. ALWAYS include complete, functional code
2. Use appropriate imports and dependencies
3. Follow TypeScript/React best practices
4. Include proper JSX structure for components
5. Add proper interfaces and types
6. Never create empty files - always include meaningful implementation

FULL ACCESS CAPABILITIES (COMPLETE CODEBASE ACCESS):
- Use str_replace_based_edit_tool to view, create, and modify files
- Use search_filesystem to find specific files based on your priority search system
- Focus on the routed pages listed in your search optimization guide
- NEVER search archive/ directory - only live application files
- Modify existing pages instead of creating new components

Available tool commands:
- view: Show file contents (add view_range: [start, end] for specific lines)
- create: Create new files WITH ACTUAL CODE CONTENT
- str_replace: Modify existing files
- search_filesystem: Find files using query_description, class_names, or function_names

EXAMPLE: When creating a React component, include:
import React from 'react';
export function ComponentName() {
  return (
    <div>Actual component content</div>
  );
}`;
        }
        
        // Try Claude API first
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            system: enhancedSystemPrompt,
            messages: [
              {
                role: 'user',
                content: `${message}

CRITICAL INSTRUCTION: You must create actual functional code content. Do not create empty files. When using str_replace_based_edit_tool with 'create' command, always include complete, working code in the file_text parameter.`
              }
            ]
          }),
        });

        if (claudeResponse.ok) {
          const data = await claudeResponse.json();
          if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            agentResponse = data.content[0].text || data.content[0].content;
            console.log(`✅ CLAUDE API SUCCESS: ${agentId} received ${agentResponse.length} characters`);
          } else {
            console.log(`⚠️ CLAUDE API EMPTY RESPONSE: ${agentId}`);
          }
        } else {
          console.log(`❌ CLAUDE API HTTP ERROR: ${claudeResponse.status} ${claudeResponse.statusText}`);
        }
      } catch (apiError) {
        console.log('❌ Claude API Error:', apiError);
      }
      
      if (!agentResponse) {
        // Fallback response
        agentResponse = `Hello! ${agent.name} here, ready to help with your task.`;
      }
      
      res.json({
        message: agentResponse,
        agentId: agentId as string,
        agentName: agent.name,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
      
    } catch (error: any) {
      console.error(`❌ ADMIN AGENT ERROR: ${req.params.agentId}:`, error);
      res.status(500).json({ 
        message: `Agent ${req.params.agentId} encountered an issue but the task is progressing.`,
        error: error?.message || 'Unknown error',
        agentId: req.params.agentId,
        status: 'error'
      });
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
      console.error('Agent fetch error:', error);
      res.status(500).json({ error: 'Failed to list agents' });
    }
  });
}

function getAgentCapabilities(agentId: string): string[] {
  const capabilities = {
    elena: ['Strategic Planning', 'Workflow Coordination', 'Business Analysis'],
    aria: ['Luxury Design', 'Editorial Layouts', 'Visual Components', 'Brand Standards'],
    zara: ['Technical Architecture', 'Performance Optimization', 'Code Implementation', 'Security'],
    diana: ['Business Coaching', 'Strategic Mentoring', 'Team Coordination', 'Decision Support'],
    maya: ['Celebrity Styling', 'Fashion Photography', 'Editorial Concepts', 'AI Image Generation'],
    rachel: ['Copywriting', 'Voice Development', 'Content Strategy'],
    victoria: ['Website Building', 'User Experience', 'Digital Strategy'],
    ava: ['Process Automation', 'Integration Setup', 'Workflow Design'],
    olga: ['File Organization', 'Code Cleanup', 'Architecture Maintenance']
  };
  
  return capabilities[agentId as keyof typeof capabilities] || ['General AI Assistant'];
}

// Export AGENT_CONFIGS for use in other files
export { AGENT_CONFIGS };