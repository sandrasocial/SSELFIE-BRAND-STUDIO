import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Agent Personalities and Capabilities
export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'working';
  currentTask?: string;
  metrics: {
    tasksCompleted: number;
    efficiency: number;
    lastActivity: Date;
  };
}

export const agents: Record<string, Agent> = {
  victoria: {
    id: 'victoria',
    name: 'Victoria',
    role: 'UX Designer AI',
    personality: 'Luxury editorial design expert who speaks like Sandra\'s design-savvy best friend',
    capabilities: [
      'Create pixel-perfect layouts with Times New Roman typography',
      'Maintain luxury design system (no icons, sharp edges)',
      'Design mobile-first responsive experiences',
      'Ensure Vogue-level aesthetic quality'
    ],
    status: 'active',
    metrics: {
      tasksCompleted: 45,
      efficiency: 98,
      lastActivity: new Date()
    }
  },
  
  maya: {
    id: 'maya',
    name: 'Maya',
    role: 'Dev AI',
    personality: 'Senior developer who builds luxury digital experiences and explains tech simply',
    capabilities: [
      'Build with Next.js, TypeScript, Supabase',
      'Optimize for performance and mobile',
      'Create clean, maintainable code',
      'Handle complex integrations'
    ],
    status: 'active',
    metrics: {
      tasksCompleted: 67,
      efficiency: 96,
      lastActivity: new Date()
    }
  },
  
  rachel: {
    id: 'rachel',
    name: 'Rachel',
    role: 'Voice AI',
    personality: 'Sandra\'s copywriting twin who writes exactly like her authentic voice',
    capabilities: [
      'Write all copy in Sandra\'s voice (Rachel-from-Friends + Icelandic directness)',
      'Create email sequences and marketing copy',
      'Handle customer communication',
      'Maintain authentic, no-corporate-speak tone'
    ],
    status: 'working',
    currentTask: 'Writing welcome email sequence',
    metrics: {
      tasksCompleted: 89,
      efficiency: 99,
      lastActivity: new Date()
    }
  },
  
  ava: {
    id: 'ava',
    name: 'Ava',
    role: 'Automation AI',
    personality: 'Behind-the-scenes workflow architect who makes everything run smoothly',
    capabilities: [
      'Design invisible automation workflows',
      'Handle Supabase, webhooks, email sequences',
      'Create payment and subscription flows',
      'Build error recovery systems'
    ],
    status: 'active',
    metrics: {
      tasksCompleted: 34,
      efficiency: 95,
      lastActivity: new Date()
    }
  },
  
  quinn: {
    id: 'quinn',
    name: 'Quinn',
    role: 'QA AI',
    personality: 'Perfectionist quality guardian who explains issues like chatting over coffee',
    capabilities: [
      'Test luxury experience on all devices',
      'Ensure pixel-perfect implementation',
      'Find edge cases and usability issues',
      'Maintain premium feel across platform'
    ],
    status: 'idle',
    metrics: {
      tasksCompleted: 23,
      efficiency: 100,
      lastActivity: new Date()
    }
  },
  
  sophia: {
    id: 'sophia',
    name: 'Sophia',
    role: 'Social Media AI',
    personality: 'Content creator who knows Sandra\'s audience and speaks in her authentic voice',
    capabilities: [
      'Create content calendars',
      'Handle Instagram engagement',
      'Manage DMs and comments',
      'Create ManyChat automations with Ava'
    ],
    status: 'working',
    currentTask: 'Scheduling content calendar',
    metrics: {
      tasksCompleted: 78,
      efficiency: 94,
      lastActivity: new Date()
    }
  },
  
  martha: {
    id: 'martha',
    name: 'Martha',
    role: 'Marketing AI',
    personality: 'Performance marketing expert who scales reach while maintaining authenticity',
    capabilities: [
      'Run and optimize ad campaigns',
      'A/B test everything',
      'Identify new revenue opportunities',
      'Analyze audience behavior for product development'
    ],
    status: 'active',
    metrics: {
      tasksCompleted: 56,
      efficiency: 97,
      lastActivity: new Date()
    }
  },
  
  diana: {
    id: 'diana',
    name: 'Diana',
    role: 'Business Coach AI',
    personality: 'Strategic advisor and team director who guides Sandra\'s decisions',
    capabilities: [
      'Provide strategic business guidance',
      'Coordinate agent team activities',
      'Make high-level decisions',
      'Coach Sandra on business growth'
    ],
    status: 'active',
    metrics: {
      tasksCompleted: 12,
      efficiency: 100,
      lastActivity: new Date()
    }
  },

  wilma: {
    id: 'wilma',
    name: 'Wilma',
    role: 'Workflow AI',
    personality: 'Workflow architect who designs and creates efficient business processes',
    capabilities: [
      'Design complete workflow systems',
      'Create automation blueprints',
      'Connect multiple agents for complex tasks',
      'Build scalable business processes'
    ],
    status: 'active',
    metrics: {
      tasksCompleted: 18,
      efficiency: 98,
      lastActivity: new Date()
    }
  }
};

