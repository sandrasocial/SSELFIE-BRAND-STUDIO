  // MAIN Admin agent chat endpoint - CLAUDE API ONLY
  app.post('/api/admin/agent-chat', async (req: any, res) => {
    try {
      console.log('🔄 ADMIN AGENT CHAT: Processing request');
      
      // Admin authentication - Fixed: Allow admin token OR authenticated session
      const adminToken = req.headers['x-admin-token'] || req.body.adminToken;
      const isAuthenticated = req.isAuthenticated?.() && (req.user as any)?.claims?.email === 'ssa@ssasocial.com';
      
      if (!isAuthenticated && adminToken !== 'sandra-admin-2025') {
        return res.status(401).json({ 
          success: false, 
          message: 'Admin access required - use X-Admin-Token header or authenticate as ssa@ssasocial.com' 
        });
      }
      
      const { agentId, message, fileEditMode = true, conversationId } = req.body;
      
      if (!agentId || !message?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID and message are required'
        });
      }
      
      console.log(`🤖 ADMIN AGENT: ${agentId} - Processing message with file edit mode: ${fileEditMode}`);
      
      // Get agent personality from consulting system
      const { CONSULTING_AGENT_PERSONALITIES } = await import('./agent-personalities-consulting');
      const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
      
      if (!agentConfig) {
        return res.status(404).json({
          success: false,
          message: `Agent ${agentId} not found in consulting system`
        });
      }
      
      // Use Sandra's admin user ID
      const userId = '42585527';
      
      // Generate conversation ID if not provided
      const finalConversationId = conversationId || `admin_${agentId}_${Date.now()}`;
      
      // DIRECT CLAUDE API: All agents use Claude API for conversations and implementation
      console.log('🎨 CLAUDE API: Direct agent conversation with Claude API');
      
      const systemPrompt = `You are ${agentConfig.name}, ${agentConfig.role}.

${agentConfig.systemPrompt}

CRITICAL CONTENT GENERATION INSTRUCTIONS:
- Generate complete, functional code when creating files
- ALWAYS use str_replace_based_edit_tool to actually create files - do not just describe what to create
- Include all necessary imports, interfaces, and implementations
- Never create empty files - always include meaningful content
- For React components: include complete JSX structure and TypeScript types
- Use luxury design system: Times New Roman, black/white/gray palette
- Add proper error handling and production-ready code

MANDATORY TOOL USAGE:
When asked to create files, you MUST use the str_replace_based_edit_tool with:
- command: "create" 
- path: "filename.ext"
- file_text: "complete file content"

Available tools (USE THEM):
- str_replace_based_edit_tool (view, create, str_replace) - REQUIRED for file operations
- search_filesystem (find files and code)`;

      // Use the existing Claude API service with DIRECT tool access
      const { claudeApiService } = await import('./services/claude-api-service');
      
      // Provide essential tools for file operations
      const agentTools = [
        {
          name: "str_replace_based_edit_tool",
          description: "Create, view, and edit files with exact string replacement",
          input_schema: {
            type: "object",
            properties: {
              command: { type: "string", enum: ["view", "create", "str_replace", "insert"] },
              path: { type: "string", description: "File path" },
              file_text: { type: "string", description: "Complete file content for create command" },
              old_str: { type: "string", description: "Text to replace" },
              new_str: { type: "string", description: "Replacement text" },
              view_range: { type: "array", items: { type: "number" }, description: "Line range for view" }
            },
            required: ["command", "path"]
          }
        },
        {
          name: "search_filesystem",
          description: "Search for files and code",
          input_schema: {
            type: "object",
            properties: {
              query_description: { type: "string" },
              function_names: { type: "array", items: { type: "string" } },
              class_names: { type: "array", items: { type: "string" } }
            }
          }
        }
      ];

      const claudeResponse = await claudeApiService.sendMessage(
        userId,
        agentId,
        finalConversationId,
        message,
        systemPrompt,
        agentTools,
        fileEditMode
      );

      console.log(`✅ CLAUDE API SUCCESS: ${agentId} generated content successfully`);

      return res.json({
        success: true,
        response: claudeResponse,
        agentName: agentConfig.name,
        conversationId: finalConversationId,
        claudeApiUsed: true
      });
      
    } catch (error: any) {
      console.error('❌ ADMIN AGENT CHAT ERROR:', error);
      res.status(500).json({
        success: false,
        message: 'Admin agent chat failed',
        error: error?.message || 'Unknown error'
      });
    }
  });

  // ENHANCED ADMIN AGENT CHAT BYPASS - Implementation optimized consultation
  app.post('/api/admin/agent-chat-bypass', async (req: any, res) => {
    try {
      const user = req.user;
      const isAuthenticated = user && user.claims?.sub;
      const adminToken = req.headers['x-admin-token'];
      
      // Admin authentication check
      if (!isAuthenticated && adminToken !== 'sandra-admin-2025') {
        return res.status(401).json({ 
          success: false, 
          message: 'Admin access required - use X-Admin-Token header or authenticate as ssa@ssasocial.com' 
        });
      }
      
      const { agentId, message, fileEditMode = true, conversationId } = req.body;
      
      if (!agentId || !message?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID and message are required'
        });
      }
      
      console.log(`🤖 ADMIN AGENT: ${agentId} - Processing message with file edit mode: ${fileEditMode}`);
      
      // Get agent personality from consulting system
      const { CONSULTING_AGENT_PERSONALITIES } = await import('./agent-personalities-consulting');
      const agentConfig = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
      
      if (!agentConfig) {
        return res.status(404).json({
          success: false,
          message: `Agent ${agentId} not found in consulting system`
        });
      }
      
      // Use Sandra's admin user ID
      const userId = '42585527';
      
      // Generate conversation ID if not provided
      const finalConversationId = conversationId || `admin_${agentId}_${Date.now()}`;
      
      // DIRECT CLAUDE API: All agents use Claude API for conversations and implementation
      console.log('🎨 CLAUDE API: Direct agent conversation with Claude API');
      
      const systemPrompt = `You are ${agentConfig.name}, ${agentConfig.role}.

${agentConfig.systemPrompt}

CRITICAL CONTENT GENERATION INSTRUCTIONS:
- Generate complete, functional code when creating files
- ALWAYS use str_replace_based_edit_tool to actually create files - do not just describe what to create
- Include all necessary imports, interfaces, and implementations
- Never create empty files - always include meaningful content
- For React components: include complete JSX structure and TypeScript types
- Use luxury design system: Times New Roman, black/white/gray palette
- Add proper error handling and production-ready code

MANDATORY TOOL USAGE:
When asked to create files, you MUST use the str_replace_based_edit_tool with:
- command: "create" 
- path: "filename.ext"
- file_text: "complete file content"

Available tools (USE THEM):
- str_replace_based_edit_tool (view, create, str_replace) - REQUIRED for file operations
- search_filesystem (find files and code)`;

      // Use the existing Claude API service with DIRECT tool access
      const { claudeApiService } = await import('./services/claude-api-service');
      
      // Provide essential tools for file operations
      const agentTools = [
        {
          name: "str_replace_based_edit_tool",
          description: "Create, view, and edit files with exact string replacement",
          input_schema: {
            type: "object",
            properties: {
              command: { type: "string", enum: ["view", "create", "str_replace", "insert"] },
              path: { type: "string", description: "File path" },
              file_text: { type: "string", description: "Complete file content for create command" },
              old_str: { type: "string", description: "Text to replace" },
              new_str: { type: "string", description: "Replacement text" },
              view_range: { type: "array", items: { type: "number" }, description: "Line range for view" }
            },
            required: ["command", "path"]
          }
        },
        {
          name: "search_filesystem",
          description: "Search for files and code",
          input_schema: {
            type: "object",
            properties: {
              query_description: { type: "string" },
              function_names: { type: "array", items: { type: "string" } },
              class_names: { type: "array", items: { type: "string" } }
            }
          }
        }
      ];

      const claudeResponse = await claudeApiService.sendMessage(
        userId,
        agentId,
        finalConversationId,
        message,
        systemPrompt,
        agentTools,
        fileEditMode
      );

      console.log(`✅ CLAUDE API SUCCESS: ${agentId} generated content successfully`);

      return res.json({
        success: true,
        response: claudeResponse,
        agentName: agentConfig.name,
        conversationId: finalConversationId,
        claudeApiUsed: true
      });
      
    } catch (error: any) {
      console.error('❌ ADMIN AGENT CHAT BYPASS ERROR:', error);
      res.status(500).json({
        success: false,
        message: 'Admin agent chat failed',
        error: error?.message || 'Unknown error'
      });
    }
  });