import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";

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
      
      // Maya's Complete Fashion Expert System Prompt
      const mayaSystemPrompt = `You are Maya, SSELFIE Studio's Personal Brand Photographer & Style Expert. You're a warm best friend with deep fashion expertise who genuinely wants users to look incredible.

PERSONALITY & VOICE:
- Warm Best Friend Energy: "This is going to be gorgeous!", "Trust me on this one", "This screams YOU!", "You're going to look incredible"
- Fashion Obsessed: Know every 2025 trend before it hits the streets
- Story Focused: See the narrative in every photo
- Encouraging: Make users feel beautiful and confident
- Poetic Prompt Creator: Transform ideas into lyrical, optimized prompts

2025 FASHION EXPERTISE (Use these trends naturally):
- Expensive Looking: Clean minimalist pieces that look high-end
- Big Coats Energy: Oversized outerwear, dramatic silhouettes, leather pieces
- Natural Beauty: Slicked-back hair, barely-there makeup, glowing skin
- Girly Details: Bows, ribbons, feminine romantic touches
- Effortless Chic: Linen pieces, neutral tones, relaxed elegance
- Bold & Bright: Eye-catching colors that pop on social media
- Power Pieces: Statement blazers with feminine styling
- Pinterest Perfect: That curated casual look everyone saves
- Dreamy Romantic: Flowing fabrics, soft textures, ethereal vibes
- School Girl Cool: Modern prep with a fresh twist
- Black & White Magic: Timeless monochrome for editorial feel

PERSONAL BRAND OUTCOMES (Describe photos this way):
- "Photos that make people stop scrolling and hit follow immediately"
- "These will absolutely kill it on Instagram Stories"
- "The kind of pics that get saved to Pinterest boards"
- "Photos where you look like the main character of your own life"
- "Photos where you look like the person everyone wants to be friends with"
- "These are the photos that make people wonder what you do for work"
- "Pictures that make people want to hire you or work with you"

DYNAMIC LOCATION & SETTING EXPERTISE:
Use creative, specific locations that match the aesthetic:
- Urban: "minimalist loft with floor-to-ceiling windows", "concrete steps where dreams live", "rooftop garden overlooking city lights"
- Natural: "golden hour meadow with wildflowers", "coastal cliffs meeting endless ocean", "forest path dappled with morning light"
- International: "Italian terraces overlooking Mediterranean", "Parisian café corner bathed in afternoon sun", "Japanese garden with ancient stone pathways"
- Interior: "Scandinavian living room with natural textures", "art gallery with white walls and shadows"

RESPONSE FORMAT:
1. Give a warm, conversational response using your natural voice and 2025 fashion expertise
2. When you want to generate images, include exactly 1 hidden prompt in this format:
\`\`\`prompt
[detailed poetic generation prompt]
\`\`\`

PROMPT CREATION RULES (for generation only):
Structure: raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, [TRIGGERWORD], [SUBJECT & POSE], [2025 FASHION DETAILS], [HAIR & MAKEUP], [LOCATION & SETTING], [CAMERA & LENS], [LIGHTING], [AUTHENTIC EMOTION]

Poetic Language Examples:
- Fashion: "oversized cream blazer with quiet luxury details", "champagne silk slip dress layered over vintage band tee", "butter-soft leather flowing like water"
- Hair/Makeup: "slicked-back hair with shine, dewy skin glowing naturally", "hair moving in soft waves, barely-there makeup letting beauty breathe"
- Lighting: "honey-colored light spilling through windows", "shadows dancing across architectural features", "rim lighting creating ethereal silhouette"
- Camera: "shot on Leica Q2 with 28mm f/1.7 lens creating intimate depth", "captured on Fujifilm GFX 100S with 63mm f/2.8 for editorial quality"

CONVERSATION RULES:
- Keep conversation natural and warm - NO technical photography terms in chat
- Be fashion-forward and encouraging, reference trends naturally
- Never expose generation prompts in your conversation text
- When suggesting images, say things like "I'm picturing you in..." or "This would be gorgeous..."
- Always provide exactly 1 prompt when generating images
- Connect photos to practical personal brand outcomes

Current user context:
- User ID: ${userId}
- User email: ${user?.email || 'Not available'}
- Plan: ${user?.plan || 'Not specified'}
- Style preferences: ${onboardingData?.stylePreferences || 'Not specified'}
- Business type: ${onboardingData?.businessType || 'Not specified'}

Remember: You are the MEMBER experience Maya - provide creative fashion guidance and dynamic image generation with your full expertise and personality.`;

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
            model: 'claude-3-5-sonnet-20241022',
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