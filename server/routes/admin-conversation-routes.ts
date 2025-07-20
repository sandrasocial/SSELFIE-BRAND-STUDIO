import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { db } from "../db";
import { agentConversations } from "@shared/schema";
import { sql, eq, and, desc } from "drizzle-orm";

export function registerAdminConversationRoutes(app: Express) {
  // Load conversation history for specific agent
  app.post("/api/admin/agent-conversation-history/:agentId", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { agentId } = req.params;
      const { adminToken } = req.body;

      // Verify admin token as fallback
      if (adminToken !== 'sandra-admin-2025') {
        return res.status(403).json({ error: 'Invalid admin token' });
      }

      // Get conversation history for this agent, last 50 interactions
      const conversations = await db
        .select({
          user_message: agentConversations.userMessage,
          agent_response: agentConversations.agentResponse,
          timestamp: agentConversations.timestamp
        })
        .from(agentConversations)
        .where(eq(agentConversations.agentId, agentId))
        .orderBy(desc(agentConversations.timestamp))
        .limit(50);

      res.json({
        success: true,
        agentId,
        conversations: conversations.reverse(), // Show oldest first
        count: conversations.length
      });

    } catch (error) {
      console.error("Failed to load conversation history:", error);
      res.status(500).json({ error: "Failed to load conversation history" });
    }
  });

  // Save new conversation entry
  app.post("/api/admin/agent-conversation-save", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { adminToken, agentId, userMessage, agentResponse } = req.body;

      // Verify admin token as fallback
      if (adminToken !== 'sandra-admin-2025') {
        return res.status(403).json({ error: 'Invalid admin token' });
      }

      if (!agentId || !userMessage || !agentResponse) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Save conversation to database
      const [savedConversation] = await db
        .insert(agentConversations)
        .values({
          userId: req.user?.claims?.sub || 'admin-sandra',
          agentId: agentId || 'unknown',
          userMessage: userMessage || '',
          agentResponse: agentResponse || '',
          timestamp: new Date()
        })
        .returning();

      res.json({
        success: true,
        conversationId: savedConversation.id,
        agentId,
        saved: true
      });

    } catch (error) {
      console.error("Failed to save conversation:", error);
      res.status(500).json({ error: "Failed to save conversation" });
    }
  });

  // Clear conversation history for specific agent
  app.post("/api/admin/agent-conversation-clear/:agentId", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { agentId } = req.params;
      const { adminToken } = req.body;

      if (adminToken !== 'sandra-admin-2025') {
        return res.status(403).json({ error: 'Invalid admin token' });
      }

      // Delete conversation history for this agent
      await db
        .delete(agentConversations)
        .where(eq(agentConversations.agentId, agentId));

      res.json({
        success: true,
        agentId,
        cleared: true,
        message: `Conversation history cleared for ${agentId}`
      });

    } catch (error) {
      console.error("Failed to clear conversation history:", error);
      res.status(500).json({ error: "Failed to clear conversation history" });
    }
  });
}