import type { Express } from "express";
import { isAuthenticated } from "../../replitAuth.js";
import { storage } from "../../storage.js";

export function setupMayaRoutes(app: Express) {
  // Get AI images gallery
  app.get('/api/ai-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const images = await storage.getAIImages(userId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching AI images:", error);
      res.status(500).json({ message: "Failed to fetch AI images" });
    }
  });

  // Get generation trackers (temp preview)
  app.get('/api/generation-trackers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trackers = await storage.getUserGenerationTrackers(userId);
      res.json(trackers);
    } catch (error) {
      console.error("Error fetching generation trackers:", error);
      res.status(500).json({ message: "Failed to fetch generation trackers" });
    }
  });

  // Maya chat conversations
  app.get('/api/maya-chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getMayaChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching Maya chats:", error);
      res.status(500).json({ message: "Failed to fetch Maya chats" });
    }
  });

  // Create Maya chat
  app.post('/api/maya-chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chat = await storage.createMayaChat({
        userId,
        ...req.body
      });
      res.json(chat);
    } catch (error) {
      console.error("Error creating Maya chat:", error);
      res.status(500).json({ message: "Failed to create Maya chat" });
    }
  });

  // Get user model training status
  app.get('/api/user-model', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const model = await storage.getUserModel(userId);
      res.json(model || { trainingStatus: 'not_started' });
    } catch (error) {
      console.error("Error fetching user model:", error);
      res.status(500).json({ message: "Failed to fetch user model" });
    }
  });

  console.log('✅ Maya AI routes registered');
}