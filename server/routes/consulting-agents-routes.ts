import { Router, Request } from 'express';
import { isAuthenticated } from '../replitAuth';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';

// Type definitions for admin requests
interface AdminRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email: string;
      first_name: string;
      last_name: string;
    }
  };
  isAdminBypass?: boolean;
}

// Type definition for consulting chat request body
interface ConsultingChatBody {
  agentId: string;
  message: string;
  conversationId?: string;
  adminToken?: string;
}

// UNIFIED SERVICE: Use singleton from claude-api-service-simple.ts
import { claudeApiServiceSimple } from '../services/claude-api-service-simple';
import { SSELFIE_ARCHITECTURE, AGENT_TOOL_INTELLIGENCE, FileAnalysis } from '../agents/capabilities/intelligence/architectural-knowledge-base';
import { simpleMemoryService } from '../services/simple-memory-service';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// NATIVE REPLIT TOOLS: Import actual tool functions (not schemas)
import { restart_workflow } from '../tools/restart-workflow';
import { str_replace_based_edit_tool } from '../tools/str_replace_based_edit_tool';
import { bash } from '../tools/bash';
import { get_latest_lsp_diagnostics } from '../tools/get_latest_lsp_diagnostics';
import { ConversationManager } from '../agents/core/conversation/ConversationManager';

function getClaudeService() {
  return claudeApiServiceSimple;
}

const consultingAgentsRouter = Router();

// Enhanced admin auth with bypass capabilities
const adminAuth = (req: Request, res: any, next: any) => {
  console.log(`🔐 ADMIN AUTH: Checking request for ${req.path}`);
  
  const adminToken = req.headers.authorization;
  if (adminToken === 'sandra-admin-2025') {
    console.log(`✅ ADMIN ACCESS: Sandra admin token accepted`);
    (req as AdminRequest).isAdminBypass = true;
    return next();
  }
  
  return isAuthenticated(req, res, next);
};

// STREAMLINED: Fast personality-first handler
export async function handleAdminConsultingChat(req: AdminRequest, res: any) {
  try {
    console.log(`🚀 STREAMLINED CONSULTING: Fast personality-first response`);

    const { agentId, message } = req.body;
    
    // MINIMAL VALIDATION: Essential checks only
    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // Get agent configuration
    const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    if (!agentConfig) {
      return res.status(404).json({
        success: false,
        message: `Agent "${agentId}" not found`,
        availableAgents: Object.keys(CONSULTING_AGENT_PERSONALITIES)
      });
    }

    const userId = req.user?.claims?.sub || 'sandra-admin-test';
    console.log(`🚀 ${agentConfig.name.toUpperCase()}: Streamlined processing`);

    // STREAMLINED: Simplified conversation management  
    const normalizedAgentId = agentId.toLowerCase();
    const baseConversationId = `admin_${normalizedAgentId}_${userId}`;
    
    let conversationHistory: Array<{role: string; content: string}> = [];
    
    // FAST DATABASE: Quick conversation loading
    try {
      const existingConversation = await db
        .select()
        .from(claudeConversations)
        .where(eq(claudeConversations.conversationId, baseConversationId))
        .limit(1);
      
      if (existingConversation.length > 0) {
        const messages = await db
          .select()
          .from(claudeMessages)
          .where(eq(claudeMessages.conversationId, baseConversationId))
          .orderBy(desc(claudeMessages.timestamp))
          .limit(20); // Reduced for speed
        
        conversationHistory = messages.reverse().map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      }
    } catch (dbError) {
      console.error(`Database error:`, dbError);
    }

    const claudeService = getClaudeService();
    
    // REPLIT TOOLS: Convert native functions to Claude API format
    const availableTools = [
      {
        name: "str_replace_based_edit_tool",
        description: "View, create and edit files. The `view` command supports directories and text files. The `create` command creates or overwrites text files. The `str_replace` command replaces text in a file requiring an exact match. The `insert` command inserts text at a specific line.",
        input_schema: {
          type: "object",
          properties: {
            command: { type: "string", enum: ["view", "create", "str_replace", "insert"] },
            path: { type: "string" },
            file_text: { type: "string" },
            old_str: { type: "string" },
            new_str: { type: "string" },
            insert_line: { type: "integer" },
            insert_text: { type: "string" },
            view_range: { type: "array", items: { type: "integer" } }
          },
          required: ["command", "path"]
        }
      },
      {
        name: "bash",
        description: "Run commands in a bash shell. State is persistent across command calls.",
        input_schema: {
          type: "object",
          properties: {
            command: { type: "string" },
            restart: { type: "boolean" }
          },
          required: ["command"]
        }
      },
      {
        name: "restart_workflow", 
        description: "Restart (or start) a workflow by name.",
        input_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            workflow_timeout: { type: "integer", default: 30 }
          },
          required: ["name"]
        }
      }
    ];

    // REAL STREAMING: Use actual streaming method to show agent work in real-time
    await claudeService.sendStreamingMessage(
      userId,
      normalizedAgentId,
      baseConversationId,
      message,
      agentConfig.systemPrompt,
      availableTools,
      res // Pass the response object for real streaming
    );

  } catch (error) {
    console.error(`❌ Consulting error:`, error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

consultingAgentsRouter.post('/admin/consulting-chat', adminAuth, async (req: AdminRequest, res: any) => {
  return handleAdminConsultingChat(req, res);
});

export { consultingAgentsRouter };