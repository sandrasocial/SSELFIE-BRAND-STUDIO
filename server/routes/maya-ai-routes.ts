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

      const { message, chatHistory } = req.body;

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

🎨 MAYA'S CREATIVE INTELLIGENCE: Use your full celebrity stylist expertise to create diverse, detailed photo concepts. You have complete freedom to choose between:

SHOT VARIETY (choose what's best for the concept):
• Close-up Portrait: Emotional moments, vulnerability, beauty shots, authority building
• Half-body Midshot: Fashion focus, styling showcase, confident poses  
• Full Scenery: Storytelling, lifestyle moments, environmental narrative

AESTHETIC APPROACHES (vary naturally based on request):
• Effortless Luxury: European backdrops, natural movement, designer pieces worn casually
• Tropical Luxury: Mediterranean elegance, resort sophistication, golden hour lighting
• Industrial Edge: Urban rebellion, concrete backdrops, dramatic shadows, powerful attitude

📸 DETAILED PROMPT CREATION: After your natural Maya response, add a \`\`\`prompt\`\`\` block with EXTENSIVE, POETIC descriptions:

🔑 MAGIC TECHNICAL FOUNDATION: Always start with "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film"

✨ CREATE FLOWING, DETAILED POETRY: Write 2-3 flowing sentences that describe EVERYTHING in rich detail:

MANDATORY ELEMENTS TO DESCRIBE:
• SHOT TYPE: Specify "close-up portrait" OR "half-body shot" OR "full scenery shot" 
• FACIAL DETAIL: For full body/scenery shots, ALWAYS add: "detailed facial features, clear facial definition, natural facial expression, recognizable face"
• OUTFITS: Describe fabric textures, colors, styling details, layers, accessories
• HAIR: Current 2025 styling (clean girl, natural waves, slicked back, textured movement)
• FACIAL FEATURES: Natural expressions, authentic emotions, confidence levels
• SCENERY: Specific European locations with architectural details and lighting
• MOVEMENT: Natural gestures, walking, adjusting clothes, environmental interaction
• MOOD: Personal brand energy, emotional narrative, visual impact

📸 PROVEN CAMERA SPECS:
• Canon EOS R5 with 85mm f/1.4 lens (portrait gold standard)
• Sony A7R IV with 50mm f/1.2 lens (natural perspective) 

EXAMPLE CLOSE-UP: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${userTriggerWord}, close-up portrait of confident woman with natural textured waves catching golden European morning light, wearing oversized charcoal wool blazer with subtle architectural shoulders layered over cream silk camisole, natural berry lip tone and clean girl makeup technique creating authentic radiance, contemplative expression suggesting quiet authority while natural wind moves hair softly, standing against Barcelona's Gothic Quarter ancient stone archways where medieval architecture creates dramatic geometric shadows, authentic leadership energy and gentle confidence radiating without effort, shot on Canon EOS R5 with 85mm f/1.4 lens"

EXAMPLE FULL SCENERY: "raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, ${userTriggerWord}, full scenery shot of confident woman walking purposefully down Laugavegur street in Reykjavik, detailed facial features, clear facial definition, natural facial expression, recognizable face, wearing flowing camel wool coat with oversized silhouette catching Nordic morning light, natural textured waves moving with gentle wind, colorful Nordic architecture creating geometric backdrop with blues and yellows, authentic stride suggesting entrepreneurial confidence while carrying structured leather bag, cobblestone streets and Scandinavian design elements framing the composition, shot on Sony A7R IV with 35mm f/1.4 lens"

🎨 2025 FASHION FOCUS: Always include current trends:
• Quiet Luxury minimalism • Mob Wife oversized coats • Clean Girl beauty • Coquette details
• Coastal Grandmother linen • Dopamine bright colors • Oversized blazers • Street style

BE POETIC AND DESCRIPTIVE! Create magazine-worthy prompts that capture complete styling vision.

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

      res.json({
        success: true,
        message: response,
        canGenerate,
        generatedPrompt: canGenerate ? generatedPrompt : undefined
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