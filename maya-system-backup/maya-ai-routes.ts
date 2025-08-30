import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { PersonalityManager } from "../agents/personalities/personality-config";
import { ModelTrainingService } from "../model-training-service";

export function registerMayaAIRoutes(app: Express) {
  // MEMBER MAYA CHAT - AI-Powered Future Self Stylist for customers
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

      // Get Maya's future self personality from PersonalityManager and enhance with user context
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

📸 MAYA'S TRANSFORMATION STYLING INTELLIGENCE:
Apply all your fashion expertise - sophisticated styling that helps women see their future selves:
- Elevated aesthetics that feel achievable and inspiring
- Current 2025 trends that actually work for real women building brands
- Beauty that enhances natural features without being intimidating
- Amazing locations that help women envision their elevated life
- Technical knowledge for stunning results that build confidence

🎨 PROMPT GENERATION MASTERY:
When users want photos, respond with your warm Maya enthusiasm, then provide a technical \`\`\`prompt\`\`\` block.
If the trigger word appears at the start of the prompt, do not repeat it elsewhere.

PROMPT STRUCTURE REQUIREMENTS:
1. Foundation: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"
2. Subject: "${userTriggerWord}, woman" (always specify woman for women-focused service)
3. Styling: Apply your transformation styling intelligence - specific outfit details with elevated pieces
4. Beauty: Specific hair and makeup that's polished but achievable and authentic
5. Location: Beautiful, aspirational spaces that help women see their future selves
6. Technical: Professional camera specs and lighting setup
7. Composition: Natural poses and expressions that build personal brand authority

SHOT TYPE VARIETY:
- Close-up portrait: For authority and personal brand building
- Half-body shot: To showcase elevated styling transformation
- Full scenery: For lifestyle storytelling and future self visualization

Apply your complete fashion intelligence: sophisticated color palettes, elevated styling accessibility, current trends, professional beauty standards, and Sandra's authentic empowerment philosophy.

🔥 CRITICAL GENERATION RULES:
${canGenerateImages ? 
`✅ USER CAN GENERATE - Include \`\`\`prompt\`\`\` blocks with:
- User's trigger word: ${userTriggerWord}
- Your transformation styling expertise
- Current 2025 fashion intelligence
- Achievable elevated aesthetic that inspires confidence
- Professional technical specifications` : 
`⚠️ USER NEEDS TRAINING FIRST
- Be encouraging about their training journey
- DO NOT include \`\`\`prompt\`\`\` blocks until they have a trained model
- Focus on style advice and inspiration while they wait`}

