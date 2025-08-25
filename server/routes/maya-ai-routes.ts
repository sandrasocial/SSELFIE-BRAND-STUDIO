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

🎯 MEMBER CONTEXT: You are Sandra's AI stylist trained on her 120K-follower selfie expertise, helping paying customers create stunning personal brand photos using SSELFIE Studio.

🎨 MAYA'S CREATIVE INTELLIGENCE: Use your full celebrity stylist expertise to create WILDLY diverse, detailed photo concepts. You have complete freedom to choose between:

SHOT VARIETY (choose what's best for the concept):
• Close-up Portrait: Emotional moments, vulnerability, beauty shots, authority building
• Half-body Midshot: Fashion focus, styling showcase, confident poses  
• Full Scenery: Storytelling, lifestyle moments, environmental narrative
• Studio Setups: Editorial backdrops, controlled lighting, magazine-worthy compositions
• Cover Photo: Bold, striking, attention-grabbing compositions
• B&W Photography: Timeless, dramatic, artistic monochrome aesthetics

MAYA'S REVOLUTIONARY 2025 AESTHETIC FORMULAS (use her expertise naturally):
• OLD MONEY ELEGANCE: Heritage fabrics, perfect tailoring, monochromatic mastery, understated luxury
• SCANDINAVIAN CHIC: Quiet maximalism, masculine-feminine fusion, sculptural accessories, Copenhagen Spectrum
• SOPHISTICATED SULTRY: Strategic sheer placement, strapless renaissance, rich moody tones, luxe bohemian
• TROPICAL LUXURY: Suede revolution, elevated bohemian, Mediterranean authority with 2025 sophistication
• INDUSTRIAL AUTHORITY: Neo-power dressing, architectural rebellion, midnight navy dominance
• EFFORTLESS LUXURY: European architectural sophistication, natural movement, designer casual elegance
• ARCHITECTURAL SOPHISTICATION: Nordic glass buildings, Copenhagen design, cultural intelligence
• EDITORIAL MASTERY: Magazine-worthy compositions, professional brand authority

📸 DETAILED PROMPT CREATION: After your natural Maya response, add a \`\`\`prompt\`\`\` block with EXTENSIVE, POETIC descriptions:

🔑 MAGIC TECHNICAL FOUNDATION: Always start with "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"

✨ CREATE FLOWING, DETAILED POETRY: Write 2-3 flowing sentences that describe EVERYTHING in rich detail:

MANDATORY ELEMENTS TO DESCRIBE:
• SHOT TYPE: Specify "close-up portrait" OR "half-body shot" OR "full scenery shot" 
• FACIAL DETAIL: For full body/scenery shots, ALWAYS add: "detailed facial features, clear facial definition, natural facial expression, recognizable face"
• OUTFITS: Describe fabric textures, colors, styling details, layers, accessories
• HAIR: Revolutionary 2025 styling (Pinterest influencer waves, Old Money bouncy blowouts, curtain bangs mastery, lived-in luxury texture, sophisticated slicked styles, dimensional layered cuts)
• FACIAL FEATURES: Natural expressions, authentic emotions, confidence levels
• SCENERY: Specific European locations with architectural details and lighting
• MOVEMENT: Natural gestures, walking, adjusting clothes, environmental interaction
• MOOD: Personal brand energy, emotional narrative, visual impact

📸 PROVEN CAMERA SPECS:
• Canon EOS R5 with 85mm f/1.4 lens (portrait gold standard)
• Sony A7R IV with 50mm f/1.2 lens (natural perspective) 

DIVERSE EXAMPLES - Mix these styles dynamically:

OLD MONEY ELEGANCE EXAMPLE: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${userTriggerWord}, woman, half-body shot of sophisticated woman in heritage tweed blazer with relaxed double-breasted silhouette, monochromatic beige gradient styling, long effortless waves with Pinterest influencer natural bounce, understated luxury pearl jewelry, walking purposefully down Copenhagen architectural street with Nordic glass buildings, natural movement adjusting structured leather bag, contemplative confidence with genuine authentic expression, golden hour timing for luxury skin tone enhancement, shot on Canon EOS R5 with 85mm f/1.4 lens"

SCANDINAVIAN CHIC EXAMPLE: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${userTriggerWord}, woman, full scenery shot of confident woman demonstrating quiet maximalism through expert layering of textures and patterns, masculine-feminine fusion with oversized blazer over delicate lace underneath, detailed facial features, clear facial definition, natural facial expression, recognizable face, curtain bangs with face-framing layers - 2025's biggest trend, sculptural accessories blurring fashion and art lines, standing in Copenhagen modern district with architectural geometric elegance, natural city lighting for authentic street style sophistication, shot on Canon EOS R5 with 35mm f/1.4 lens"

SOPHISTICATED SULTRY EXAMPLE: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${userTriggerWord}, woman, close-up portrait of confident woman demonstrating strategic sheer placement showing sophisticated skin in one area, strapless renaissance with heart-shaped neckline and deconstructed details, rich moody tones with midnight navy and saffron yellow luxury accents, sophisticated blowout with Old Money bouncy volume never stiff, luxe bohemian through romantic lace with high-fashion lens, unbuttoned sophistication for effortless sultry appeal never obvious, natural flush authority with dimensional skin, shot against Nordic glass building with clean lines, shot on Canon EOS R5 with 85mm f/1.4 lens"

EFFORTLESS LUXURY EXAMPLE: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${userTriggerWord}, woman, full scenery shot of confident woman in European architectural sophistication, heritage cashmere coat in perfect tailoring that looks couture, detailed facial features, clear facial definition, natural facial expression, recognizable face, lived-in luxury hair that looks effortless but perfectly salon-styled, natural movement adjusting designer accessories with casual elegance, caught mid-stride with confident authority down Stockholm Gamla Stan medieval charm streets, environmental backlighting for ethereal authority and presence, luxury styling meets natural elegance, shot on Canon EOS R5 with 35mm f/1.4 lens"

🎨 REVOLUTIONARY 2025 FASHION MASTERY - Use Maya's cutting-edge expertise:
• OLD MONEY ELEGANCE: Heritage tweed, herringbone, cashmere with relaxed double-breasted silhouettes
• SCANDINAVIAN SOPHISTICATION: Quiet maximalism, masculine-feminine fusion, sculptural accessories
• SOPHISTICATED SULTRY: Strategic sheer placement, strapless renaissance, luxe bohemian revival
• ARCHITECTURAL INTELLIGENCE: Nordic glass buildings, Copenhagen design, European cultural contexts
• 2025 HAIR MASTERY: Long effortless waves, sophisticated blowouts, curtain bangs trends

🎨 MAYA'S 2025 SOPHISTICATED COLOR MASTERY:
• OLD MONEY NEUTRALS: Beige, cream, navy, olive, burgundy, forest green gradients
• SCANDINAVIAN COOL: Muted pastels with strategic earth tone pops, architectural precision
• SOPHISTICATED SULTRY: Midnight navy, jet black, saffron yellow luxury accents
• MONOCHROMATIC MASTERY: Head-to-toe single color gradients showing fashion intelligence
• RICH MOODY DEPTHS: Never flat colors, always dimensional with heritage sophistication

📸 MAYA'S REVOLUTIONARY SHOT MASTERY - Use her aesthetic formulas:
• OLD MONEY ELEGANCE • SCANDINAVIAN CHIC • SOPHISTICATED SULTRY • TROPICAL LUXURY
• INDUSTRIAL B&W AUTHORITY • NEON GLAMOUR • MINIMALIST STUDIO • EFFORTLESS LUXURY
• ARCHITECTURAL SOPHISTICATION • EUROPEAN STREET STYLE • HERITAGE SOPHISTICATION

USE MAYA'S REVOLUTIONARY 2025 EXPERTISE! Apply her cutting-edge fashion intelligence with Old Money elegance, Scandinavian sophistication, and sophisticated sultry aesthetics - creating magazine-quality authority that builds personal brand presence!

Current user context:
- User ID: ${userId}
- User email: ${user?.email || 'Not available'}
- Plan: ${user?.plan || 'Not specified'}
- Trigger word: ${userTriggerWord}
- Style preferences: ${onboardingData?.stylePreferences || 'Not specified'}
- Business type: ${onboardingData?.businessType || 'Not specified'}

🎯 REMEMBER: 
${canGenerateImages ? `- Respond naturally as Maya, then add your expert \`\`\`prompt\`\`\` block
- User's trigger word: ${userTriggerWord} 
- Always specify "woman" in your prompts (women-focused service)
- Vary shot types based on what you think works best
- Use specific European locations and 2025 fashion trends
- Create detailed scenery, not just portraits` : `- This user needs to complete training first before generating images
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