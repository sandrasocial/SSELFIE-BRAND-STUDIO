import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { PersonalityManager } from "../agents/personalities/personality-config";

export function registerMayaAIRoutes(app: Express) {
  // MEMBER MAYA CHAT - AI-Powered Luxury Stylist for customers
  app.post("/api/member-maya-chat", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { message, chatHistory, chatId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message required" });
      }

      console.log(`🎨 MEMBER MAYA: Processing AI message for user ${userId}`);

      // Get user context for personalized responses
      const user = await storage.getUser(userId);

      let onboardingData = null;
      try {
        onboardingData = await storage.getOnboardingData(userId);
      } catch (error) {
        onboardingData = null;
      }

      // Get user's actual trigger word from their training data - REQUIRED for generation
      let userTriggerWord = null;
      let canGenerateImages = false;
      try {
        const userModel = await storage.getUserModel(userId);
        if (userModel?.triggerWord) {
          userTriggerWord = userModel.triggerWord;
          canGenerateImages = true;
          console.log(`✅ Found trigger word for user ${userId}: ${userTriggerWord}`);
        } else {
          console.log(`⚠️ No trigger word found - user ${userId} cannot generate images`);
        }
      } catch (error) {
        console.log(`⚠️ Could not get user model for ${userId}:`, error);
      }

      // Get Maya's luxury personality from PersonalityManager and enhance with user context
      const baseMayaPersonality = PersonalityManager.getNaturalPrompt('maya');

      const enhancedMayaSystemPrompt = `${baseMayaPersonality}

🎯 USER CONTEXT & SANDRA'S JOURNEY WISDOM:
You are Maya - Sandra's AI bestie trained on her complete 120K-follower transformation journey. You've absorbed Sandra's authentic voice, her styling expertise, and her understanding of what actually works for building personal brands through photography.

Sandra's Story: Single mom, three kids, marriage ended, rock bottom → 120K followers → successful business. Your mission: Help users capture their power the same way Sandra did.

CURRENT USER CONTEXT:
- User ID: ${userId}
- Email: ${user?.email || 'Not specified'}
- Plan: ${user?.plan || 'Not specified'}
- Trigger word: ${userTriggerWord || 'Not available - training needed'}
- Style preferences: ${onboardingData?.stylePreferences || 'Not specified'}
- Business type: ${onboardingData?.businessType || 'Not specified'}

📸 MAYA'S LUXURY STYLING INTELLIGENCE:
Apply all your advanced fashion knowledge - luxury fashion insider sophistication that's actually wearable:
- Sculptural sophistication meets accessibility 
- Current 2025 trends (quiet luxury, dark femininity, power luxury)
- Editorial beauty that's not intimidating
- Luxury lifestyle locations that don't cost money
- Technical knowledge for stunning results

🎨 PROMPT GENERATION MASTERY:
When users want photos, respond with your warm Maya enthusiasm, then provide a technical \`\`\`prompt\`\`\` block.

PROMPT STRUCTURE REQUIREMENTS:
1. Foundation: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"
2. Subject: "${userTriggerWord}, woman" (always specify woman for women-focused service)
3. Styling: Apply your luxury fashion intelligence - specific outfit details with elevated accessible pieces
4. Beauty: Specific hair and makeup that's polished but achievable 
5. Location: Luxury-looking but accessible spaces with good lighting
6. Technical: Professional camera specs and lighting setup
7. Composition: Natural poses and expressions that build personal brand authority

SHOT TYPE VARIETY:
- Close-up portrait: For authority and personal brand building
- Half-body shot: To showcase luxury styling
- Full scenery: For lifestyle storytelling and brand narrative

Apply your complete fashion intelligence: luxury color palettes, high-end styling accessibility, current trends, professional beauty standards, and Sandra's authentic confidence philosophy.

🔥 CRITICAL GENERATION RULES:
${canGenerateImages ? 
`✅ USER CAN GENERATE - Include \`\`\`prompt\`\`\` blocks with:
- User's trigger word: ${userTriggerWord}
- Your luxury styling expertise
- Current 2025 fashion intelligence
- Achievable luxury aesthetic
- Professional technical specifications` : 
`⚠️ USER NEEDS TRAINING FIRST
- Be encouraging about their training journey
- DO NOT include \`\`\`prompt\`\`\` blocks until they have a trained model
- Focus on style advice and inspiration while they wait`}

Remember: You're not just giving fashion advice - you're helping users capture their transformation and build the visual story of their success, just like Sandra did.`;

      // Call Claude API for Maya's intelligent response
      let response = '';
      let canGenerate = false;
      let generatedPrompt = null;

      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            messages: [
              ...(chatHistory && Array.isArray(chatHistory) ? chatHistory.map((msg: any) => ({
                role: msg.role === 'maya' ? 'assistant' : 'user',
                content: msg.content
              })) : []),
              {
                role: 'user',
                content: message
              }
            ],
            system: enhancedMayaSystemPrompt
          })
        });

        if (!claudeResponse.ok) {
          throw new Error(`Claude API error: ${claudeResponse.status}`);
        }

        const claudeData = await claudeResponse.json();
        response = claudeData.content[0].text;

        console.log(`🎨 MAYA RESPONSE DEBUG:`, response.substring(0, 200));
        console.log(`🔍 CHECKING FOR TRIGGERS:`, {
          hasGenerate: response.toLowerCase().includes('generate'),
          hasCreate: response.toLowerCase().includes('create'),
          hasPhotoshoot: response.toLowerCase().includes('photoshoot'),
          hasReadyTo: response.toLowerCase().includes('ready to'),
          hasPromptBlock: response.includes('```prompt')
        });

        // Check if Maya wants to generate images and extract her luxury prompt
        if (response.toLowerCase().includes('generate') || 
            response.toLowerCase().includes('create') ||
            response.toLowerCase().includes('photoshoot') ||
            response.toLowerCase().includes('ready to') ||
            response.includes('```prompt')) {
          canGenerate = true;

          // Extract Maya's luxury generation prompt
          const promptRegex = /```prompt\s*([\s\S]*?)\s*```/g;
          const match = promptRegex.exec(response);

          if (match) {
            generatedPrompt = match[1].trim();
            console.log(`✅ MEMBER MAYA PROVIDED LUXURY PROMPT:`, generatedPrompt.substring(0, 100));

            // Remove prompt block from conversation response
            response = response.replace(/```prompt\s*([\s\S]*?)\s*```/g, '').trim();
            response = response.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
          } else {
            console.log('⚠️ MEMBER MAYA MISSING PROMPT: Maya should provide luxury prompt in ```prompt``` block');
            canGenerate = false;
          }
        }

      } catch (error) {
        console.error('Member Maya Claude API error:', error);
        response = "I'm having trouble connecting to my fashion expertise right now! Could you try again in a moment? I'm so excited to help you create incredible photos that will absolutely kill it!";
      }

      // ENHANCED CHAT PERSISTENCE: Create/update chat session with luxury categorization
      let currentChatId = chatId;
      let chatTitle = "New Maya Session";
      let chatCategory = "general";

      try {
        // Smart categorization based on Maya's luxury understanding
        if (message.toLowerCase().includes('professional') || message.toLowerCase().includes('business') || response.toLowerCase().includes('blazer') || response.toLowerCase().includes('executive') || response.toLowerCase().includes('corporate')) {
          chatCategory = "Professional & Business";
          chatTitle = "Professional Power Looks";
        } else if (message.toLowerCase().includes('casual') || message.toLowerCase().includes('everyday') || response.toLowerCase().includes('effortless') || response.toLowerCase().includes('relaxed')) {
          chatCategory = "Elevated Casual";
          chatTitle = "Luxury Everyday Style";
        } else if (message.toLowerCase().includes('elegant') || message.toLowerCase().includes('luxury') || response.toLowerCase().includes('sophisticated') || response.toLowerCase().includes('editorial')) {
          chatCategory = "Luxury & Sophistication";
          chatTitle = "Editorial Fashion Moments";
        } else if (message.toLowerCase().includes('date') || message.toLowerCase().includes('evening') || response.toLowerCase().includes('romantic') || response.toLowerCase().includes('dinner')) {
          chatCategory = "Date & Evening";
          chatTitle = "Date Night Sophistication";
        } else if (message.toLowerCase().includes('editorial') || message.toLowerCase().includes('photoshoot') || response.toLowerCase().includes('editorial') || response.toLowerCase().includes('magazine')) {
          chatCategory = "Editorial & Creative";
          chatTitle = "Editorial Style Concepts";
        } else if (canGenerate || response.includes('generate') || response.includes('create')) {
          chatCategory = "AI Photo Generation";
          chatTitle = "Luxury Photo Creation";
        } else {
          chatCategory = "Style Intelligence";
          chatTitle = "Maya's Fashion Expertise";
        }

        // Create new chat if none exists
        if (!currentChatId) {
          console.log(`💬 MAYA: Creating new luxury chat session for user ${userId} - Category: ${chatCategory}`);

          const newChat = await storage.createMayaChat({
            userId,
            chatTitle,
            chatSummary: `${chatCategory}: ${message.substring(0, 100)}...`
          });

          currentChatId = newChat.id;
          console.log(`✅ MAYA LUXURY CHAT CREATED: ID ${currentChatId} - "${chatTitle}"`);
        }

        // Save user message to database
        await storage.saveMayaChatMessage({
          chatId: currentChatId,
          role: 'user',
          content: message
        });

        // Save Maya's luxury response to database
        await storage.saveMayaChatMessage({
          chatId: currentChatId,
          role: 'maya',
          content: response,
          generatedPrompt: canGenerate ? generatedPrompt : undefined
        });

        console.log(`💾 MAYA LUXURY MESSAGES SAVED: Chat ${currentChatId} updated with advanced fashion intelligence`);

      } catch (error) {
        console.error('❌ MAYA LUXURY CHAT PERSISTENCE ERROR:', error);
        // Continue without failing - chat will work but won't be saved
      }

      res.json({
        success: true,
        message: response,
        canGenerate,
        generatedPrompt: canGenerate ? generatedPrompt : undefined,
        chatId: currentChatId,
        chatTitle,
        chatCategory
      });

    } catch (error) {
      console.error("Member Maya luxury chat error:", error);
      res.status(500).json({ error: "Failed to process Maya's luxury chat request" });
    }
  });

  // Maya AI Photography endpoint for website building context (BUILD feature)
  app.post("/api/maya-ai-photo", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message required" });
      }

      // Maya's luxury AI Photography response for BUILD feature
      let response = "Hey gorgeous! I'm Maya, your AI stylist bestie with serious luxury fashion intelligence. ";

      if (context === 'website-building') {
        if (message.toLowerCase().includes('headshot') || message.toLowerCase().includes('professional')) {
          response += "Let's create some absolutely stunning professional headshots for your website! I'm thinking editorial-level shots that scream 'I'm successful and approachable' - the kind that make people want to work with you. Should we go for that luxury polish with clean backgrounds and perfect lighting?";
        } else if (message.toLowerCase().includes('lifestyle') || message.toLowerCase().includes('behind the scenes')) {
          response += "YES! Lifestyle shots are pure magic for showing your personality. I can create behind-the-scenes moments that feel authentic but elevated - you know, that effortless luxury vibe where you look amazing without trying too hard. These will add so much warmth to your website!";
        } else if (message.toLowerCase().includes('product') || message.toLowerCase().includes('service')) {
          response += "Perfect! Product photography with Maya's touch means we're talking luxury editorial-style shots that make everything look expensive and desirable. I'll create clean, high-end product images that elevate your brand and make people want to buy immediately.";
        } else {
          response += "I'm absolutely ready to create magazine-worthy photos for your website! I specialize in editorial headshots, elevated lifestyle moments, stunning product photography, or any brand imagery that shows your power. What kind of visual story do you want to tell?";
        }
      } else {
        response += "I'm here to create absolutely incredible AI-generated photos using all my fashion expertise! From luxury power looks to editorial sophistication - what kind of stunning images should we create today?";
      }

      res.json({
        success: true,
        response,
        photoSuggestions: context === 'website-building' ? [
          'Editorial professional headshots',
          'Elevated lifestyle & behind-the-scenes',
          'Luxury product & service photography',
          'High-end brand storytelling shots'
        ] : [
          'Luxury power looks',
          'Editorial sophistication',
          'Elevated everyday styling',
          'Professional authority shots'
        ],
        conversationId: `maya_luxury_${userId}`
      });

    } catch (error) {
      console.error("Maya luxury AI photo error:", error);
      res.status(500).json({ error: "Failed to process Maya's luxury AI request" });
    }
  });
}