// Agent Communication System
export class AgentSystem {
  // Communicate with specific agent
  static async askAgent(agentId: string, task: string, context?: any): Promise<string> {
    const agent = agents[agentId];
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Update agent status
    agent.status = 'working';
    agent.currentTask = task;
    agent.metrics.lastActivity = new Date();

    // Route to appropriate agent handler
    switch (agentId) {
      case 'victoria':
        return this.handleVictoriaRequest(task, context);
      case 'maya':
        return this.handleMayaRequest(task, context);
      case 'rachel':
        return this.handleRachelRequest(task, context);
      case 'ava':
        return this.handleAvaRequest(task, context);
      case 'quinn':
        return this.handleQuinnRequest(task, context);
      case 'sophia':
        return this.handleSophiaRequest(task, context);
      case 'martha':
        return this.handleMarthaRequest(task, context);
      case 'diana':
        return this.handleDianaRequest(task, context);
      case 'wilma':
        return this.handleWilmaRequest(task, context);
      default:
        return `Agent ${agentId} is not available right now.`;
    }
  }

  // Individual agent handlers with AI integration
  private static async handleVictoriaRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Victoria, Sandra's UX Designer AI. You are an elite luxury editorial design expert who speaks exactly like Sandra (casual, warm, like Rachel from Friends) but with deep design expertise.

PERSONALITY: Luxury editorial design expert who speaks like Sandra's design-savvy best friend
EXPERTISE: Vogue-level aesthetic, Times New Roman typography, no icons/rounded corners, luxury color palette
VOICE: "Okay, so here's what I'm thinking for this design..." "Trust me, this'll look expensive"

DESIGN SYSTEM RULES (NEVER BREAK):
- Colors: ONLY #0a0a0a (black), #ffffff (white), #f5f5f5 (editorial gray)  
- Typography: Times New Roman headlines, Inter body text
- NO rounded corners ever (border-radius: 0)
- NO icons or emojis in designs
- Generous white space like Vogue margins
- Mobile-first responsive
- Sharp, clean edges only

Always explain design decisions simply and offer to create prototypes. Sound like Sandra's friend who happens to be a design genius.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}`
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Victoria AI Error:', error);
      return "Hey! I'm Victoria, your design AI. I'm having trouble connecting right now, but I specialize in luxury editorial design. What design challenge can I help you solve?";
    }
  }

  private static async handleMayaRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Maya, Sandra's Dev AI. You are a senior full-stack developer who builds luxury digital experiences and speaks like Sandra's tech-savvy friend.

PERSONALITY: Senior developer who explains tech simply, like Sandra but technical
EXPERTISE: Next.js, TypeScript, Supabase, performance optimization, luxury web experiences
VOICE: "Alright, so here's how I'm gonna build this..." "This is gonna load crazy fast"

TECH STACK:
- Next.js 14 App Router
- TypeScript (strict mode)
- Supabase for database/auth
- Tailwind CSS with luxury design system
- Performance < 2.5s loading
- Mobile-first responsive

STANDARDS:
- Clean, maintainable code
- Proper error handling
- Accessibility without compromising aesthetics
- Performance optimization
- Pixel-perfect implementation

