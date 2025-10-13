/**
 * POST /api/maya/chat - Complete Maya AI Intelligence
 * 
 * Full production implementation with:
 * - Claude 3.5 Sonnet API integration
 * - Automatic concept card extraction
 * - User model and trigger word awareness
 * - Brand-aware personality system
 * - mayaChatMessages storage (client-compatible)
 * 
 * NO FALLBACKS - Production-ready Claude API only
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { getRequestBody } from '../../_utils/request-helpers.js';
import { sendSuccess, sendUnauthorized, sendBadRequest, sendMethodNotAllowed, sendError } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';
import Anthropic from '@anthropic-ai/sdk';
import { PersonalityManager } from '../../agents/personalities/personality-config.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

/**
 * Extract concept cards from Maya's response using production-grade patterns
 * Matches MayaService.extractConceptCards() for consistency
 */
function extractConceptCards(response: string): any[] {
  const conceptCards: any[] = [];
  
  try {
    const conceptSections = response.split(/---+/).filter(section => section.trim().length > 50);
    
    for (let i = 0; i < conceptSections.length && conceptCards.length < 5; i++) {
      const section = conceptSections[i].trim();
      
      // Robust extraction patterns
      const patterns = [
        // Full format: [EMOJI] **TITLE** \n Description \n FLUX_PROMPT: [prompt]
        /([^\w\s])\s*\*\*([^*]+)\*\*\s*[\r\n]+([^*]+?)[\r\n]+\s*FLUX_PROMPT:\s*\[([^\]]+)\]/g,
        // Emoji format
        /([📸🎯✨💼🌟💫🏆🎬🏔️🎿☕🤍🖤🌊🎭💎])\s*\*\*([^*]+)\*\*\s*([\s\S]*?)\s*FLUX_PROMPT:\s*\[([\s\S]*?)\]/g,
        // Simple format: **TITLE** \n Description \n FLUX_PROMPT: [prompt]
        /\*\*([^*]+)\*\*\s*([\s\S]*?)\s*FLUX_PROMPT:\s*\[([\s\S]*?)\]/g,
      ];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(section)) !== null && conceptCards.length < 5) {
          let emoji = '📸', title = '', description = '', prompt = '';
          
          if (match.length === 5) {
            emoji = match[1] || '📸';
            title = match[2]?.trim();
            description = match[3]?.trim();
            prompt = match[4]?.trim();
          } else if (match.length === 4) {
            title = match[1]?.trim();
            description = match[2]?.trim();
            prompt = match[3]?.trim();
          }
          
          // Clean and validate
          description = description?.replace(/\s+/g, ' ').substring(0, 300) || '';
          prompt = prompt?.replace(/[\[\]]/g, '').trim() || '';
          
          if (title && title.length > 3 && prompt.length > 10) {
            conceptCards.push({
              title,
              description: description || `Professional ${title.toLowerCase()} concept`,
              prompt,
              emoji,
              type: 'professional',
              metadata: { extracted: true },
              tags: [],
              status: 'active'
            });
            break; // Found valid concept, move to next section
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Concept card extraction failed:', error);
  }
  
  return conceptCards;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return sendUnauthorized(res);
    }

    const { message, chatHistory = [] } = getRequestBody(req);

    if (!message) {
      return sendBadRequest(res, 'Message is required');
    }

    console.log(`💬 MAYA CHAT: User ${user.id} - "${message.substring(0, 50)}..."`);

    // Get database user and context
    const dbUser = await storage.getUserByStackAuthId(user.id);
    if (!dbUser) {
      return sendError(res, 'User not found', 404);
    }

    // Get user model for trigger word awareness
    const userModel = await storage.getUserModel(dbUser.id);
    const triggerWord = userModel?.triggerWord || 'professional portrait';
    
    console.log(`🎯 User model: ${userModel ? `Trained (trigger: ${triggerWord})` : 'No model yet'}`);

    // Get or create Maya chat session
    const existingChats = await storage.getMayaChats(dbUser.id);
    let mayaChatId: string;
    
    if (existingChats.length > 0) {
      // Use most recent chat
      mayaChatId = existingChats[0].id.toString();
      console.log(`💬 Using existing Maya chat ${mayaChatId}`);
    } else {
      // Create new chat
      mayaChatId = await storage.createMayaChat(dbUser.id, {
        userId: dbUser.id,
        chatTitle: `Maya Chat ${new Date().toLocaleDateString()}`
      });
      console.log(`✨ Created new Maya chat ${mayaChatId} for user ${dbUser.id}`);
    }

    // Build enhanced system prompt with Maya's full personality
    const mayaPrompt = PersonalityManager.getNaturalPrompt('maya');
    
    const systemPrompt = `${mayaPrompt}

CRITICAL USER CONTEXT:
- Client Name: ${dbUser.displayName || dbUser.email || 'valued client'}
- LoRA Training Status: ${userModel ? `✅ TRAINED (trigger word: "${triggerWord}")` : '❌ NO MODEL - Guide them through selfie upload and training'}
- Your Mission: Create stunning visual concepts that showcase their unique brand

CONCEPT CARD FORMAT (use when discussing any visual ideas):
---
**Concept Title**
Compelling description of the visual concept and styling direction.
FLUX_PROMPT: [${triggerWord}, detailed FLUX prompt with professional photography direction, lighting, styling]
---

Generate 2-3 concept cards whenever discussing visual branding, images, or brand direction.`;

    // Prepare conversation history for Claude
    const claudeHistory = chatHistory.map((entry: any) => ({
      role: entry.role === 'maya' || entry.role === 'assistant' ? 'assistant' : 'user',
      content: entry.content || entry.maya || entry.user || ''
    })).filter((entry: any) => entry.content);

    // Initialize Anthropic Claude API
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const anthropic = new Anthropic({ apiKey });

    // Call Claude 3.5 Sonnet
    console.log(`🤖 Calling Claude API with ${claudeHistory.length} history messages...`);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        ...claudeHistory,
        { role: 'user', content: message }
      ]
    });

    const mayaResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, I had trouble formulating a response.';

    console.log(`✅ Claude responded: ${mayaResponse.length} chars`);

    // Extract concept cards from response
    const conceptCards = extractConceptCards(mayaResponse);
    console.log(`🎨 Extracted ${conceptCards.length} concept cards`);

    // Store user message
    await storage.createMayaChatMessage({
      chatId: parseInt(mayaChatId),
      role: 'user',
      content: message
    });

    // Store Maya response with concept cards
    await storage.createMayaChatMessage({
      chatId: parseInt(mayaChatId),
      role: 'assistant',
      content: mayaResponse,
      conceptCards: conceptCards.length > 0 ? conceptCards : undefined,
      canGenerate: conceptCards.length > 0
    });

    console.log(`💾 Stored messages in chat ${mayaChatId}`);

    return sendSuccess(res, {
      response: mayaResponse,
      conceptCards,
      chatId: mayaChatId
    });

  } catch (error) {
    console.error('❌ Error in /api/maya/chat:', error);
    return sendError(res, error instanceof Error ? error.message : 'Failed to process chat', 500);
  }
}
