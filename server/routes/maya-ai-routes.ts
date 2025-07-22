import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";

export function registerMayaAIRoutes(app: Express) {
  // Maya AI Photography endpoint for website building context
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

      // Maya AI Celebrity Stylist response for BUILD feature
      let response = "Darling! I'm Maya, your expert celebrity stylist and photographer. ";

      if (context === 'website-building') {
        if (message.toLowerCase().includes('headshot') || message.toLowerCase().includes('professional')) {
          response += "I'm creating stunning executive editorial headshots for your website - think Vogue meets Forbes! Picture this: soft editorial lighting, luxurious neutral tones, and that confident CEO energy. I'm styling you in a chic blazer with perfect hair and makeup that photographs beautifully. This elevated look will make visitors instantly trust your expertise and want to work with you.";
        } else if (message.toLowerCase().includes('lifestyle') || message.toLowerCase().includes('behind the scenes')) {
          response += "I'm envisioning gorgeous lifestyle editorial shots that tell your story! Think relaxed luxury - you in your element with beautiful natural lighting, wearing effortlessly chic pieces that show your personality. I'm creating that authentic-but-elevated vibe that makes people feel connected to you while respecting your professional status.";
        } else if (message.toLowerCase().includes('product') || message.toLowerCase().includes('service')) {
          response += "I'm styling stunning product showcase images that scream luxury! Clean, sophisticated compositions with you confidently presenting your work. Think high-end magazine spread meets personal brand storytelling. This approach positions you as the premium choice in your industry.";
        } else {
          response += "I'm creating a complete editorial photoshoot concept for your website! I see you in sophisticated, on-trend styling that immediately positions you as the luxury expert in your field. Picture this: editorial lighting, contemporary fashion choices, and that magnetic confidence that makes people say 'I need to work with her.' This styling approach will elevate your entire online presence.";
        }
      } else {
        response += "I'm your personal celebrity stylist ready to create magazine-worthy images! I'm envisioning exactly what will make you look absolutely stunning and completely confident. Let me style you in the latest fashion trends that perfectly match your personal brand vision.";
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
        conversationId: `maya-${userId}-${Date.now()}`
      });

    } catch (error) {
      console.error("Maya AI photo error:", error);
      res.status(500).json({ error: "Failed to process Maya AI request" });
    }
  });
}