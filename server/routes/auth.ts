import type { Express } from "express";
import { setupAuth, isAuthenticated } from "../replitAuth.js";
import { storage } from "../storage.js";

export async function setupAuthRoutes(app: Express) {
  // Setup Replit OAuth authentication
  await setupAuth(app);

  // Get authenticated user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  console.log('✅ Auth routes registered');
}