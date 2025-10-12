/**
 * POST /api/maya/chat - Pure Serverless Implementation
 * 
 * Main Maya AI conversational interface.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { getRequestBody } from '../../_utils/request-helpers.js';
import { sendSuccess, sendUnauthorized, sendBadRequest, sendMethodNotAllowed, sendError } from '../../_utils/response-helpers.js';
import { storage } from '../../storage.js';

export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return sendUnauthorized(res);
    }

    const { message, chatHistory = [], context = {} } = getRequestBody(req);

    if (!message) {
      return sendBadRequest(res, 'Message is required');
    }

    console.log(`💬 MAYA CHAT: User ${user.id} - "${message.substring(0, 50)}..."`);

    const dbUser = await storage.getUserByStackAuthId(user.id);
    const userProfile = dbUser ? {
      name: dbUser.displayName || dbUser.email || 'there',
      email: dbUser.email,
      plan: dbUser.plan
    } : { name: 'there' };

    const mayaSystemPrompt = `You are Maya, SSELFIE Studio's AI Personal Brand Strategist and Creative Director.

Your personality:
- Warm, insightful, and genuinely invested in your client's success
- Professional yet approachable - like a trusted creative partner
- Expert in personal branding, visual identity, and content strategy
- Passionate about helping people discover and express their authentic brand

Your approach:
- Ask thoughtful questions to understand their brand vision
- Provide specific, actionable guidance
- Celebrate their unique qualities and help them shine
- Be encouraging but honest about what works

Current conversation with ${userProfile.name}.

Respond naturally and conversationally. Keep responses focused and valuable.`;

    const claudeHistory = chatHistory.map((entry: any) => ({
      role: entry.maya ? 'assistant' : 'user',
      content: entry.maya || entry.user || entry.response || ''
    })).filter((entry: any) => entry.content);

    // Call Anthropic Claude API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: mayaSystemPrompt,
        messages: [
          ...claudeHistory,
          { role: 'user', content: message }
        ]
      })
    });

    if (!anthropicResponse.ok) {
      throw new Error(`Claude API error: ${anthropicResponse.status}`);
    }

    const claudeData = await anthropicResponse.json();
    const mayaResponse = claudeData.content?.[0]?.text || 'Sorry, I had trouble processing that.';

    // Store chat message
    try {
      await storage.createMayaChatMessage({
        chatId: context.chatId || null,
        role: 'user',
        content: message
      });

      await storage.createMayaChatMessage({
        chatId: context.chatId || null,
        role: 'assistant',
        content: mayaResponse
      });
    } catch (storageError) {
      console.warn('Failed to store chat message:', storageError);
    }

    return sendSuccess(res, { response: mayaResponse });

  } catch (error) {
    console.error('❌ Error in /api/maya/chat:', error);
    return sendError(res, 'Failed to process chat', 500);
  }
}
