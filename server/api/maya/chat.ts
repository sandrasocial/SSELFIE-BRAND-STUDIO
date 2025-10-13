/**
 * POST /api/maya/chat - Maya AI with PersonalityManager
 * Uses existing mayaChatMessages table (NOT conversations/messages)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { getRequestBody } from '../../_utils/request-helpers.js';
import { sendSuccess, sendUnauthorized, sendBadRequest, sendMethodNotAllowed, sendError } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';
import Anthropic from '@anthropic-ai/sdk';
import { PersonalityManager } from '../../agents/personalities/personality-config.js';
import type { ConceptCard } from '../../../shared/types/concept-card.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

function extractConceptCards(response: string): ConceptCard[] {
  const conceptCards: ConceptCard[] = [];
  const sections = response.split(/---+/).filter(s => s.trim().length > 50);
  
  for (const section of sections) {
    const titleMatch = section.match(/\*\*([^*]+)\*\*/);
    const fluxMatch = section.match(/FLUX_PROMPT:\s*\[([^\]]+)\]/i);
    
    if (titleMatch && fluxMatch) {
      conceptCards.push({
        id: `concept-${Date.now()}-${Math.random()}`,
        title: titleMatch[1].trim(),
        description: section.substring(0, 200).trim(),
        fluxPrompt: fluxMatch[1].trim(),
        emoji: '📸'
      });
    }
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

    // Get user model for trigger word
    const userModel = await storage.getUserModel(user.id);
    const triggerWord = userModel?.triggerWord || 'professional portrait';
    
    // Get or create Maya chat
    const existingChats = await storage.getMayaChats(user.id);
    let chatId: string;
    
    if (existingChats.length > 0) {
      chatId = existingChats[0].id.toString();
    } else {
      chatId = await storage.createMayaChat(user.id, {
        userId: user.id,
        chatTitle: `Maya Chat ${new Date().toLocaleDateString()}`
      });
    }

    // Get dynamic creative look and build enhanced prompt
    const creativeLook = PersonalityManager.getRandomCreativeLook();
    const systemPrompt = PersonalityManager.buildDynamicMayaPrompt(creativeLook);
    
    console.log(`🎨 MAYA: Using creative look "${creativeLook.name}"`);

    // Build conversation history
    const messages = chatHistory.map((entry: any) => ({
      role: (entry.role === 'assistant' || entry.role === 'maya') ? 'assistant' : 'user',
      content: entry.content || ''
    })).filter((m: any) => m.content);

    messages.push({ role: 'user', content: message });

    // Call Claude with PersonalityManager prompt
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages as any
    });

    const mayaResponse = response.content[0].type === 'text' ? response.content[0].text : '';
    const conceptCards = extractConceptCards(mayaResponse);
    
    console.log(`✅ MAYA: Generated response with ${conceptCards.length} concept cards`);

    // Store in mayaChatMessages table
    await storage.createMayaChatMessage({
      chatId: parseInt(chatId),
      role: 'user',
      content: message
    });

    await storage.createMayaChatMessage({
      chatId: parseInt(chatId),
      role: 'assistant',
      content: mayaResponse,
      conceptCards: conceptCards.length > 0 ? conceptCards : undefined
    });

    // Return data directly (frontend expects unwrapped response)
    res.status(200).json({
      response: mayaResponse,
      conceptCards,
      chatId
    });

  } catch (error) {
    console.error('❌ Error in /api/maya/chat:', error);
    return sendError(res, error instanceof Error ? error.message : 'Failed to process chat', 500);
  }
}
