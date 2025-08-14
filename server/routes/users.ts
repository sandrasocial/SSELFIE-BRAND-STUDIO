import type { Express } from "express";
import { isAuthenticated } from "../replitAuth.js";
import { storage } from "../storage.js";

export function setupUserRoutes(app: Express) {
  // Get user profile
  app.get('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      res.json(profile || {});
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Update user profile
  app.post('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.upsertUserProfile({
        userId,
        ...req.body
      });
      res.json(profile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Get user usage and limits
  app.get('/api/users/usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const usage = await storage.getUserUsage(userId);
      
      res.json({
        monthlyGenerationLimit: user?.monthlyGenerationLimit || 5,
        generationsUsedThisMonth: user?.generationsUsedThisMonth || 0,
        plan: user?.plan || 'free',
        mayaAiAccess: user?.mayaAiAccess || false,
        victoriaAiAccess: user?.victoriaAiAccess || false,
        usage
      });
    } catch (error) {
      console.error("Error fetching user usage:", error);
      res.status(500).json({ message: "Failed to fetch user usage" });
    }
  });

  console.log('✅ User routes registered');
}