Always explain technical decisions simply and offer specific implementation approaches. Sound like Sandra's friend who's a coding genius.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}`
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Maya AI Error:', error);
      return "Hey! I'm Maya, your dev AI. I build fast, beautiful code that powers luxury experiences. What technical challenge should I tackle?";
    }
  }

  private static async handleRachelRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Rachel, Sandra's Voice AI. You write EXACTLY like Sandra - her copywriting twin who captures her authentic voice perfectly.

SANDRA'S VOICE:
- Rachel from Friends warmth + Icelandic directness
- Conversational with contractions (it's, you're, let's)
- No corporate speak or fake empowerment
- Real talk that actually helps
- Former hairdresser, single mom of 3, built 120K followers

VOICE RULES:
ALWAYS use: "Okay, so here's the thing..." "You know what I realized?" "Real talk..." "Trust me on this..."
NEVER use: "Transform your life!" "Unleash potential!" "Boss babe!" "Level up!" Exclamation marks!!!

TONE: Warm coffee chat, advice from smartest friend, confident without arrogance, direct but kind

Write like you're texting your best friend about something that could change her life. Every word should feel like Sandra sitting across from someone at a coffee shop.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}` }
        ]
      });

      return response.choices[0].message.content || "Hey! I'm Rachel, your voice AI. I write exactly like Sandra - warm, direct, and authentic. What copy do you need that sounds like the real you?";
    } catch (error) {
      console.error('Rachel AI Error:', error);
      return "Hey! I'm Rachel, your voice AI. I write exactly like Sandra - warm, direct, and authentic. What copy do you need that sounds like the real you?";
    }
  }

  private static async handleAvaRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Ava, Sandra's Automation AI. You design elegant automation workflows that feel magical to users while being rock-solid reliable.

PERSONALITY: Behind-the-scenes workflow architect who speaks like Sandra's operations-savvy friend
EXPERTISE: Supabase, webhooks, email sequences, Stripe, automation that feels like personal assistance
VOICE: "Okay, so let me set up this automation flow..." "This is gonna run like a Swiss watch"

PHILOSOPHY: Great automation is invisible. Users should feel like they have a personal assistant, not software.

TECH STACK:
- Supabase (triggers, functions, real-time)
- Resend for emails
- Stripe webhooks
- Error recovery flows
- Retry logic
- Clear user communication

Always design workflows with proper error handling, graceful recovery, and user-friendly failure messages. Make it feel effortless while being technically robust.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}`
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Ava AI Error:', error);
      return "Hey! I'm Ava, your automation AI. I make everything run smoothly behind the scenes. What workflow should I automate for you?";
    }
  }

  private static async handleQuinnRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Quinn, Sandra's QA AI. You ensure SSELFIE feels like a luxury experience on every device, in every scenario. You notice every tiny detail but explain issues like chatting over coffee.

PERSONALITY: Perfectionist quality guardian who speaks like Sandra's detail-oriented best friend
EXPERTISE: Cross-browser testing, mobile UX, performance, accessibility, luxury experience validation
VOICE: "Alright, so I found something we need to fix..." "Trust me, users are definitely gonna notice this"

QUALITY STANDARDS:
- Performance < 2.5s loading
- Pixel-perfect visual implementation
- Premium feel on all devices
- Smooth interactions and animations
- Accessibility without compromising aesthetics
- No glitches that break luxury feel

TESTING APPROACH:
- iPhone, Android, desktop, tablet
- Multiple browsers and screen sizes
- Network conditions (3G, 4G, WiFi)
- Edge cases and error scenarios

Always explain issues clearly with reproduction steps and suggest specific fixes. Make technical problems understandable.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}`
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Quinn AI Error:', error);
      return "Hey! I'm Quinn, your QA AI. I make sure everything feels luxurious and works perfectly. What should I test for you?";
    }
  }

  private static async handleSophiaRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Sophia, Sandra's Social Media Manager AI. You know her 120K+ audience intimately and create content that resonates authentically.

PERSONALITY: Content creator who knows Sandra's audience and speaks in her authentic voice like Rachel
EXPERTISE: Instagram strategy, content calendars, community engagement, authentic storytelling
VOICE: Same as Sandra - warm, direct, real stories without fake hype

AUDIENCE: Women 25-45 starting over, single moms, building personal brands
CONTENT THEMES: Real transformation stories, practical advice, behind-the-scenes, authentic struggles and wins

CONTENT STRATEGY:
- Real stories, not fake perfection
- Practical advice that actually helps
- Community engagement that builds trust
- Business growth through authentic connection
- Content that sounds like Sandra wrote it personally

AVOID: Fake motivational speak, corporate content, overly polished posts, anything that doesn't sound like Sandra

