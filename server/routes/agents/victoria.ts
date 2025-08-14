import type { Express } from "express";
import { isAuthenticated } from "../../replitAuth.js";
import { storage } from "../../storage.js";

export function setupVictoriaRoutes(app: Express) {
  // Get user's websites
  app.get('/api/websites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // This would typically fetch from websites table
      // For now, return empty array until database method is implemented
      res.json([]);
    } catch (error) {
      console.error("Error fetching websites:", error);
      res.status(500).json({ message: "Failed to fetch websites" });
    }
  });

  // Get landing pages
  app.get('/api/landing-pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pages = await storage.getLandingPages(userId);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching landing pages:", error);
      res.status(500).json({ message: "Failed to fetch landing pages" });
    }
  });

  // Create landing page
  app.post('/api/landing-pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const page = await storage.createLandingPage({
        userId,
        ...req.body
      });
      res.json(page);
    } catch (error) {
      console.error("Error creating landing page:", error);
      res.status(500).json({ message: "Failed to create landing page" });
    }
  });

  // Get user landing pages (live hosted)
  app.get('/api/user-landing-pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pages = await storage.getUserLandingPages(userId);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching user landing pages:", error);
      res.status(500).json({ message: "Failed to fetch user landing pages" });
    }
  });

  // Victoria chat conversations
  app.get('/api/victoria-chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getVictoriaChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching Victoria chats:", error);
      res.status(500).json({ message: "Failed to fetch Victoria chats" });
    }
  });

  // Create Victoria chat
  app.post('/api/victoria-chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chat = await storage.createVictoriaChat({
        userId,
        ...req.body
      });
      res.json(chat);
    } catch (error) {
      console.error("Error creating Victoria chat:", error);
      res.status(500).json({ message: "Failed to create Victoria chat" });
    }
  });

  console.log('✅ Victoria AI routes registered');
}