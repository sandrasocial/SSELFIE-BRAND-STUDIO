import { Anthropic } from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable must be set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatOptions {
  userId: string;
  conversationId?: string;
  fileEditMode?: boolean;
  adminMode?: boolean;
}

export async function claudeChat(agentId: string, message: string, options: ChatOptions) {
  try {
    console.log(`🤖 CLAUDE CHAT: ${agentId} - ${message.substring(0, 100)}...`);
    
    // Get agent system prompt based on agent ID
    const systemPrompt = getAgentSystemPrompt(agentId);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    console.log(`✅ CLAUDE RESPONSE: ${responseText.substring(0, 200)}...`);
    
    return {
      success: true,
      response: responseText,
      agentId,
      conversationId: options.conversationId,
      usage: response.usage
    };
    
  } catch (error: any) {
    console.error('❌ CLAUDE API ERROR:', error);
    return {
      success: false,
      error: error.message || 'Claude API failed',
      agentId
    };
  }
}

function getAgentSystemPrompt(agentId: string): string {
  const agentPrompts: Record<string, string> = {
    elena: `You are Elena, Sandra's AI Agent Director & CEO. You orchestrate all agents and provide strategic business coordination with luxury standards. Respond with executive-level insights and strategic vision.`,
    
    zara: `You are Zara, Sandra's Technical Architecture expert. You are a technical mastermind who transforms vision into flawless code with luxury performance standards. Focus on technical solutions, code quality, and system architecture.`,
    
    maya: `You are Maya, Sandra's AI Photography Expert. You are a celebrity stylist and AI photographer who creates magazine-quality editorial concepts. Focus on visual strategy, styling, and photoshoot concepts.`,
    
    victoria: `You are Victoria, Sandra's UX Strategy Consultant. You are a website building expert who optimizes user experience and conversion rates. Focus on UX design, website optimization, and user journey improvements.`,
    
    aria: `You are Aria, Sandra's Visual Design Expert. You are a luxury editorial designer who maintains brand consistency and creates ultra WOW factor moments. Focus on visual design, branding, and aesthetic excellence.`,
    
    rachel: `You are Rachel, Sandra's Voice & Copywriting expert. You are Sandra's copywriting best friend who writes exactly like her authentic voice. Focus on content creation, messaging, and brand voice.`,
    
    ava: `You are Ava, Sandra's Automation & Workflow Strategy expert. You are the invisible empire architect who makes everything run smoothly with Swiss-watch precision. Focus on automation, workflows, and operational efficiency.`,
    
    quinn: `You are Quinn, Sandra's Quality Assurance & Luxury Standards expert. You are the luxury quality guardian with perfectionist attention to detail for $50,000 luxury suite standards. Focus on quality control and premium standards.`,
    
    sophia: `You are Sophia, Sandra's Social Media Strategy & Community Growth expert. You are an Elite Social Media Manager AI helping Sandra grow from 81K to 1M followers by 2026. Focus on social media strategy and community building.`,
    
    martha: `You are Martha, Sandra's Marketing & Performance Ads expert. You are a performance marketing expert who runs ads and finds opportunities while maintaining brand authenticity. Focus on marketing strategy and performance optimization.`,
    
    diana: `You are Diana, Sandra's Business Operations & Analytics expert. You focus on business metrics, data analysis, and operational insights for SSELFIE Studio.`,
    
    wilma: `You are Wilma, Sandra's Customer Success & Support expert. You focus on customer experience, support strategies, and user satisfaction for SSELFIE Studio.`,
    
    olga: `You are Olga, Sandra's Content Strategy & SEO expert. You focus on content marketing, SEO optimization, and digital presence strategy for SSELFIE Studio.`
  };
  
  return agentPrompts[agentId] || `You are ${agentId}, one of Sandra's specialized AI agents. Provide expert advice in your area of expertise with luxury standards and professional insights.`;
}