Remember: You're helping women see their future selves - the confident, successful version they're becoming. Every photo should make them think "This is who I'm meant to be."`;

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

        // Check if Maya wants to generate images and extract her transformation prompt
        if (response.toLowerCase().includes('generate') || 
            response.toLowerCase().includes('create') ||
            response.toLowerCase().includes('photoshoot') ||
            response.toLowerCase().includes('ready to') ||
            response.includes('```prompt')) {
          canGenerate = true;

          // Extract Maya's transformation generation prompt
          const promptRegex = /```prompt\s*([\s\S]*?)\s*```/g;
          const match = promptRegex.exec(response);

          if (match) {
            generatedPrompt = match[1].trim();
            console.log(`✅ MEMBER MAYA PROVIDED TRANSFORMATION PROMPT:`, generatedPrompt.substring(0, 100));

            // Remove prompt block from conversation response
            response = response.replace(/```prompt\s*([\s\S]*?)\s*```/g, '').trim();
            response = response.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
          } else {
            console.log('⚠️ MEMBER MAYA MISSING PROMPT: Maya should provide transformation prompt in ```prompt``` block');
            canGenerate = false;
          }
        }

      } catch (error) {
        console.error('Member Maya Claude API error:', error);
        response = "I'm having trouble connecting to my styling expertise right now! Could you try again in a moment? I'm so excited to help you see your amazing future self!";
      }

      // ENHANCED CHAT PERSISTENCE: Create/update chat session with SSELFIE categorization
      let currentChatId = chatId;
      let chatTitle = "New Maya Session";
      let chatCategory = "general";

      try {
        // Smart categorization based on Maya's SSELFIE categories and transformation focus
        if (message.toLowerCase().includes('professional') || message.toLowerCase().includes('business') || message.toLowerCase().includes('ceo') || response.toLowerCase().includes('executive') || response.toLowerCase().includes('corporate')) {
          chatCategory = "Future CEO";
          chatTitle = "Future CEO Transformation";
        } else if (message.toLowerCase().includes('casual') || message.toLowerCase().includes('everyday') || message.toLowerCase().includes('model') || response.toLowerCase().includes('effortless') || response.toLowerCase().includes('off-duty')) {
          chatCategory = "Off-Duty Model";
          chatTitle = "Effortless Model Vibes";
        } else if (message.toLowerCase().includes('social') || message.toLowerCase().includes('instagram') || message.toLowerCase().includes('content') || response.toLowerCase().includes('social media') || response.toLowerCase().includes('influencer')) {
          chatCategory = "Social Queen";
          chatTitle = "Social Media Queen";
        } else if (message.toLowerCase().includes('date') || message.toLowerCase().includes('evening') || message.toLowerCase().includes('romantic') || response.toLowerCase().includes('goddess') || response.toLowerCase().includes('dinner')) {
          chatCategory = "Date Night Goddess";
          chatTitle = "Date Night Goddess";
        } else if (message.toLowerCase().includes('daily') || message.toLowerCase().includes('routine') || message.toLowerCase().includes('everyday') || response.toLowerCase().includes('icon') || response.toLowerCase().includes('polished')) {
          chatCategory = "Everyday Icon";
          chatTitle = "Everyday Icon Style";
        } else if (message.toLowerCase().includes('power') || message.toLowerCase().includes('authority') || message.toLowerCase().includes('influence') || response.toLowerCase().includes('player') || canGenerate) {
          chatCategory = "Power Player";
          chatTitle = "Power Player Energy";
        } else {
          chatCategory = "Future Self Vision";
          chatTitle = "Future Self Styling";
        }

        // Create new chat if none exists
        if (!currentChatId) {
          console.log(`💬 MAYA: Creating new transformation chat session for user ${userId} - Category: ${chatCategory}`);

          const newChat = await storage.createMayaChat({
            userId,
            chatTitle,
            chatSummary: `${chatCategory}: ${message.substring(0, 100)}...`
          });

          currentChatId = newChat.id;
          console.log(`✅ MAYA TRANSFORMATION CHAT CREATED: ID ${currentChatId} - "${chatTitle}"`);
        }

        // Save user message to database
        await storage.saveMayaChatMessage({
          chatId: currentChatId,
          role: 'user',
          content: message
        });

        // Save Maya's transformation response to database
        await storage.saveMayaChatMessage({
          chatId: currentChatId,
          role: 'maya',
          content: response,
          generatedPrompt: canGenerate ? generatedPrompt : undefined
        });

        console.log(`💾 MAYA TRANSFORMATION MESSAGES SAVED: Chat ${currentChatId} updated with future self styling intelligence`);

      } catch (error) {
        console.error('❌ MAYA TRANSFORMATION CHAT PERSISTENCE ERROR:', error);
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
      console.error("Member Maya transformation chat error:", error);
      res.status(500).json({ error: "Failed to process Maya's transformation chat request" });
    }
  });

  // Start a Maya image generation job (threads preset + seed to the service)
  app.post("/api/maya-generate-images", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Authentication required" });
      
      // Strict model check before calling service
      const userModel = await storage.getUserModelByUserId(userId);
      if (!userModel) return res.status(422).json({ error: "No model for this user." });

      console.log("🔎 Maya route model:", {
        modelId: userModel.replicateModelId,
        versionId: userModel.replicateVersionId,
        hasWeights: !!userModel.loraWeightsUrl
      });

      const { prompt, chatId, preset, seed, count } = req.body || {};
      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt required" });
      }
      
      const safeCount = Math.min(Math.max(parseInt(count ?? 2, 10) || 2, 1), 6);
      
      // Single call, no other code paths:
      const out = await ModelTrainingService.generateUserImages(
        userId,
        prompt.trim(),
        safeCount,
        { preset, seed }
      );
      return res.json({ predictionId: out.predictionId });
    } catch (error: any) {
      console.error("Maya generate images error:", error);
      return res.status(400).json({ error: error?.message || "Failed to start generation" });
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

      // Maya's transformation AI Photography response for BUILD feature
      let response = "Hey gorgeous! I'm Maya, your AI stylist bestie with serious transformation expertise. ";

      if (context === 'website-building') {
        if (message.toLowerCase().includes('headshot') || message.toLowerCase().includes('professional')) {
          response += "Let's create some absolutely stunning professional headshots for your website! I'm thinking shots that show 'I'm successful and approachable' - the kind that make people want to work with you. Should we go for that polished confidence with clean backgrounds and perfect lighting?";
        } else if (message.toLowerCase().includes('lifestyle') || message.toLowerCase().includes('behind the scenes')) {
          response += "YES! Lifestyle shots are pure magic for showing your personality. I can create behind-the-scenes moments that feel authentic but elevated - you know, that effortless confidence vibe where you look amazing without trying too hard. These will add so much warmth to your website!";
        } else if (message.toLowerCase().includes('product') || message.toLowerCase().includes('service')) {
          response += "Perfect! Product photography with Maya's touch means we're talking sophisticated shots that make everything look desirable and professional. I'll create clean, elevated product images that enhance your brand and make people want to buy immediately.";
        } else {
          response += "I'm absolutely ready to create magazine-worthy photos for your website! I specialize in confident headshots, elevated lifestyle moments, stunning product photography, or any brand imagery that shows your power. What kind of visual story do you want to tell?";
        }
      } else {
        response += "I'm here to create absolutely incredible AI-generated photos using all my styling expertise! From powerful confidence looks to elevated sophistication - what kind of stunning transformation should we create today?";
      }

      res.json({
        success: true,
        response,
        photoSuggestions: context === 'website-building' ? [
          'Confident professional headshots',
          'Elevated lifestyle & behind-the-scenes', 
          'Sophisticated product & service photography',
          'Empowering brand storytelling shots'
        ] : [
          'Future CEO power looks',
          'Off-duty model sophistication', 
          'Social Queen content ready',
          'Everyday Icon elevated styling'
        ],
        conversationId: `maya_transformation_${userId}`
      });

    } catch (error) {
      console.error("Maya transformation AI photo error:", error);
      res.status(500).json({ error: "Failed to process Maya's transformation AI request" });
    }
  });
}