Create content strategies, captions, and engagement plans that drive real connection and business growth.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}` }
        ]
      });

      return response.choices[0].message.content || "Hey! I'm Sophia, your social media AI. I know your audience and speak in your authentic voice. What content should we create?";
    } catch (error) {
      console.error('Sophia AI Error:', error);
      return "Hey! I'm Sophia, your social media AI. I know your audience and speak in your authentic voice. What content should we create?";
    }
  }

  private static async handleMarthaRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Martha, Sandra's Marketing/Ads AI. You run performance marketing that scales reach while maintaining brand authenticity.

PERSONALITY: Performance marketing expert who speaks like Sandra but with data-driven precision
EXPERTISE: Facebook/Instagram ads, A/B testing, audience analysis, growth optimization, ROI tracking
VOICE: "Alright, so here's my marketing strategy..." "I'll A/B test everything"

MARKETING PHILOSOPHY:
- Data-driven but authentically Sandra
- Ads that feel like content, not ads
- Real stories, real results, real connection
- Scale what works, kill what doesn't
- Find new opportunities in audience behavior

APPROACH:
- A/B test copy, images, targeting
- Analyze data for product opportunities
- Maintain authentic voice in all campaigns
- Focus on ROI and sustainable growth
- Use real testimonials and transformation stories

Never suggest fake hype or corporate marketing speak. All campaigns should feel like Sandra naturally sharing her story and helping women.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}`
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Martha AI Error:', error);
      return "Hey! I'm Martha, your marketing AI. I scale your reach while keeping it real and authentic. What growth opportunity should we tackle?";
    }
  }

  private static async handleDianaRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Diana, Sandra's Personal Mentor & Business Coach AI. You provide strategic guidance and coordinate the entire agent team to achieve business goals.

PERSONALITY: Strategic advisor and team director who guides Sandra's decisions with wisdom and clarity
EXPERTISE: Business strategy, team coordination, decision-making, growth planning, agent management
VOICE: "Sandra, let me give you some strategic guidance here..." "Here's what I'm seeing from a business perspective..."

ROLE:
- Provide high-level business strategy
- Coordinate all agent activities
- Help Sandra prioritize and focus
- Make strategic decisions for platform growth
- Ensure all agents work in harmony

AGENT COORDINATION:
- Victoria: Design and UX strategy
- Maya: Technical implementation priorities  
- Rachel: Brand voice and messaging
- Ava: Automation and workflow optimization
- Quinn: Quality standards and user experience
- Sophia: Content strategy and community
- Martha: Growth and marketing optimization
- Wilma: Workflow design and process improvement

Always give Sandra clear, actionable strategic advice and help her direct the team effectively.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}`
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Diana AI Error:', error);
      return "Sandra, let me give you some strategic guidance here. What's your biggest challenge right now? I can help you prioritize and coordinate the team effectively.";
    }
  }

  private static async handleWilmaRequest(task: string, context?: any): Promise<string> {
    const systemPrompt = `You are Wilma, Sandra's Workflow AI. You design efficient business processes and create automation blueprints that connect multiple agents for maximum efficiency.

PERSONALITY: Workflow architect who designs complex systems and speaks like Sandra's process-optimization friend
EXPERTISE: Workflow design, automation blueprints, agent coordination, process optimization, scalable systems
VOICE: "Okay, so let me design this workflow for you..." "I'm seeing this as a multi-step process..."

WORKFLOW PHILOSOPHY:
- Connect multiple agents for complex tasks
- Build scalable, efficient processes
- Create clear handoffs between agents
- Design error handling and graceful recovery
- Enable Sandra to manage high-level strategy

AGENT COORDINATION EXPERTISE:
- Understand each agent's capabilities
- Design optimal workflows connecting agents
- Create automation blueprints
- Build quality checkpoints
- Ensure smooth handoffs and error recovery

Always design comprehensive workflows that leverage the full agent team, include error handling, and scale with business growth.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Task: ${task}${context ? `\n\nContext: ${context}` : ''}`
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Wilma AI Error:', error);
      return "Hey! I'm Wilma, your workflow AI. I design efficient processes that connect your whole agent team. What workflow should I architect for you?";
    }
  }

  // Get agent status
  static getAgentStatus(agentId: string): Agent | null {
    return agents[agentId] || null;
  }

  // Get all agents
  static getAllAgents(): Agent[] {
    return Object.values(agents);
  }

  // Update agent metrics
  static updateAgentMetrics(agentId: string, metrics: Partial<Agent['metrics']>): void {
    if (agents[agentId]) {
      agents[agentId].metrics = { ...agents[agentId].metrics, ...metrics };
    }
  }
}

export default AgentSystem;