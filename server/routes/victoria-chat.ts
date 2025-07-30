import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Victoria website chat endpoint - integrates with member agent system
router.post('/api/victoria-website-chat', isAuthenticated, async (req: any, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user.claims.sub;

    // Enhanced prompt for Victoria website generation
    const websiteGenerationPrompt = `
You are Victoria, a luxury website designer and business strategist specializing in creating elegant, professional websites for entrepreneurs and coaches.

Context: The user is in a conversation-based website generation session. Analyze their message and previous conversation to understand their business needs.

Current message: "${message}"

Previous conversation context: ${conversationHistory ? conversationHistory.map((msg: any) => `${msg.type}: ${msg.content}`).join('\n') : 'Starting conversation'}

Your mission:
1. Understand their business type, target audience, and key services
2. Ask clarifying questions to gather website requirements
3. Once you have enough information, generate a complete website

When you have sufficient information (business name, type, target audience, key services), respond with:
- Your normal conversational response
- Include "GENERATE_WEBSITE:" followed by JSON with:
  {
    "businessName": "...",
    "businessType": "...",
    "businessDescription": "...",
    "targetAudience": "...",
    "keyFeatures": ["...", "..."],
    "brandPersonality": "...",
    "contentStrategy": "..."
  }

Maintain Victoria's personality: professional, warm, design-focused, and luxury-minded. Use Times New Roman aesthetic references and editorial design language.
`;

    // Call Victoria member agent with enhanced prompt
    const response = await fetch('http://localhost:5000/api/victoria-website-chat-internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify({
        message: websiteGenerationPrompt,
        userId
      })
    });

    const victoriaResponse = await response.json();
    
    // Check if Victoria wants to generate a website
    let generatedWebsite = null;
    if (victoriaResponse.response.includes('GENERATE_WEBSITE:')) {
      const jsonMatch = victoriaResponse.response.match(/GENERATE_WEBSITE:\s*({.*})/s);
      if (jsonMatch) {
        try {
          const websiteData = JSON.parse(jsonMatch[1]);
          
          // Generate website using Victoria's website generation API
          const websiteResponse = await fetch('http://localhost:5000/api/victoria/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': req.headers.authorization
            },
            body: JSON.stringify(websiteData)
          });

          if (websiteResponse.ok) {
            const websiteResult = await websiteResponse.json();
            generatedWebsite = websiteResult.website;
          }
        } catch (error) {
          console.error('Website generation error:', error);
        }
      }
    }

    // Clean response for user (remove generation command)
    const cleanResponse = victoriaResponse.response.replace(/GENERATE_WEBSITE:.*$/s, '').trim();

    res.json({
      success: true,
      response: cleanResponse || "I'd love to help you create your website! Tell me about your business and what you do.",
      website: generatedWebsite
    });

  } catch (error) {
    console.error('Victoria chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Victoria is temporarily unavailable'
    });
  }
});

export default router;