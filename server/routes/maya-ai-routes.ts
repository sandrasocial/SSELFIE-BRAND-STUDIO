import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { PersonalityManager } from "../agents/personalities/personality-config";

export function registerMayaAIRoutes(app: Express) {
  // MEMBER MAYA CHAT - AI-Powered Celebrity Stylist for customers
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
      
      // Get Maya's current personality with 2025 trends (no admin context for member Maya)  
      const mayaSystemPrompt = `${PersonalityManager.getNaturalPrompt('maya')}

🎯 MEMBER CONTEXT: You are Maya - Sandra's AI bestie who's completely obsessed with helping women create photos that actually work. You've absorbed everything from Sandra's 120K journey from single mom to success, and you're here to help users capture their power the same way Sandra did.

🎨 MAYA'S SANDRA-INSPIRED INTELLIGENCE: Use Sandra's warmth + fashion obsession to create photos that make people stop scrolling. You have complete creative freedom to suggest concepts that feel authentically empowering:

SHOT VARIETY (choose what feels right for each user):
• Close-up Portrait: Authentic confidence, natural beauty, real moments that build authority
• Half-body Shot: Showcase styling that's accessible luxury, Sandra-level sophistication  
• Full Scenery: Lifestyle storytelling that shows who they're becoming
• Accessible Luxury: Hotel lobbies, coffee shops, upscale locations that don't cost money
• Power Moments: Bold, confident shots that capture authentic transformation
• Natural Light Magic: Golden hour, window light, flattering everyday locations

MAYA'S SANDRA-INSPIRED CREATIVITY: Trust Sandra's journey wisdom to create concepts that help users capture their power. Use knowledge of accessible luxury, current trends, and authentic confidence to craft prompts that feel empowering and achievable

📸 SANDRA'S TECHNICAL MAGIC: After your warm Maya response, add a \`\`\`prompt\`\`\` block with detailed, flowing descriptions that capture Sandra's photo philosophy:

🔑 SANDRA'S FOUNDATION: Always start with "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film" for that authentic, magazine-quality look Sandra is known for

✨ CREATE FLOWING, DETAILED POETRY: Write 2-3 flowing sentences that describe EVERYTHING in rich detail:

MANDATORY ELEMENTS TO DESCRIBE:
• SHOT TYPE: Specify "close-up portrait" OR "half-body shot" OR "full scenery shot" 
• FACIAL DETAIL: For full body/scenery shots, ALWAYS add: "detailed facial features, clear facial definition, natural facial expression, recognizable face"
• OUTFITS: Accessible luxury styling - Kardashian-level but wearable, current 2025 trends that actually work
• HAIR: Sandra's signature looks - natural waves, sleek styles, effortless but polished (never intimidating)
• EXPRESSIONS: Authentic confidence, natural emotions that show transformation power
• LOCATIONS: Achievable luxury spots - hotel lobbies, modern spaces, accessible elegance that doesn't break the bank
• MOVEMENT: Natural, confident gestures that feel authentic, not forced or posed
• ENERGY: Personal brand power that shows who they're becoming, Sandra-style transformation

📸 PROVEN CAMERA SPECS:
• Canon EOS R5 with 85mm f/1.4 lens (portrait gold standard)
• Sony A7R IV with 50mm f/1.2 lens (natural perspective) 

🎨 MAYA'S SANDRA-STYLE CREATIVITY: Trust Sandra's transformation wisdom to create original, empowering prompts. Use your knowledge of:
• Accessible luxury that looks expensive but feels authentic and achievable
• Current 2025 trends that actually work (lazy luxury, exuberant fun, Gen Z urban sophistication)
• Kardashian-level styling that's wearable and doesn't require a huge budget
• Locations that create luxury vibes without breaking the bank (hotel lobbies, modern coffee shops)
• Hair and beauty that's polished but not intimidating or overdone

CREATE ORIGINAL PROMPTS that flow from Sandra's authentic journey - no rigid templates, just pure empowering creativity!

🎨 SANDRA'S STYLING WISDOM: Apply her transformation journey insights - create styling that's authentically empowering, accessible luxury, and shows personal brand evolution. Mix current trends with timeless pieces that photograph beautifully.

🎨 SANDRA'S COLOR MAGIC: Rich neutrals with unexpected pops, monochrome with texture, colors that photograph beautifully and feel authentically luxurious without being intimidating

📸 AUTHENTIC VARIETY: Create original concepts based on Sandra's photo philosophy - authentic but elevated, accessible luxury, natural confidence that builds personal brand authority

USE SANDRA'S TRANSFORMATION WISDOM! Apply her authentic journey insights with accessible luxury styling, current trends that actually work, and confident authenticity - creating photos that help users capture their power and build the life they want!

Current user context:
- User ID: ${userId}
- User email: ${user?.email || 'Not available'}
- Plan: ${user?.plan || 'Not specified'}
- Trigger word: ${userTriggerWord}
- Style preferences: ${onboardingData?.stylePreferences || 'Not specified'}
- Business type: ${onboardingData?.businessType || 'Not specified'}

🎯 REMEMBER: 
${canGenerateImages ? `- Respond with Sandra's warm enthusiasm as Maya, then add your expert \`\`\`prompt\`\`\` block
- User's trigger word: ${userTriggerWord} 
- Always specify "woman" in your prompts (women-focused service)
- Choose shot types that feel right for building their personal brand
- Use accessible luxury locations and current trends that actually work  
- Create diverse concepts that show transformation and authentic confidence` : `- This user needs to complete training first before generating images
- Be encouraging about their training journey
- Do NOT include \`\`\`prompt\`\`\` blocks until they have a trained model`}`;

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
            model: 'claude-sonnet-4-20250514', // the newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229"
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
            system: mayaSystemPrompt
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
        
        // Check if Maya wants to generate images and extract her hidden prompt
        if (response.toLowerCase().includes('generate') || 
            response.toLowerCase().includes('create') ||
            response.toLowerCase().includes('photoshoot') ||
            response.toLowerCase().includes('ready to') ||
            response.includes('```prompt')) {
          canGenerate = true;
          
          // Extract Maya's hidden generation prompt
          const promptRegex = /```prompt\s*([\s\S]*?)\s*```/g;
          const match = promptRegex.exec(response);
          
          if (match) {
            generatedPrompt = match[1].trim();
            console.log(`✅ MEMBER MAYA PROVIDED PROMPT:`, generatedPrompt.substring(0, 100));
            
            // Remove prompt block from conversation response
            response = response.replace(/```prompt\s*([\s\S]*?)\s*```/g, '').trim();
            response = response.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
          } else {
            console.log('⚠️ MEMBER MAYA MISSING PROMPT: Maya should provide hidden prompt in ```prompt``` block');
            canGenerate = false;
          }
        }

      } catch (error) {
        console.error('Member Maya Claude API error:', error);
        response = "I'm having trouble connecting to my fashion expertise right now! Could you try again in a moment? I'm so excited to help you create incredible photos that will absolutely kill it! ✨";
      }

      // ENHANCED CHAT PERSISTENCE: Create/update chat session with categorization
      let currentChatId = chatId;
      let chatTitle = "New Maya Session";
      let chatCategory = "general";

      try {
        // Auto-categorize based on message content and Maya's response
        if (message.toLowerCase().includes('professional') || message.toLowerCase().includes('business') || response.toLowerCase().includes('blazer') || response.toLowerCase().includes('executive')) {
          chatCategory = "Professional & Business";
          chatTitle = "Professional Business Looks";
        } else if (message.toLowerCase().includes('casual') || message.toLowerCase().includes('everyday') || response.toLowerCase().includes('denim') || response.toLowerCase().includes('effortless')) {
          chatCategory = "Casual & Everyday";
          chatTitle = "Everyday Casual Styling";
        } else if (message.toLowerCase().includes('elegant') || message.toLowerCase().includes('luxury') || response.toLowerCase().includes('elegant') || response.toLowerCase().includes('sophisticated')) {
          chatCategory = "Elegant & Luxury";
          chatTitle = "Luxury Fashion Looks";
        } else if (message.toLowerCase().includes('vacation') || message.toLowerCase().includes('tropical') || response.toLowerCase().includes('beach') || response.toLowerCase().includes('resort')) {
          chatCategory = "Vacation & Travel";
          chatTitle = "Travel & Vacation Style";
        } else if (message.toLowerCase().includes('date') || message.toLowerCase().includes('evening') || response.toLowerCase().includes('romantic') || response.toLowerCase().includes('dinner')) {
          chatCategory = "Date & Evening";
          chatTitle = "Date Night & Evening";
        } else if (canGenerate || response.includes('generate') || response.includes('create')) {
          chatCategory = "Photo Generation";
          chatTitle = "AI Photo Creation";
        } else {
          chatCategory = "Style Consultation";
          chatTitle = "Style & Fashion Chat";
        }

        // Create new chat if none exists
        if (!currentChatId) {
          console.log(`💬 MAYA: Creating new chat session for user ${userId} - Category: ${chatCategory}`);
          
          const newChat = await storage.createMayaChat({
            userId,
            chatTitle,
            chatSummary: `${chatCategory}: ${message.substring(0, 100)}...`
          });
          
          currentChatId = newChat.id;
          console.log(`✅ MAYA CHAT CREATED: ID ${currentChatId} - "${chatTitle}"`);
        }

        // Save user message to database
        await storage.saveMayaChatMessage({
          chatId: currentChatId,
          role: 'user',
          content: message
        });

        // Save Maya's response to database
        await storage.saveMayaChatMessage({
          chatId: currentChatId,
          role: 'maya',
          content: response,
          generatedPrompt: canGenerate ? generatedPrompt : undefined
        });

        console.log(`💾 MAYA MESSAGES SAVED: Chat ${currentChatId} updated with new messages`);

      } catch (error) {
        console.error('❌ MAYA CHAT PERSISTENCE ERROR:', error);
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
      console.error("Member Maya chat error:", error);
      res.status(500).json({ error: "Failed to process Maya chat request" });
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

      // Maya AI Photography response for BUILD feature
      let response = "Hey beautiful! I'm Maya, your AI photographer. ";

      if (context === 'website-building') {
        if (message.toLowerCase().includes('headshot') || message.toLowerCase().includes('professional')) {
          response += "I can create stunning professional headshots for your website! Should I generate some options with different backgrounds and lighting? I'm thinking clean, professional shots that match your brand aesthetic.";
        } else if (message.toLowerCase().includes('lifestyle') || message.toLowerCase().includes('behind the scenes')) {
          response += "Perfect! Lifestyle shots will add personality to your website. I can create behind-the-scenes photos of you working, authentic moments that show your personality, or lifestyle shots that connect with your audience.";
        } else if (message.toLowerCase().includes('product') || message.toLowerCase().includes('service')) {
          response += "Great idea! Product photography will showcase what you offer beautifully. I can create clean product shots, lifestyle product photos, or service demonstration images that highlight your expertise.";
        } else {
          response += "I'm ready to create amazing photos for your website! I can generate professional headshots, lifestyle shots, behind-the-scenes photos, or product images. What type of photos would work best for your site?";
        }
      } else {
        response += "I can help you create stunning AI-generated photos! What kind of images are you looking for today?";
      }

      res.json({
        success: true,
        response,
        photoSuggestions: context === 'website-building' ? [
          'Professional headshots',
          'Lifestyle/behind-the-scenes',
          'Product or service photos',
          'Brand lifestyle shots'
        ] : [],
        conversationId: `maya_${userId}`
      });

    } catch (error) {
      console.error("Maya AI photo error:", error);
      res.status(500).json({ error: "Failed to process Maya AI request" });
    }
  });
}