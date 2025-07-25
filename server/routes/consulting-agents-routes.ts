import { Router } from 'express';

const router = Router();

/**
 * CONSULTING AGENTS API - READ-ONLY ANALYSIS ONLY
 * Separate from development agents - provides strategic advice and "Tell Replit AI" instructions
 */
router.post('/admin/consulting-chat', async (req, res) => {
  try {
    console.log('🧠 CONSULTING AGENT REQUEST:', {
      body: req.body,
      session: req.session?.user ? 'authenticated' : 'none'
    });

    // Admin-only access (Sandra)
    if (!req.session?.user || req.session.user.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({
        success: false,
        message: 'Consulting agents are only available to Sandra'
      });
    }

    const { agentId, message } = req.body;
    
    if (!agentId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and message are required'
      });
    }

    // Import consulting personalities
    const { CONSULTING_AGENT_PERSONALITIES } = await import('../agent-personalities-consulting');
    
    const agent = CONSULTING_AGENT_PERSONALITIES[agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: `Consulting agent '${agentId}' not found`
      });
    }

    console.log(`🔍 CONSULTING ${agent.name.toUpperCase()}: Starting read-only analysis`);

    // Create read-only tool configuration for consulting agents
    const consultingToolConfig = {
      tools: [
        {
          name: "search_filesystem",
          description: "Search and analyze codebase structure and files (read-only access)",
          input_schema: {
            type: "object",
            properties: {
              query_description: {
                type: "string",
                description: "Natural language description of what to search for"
              },
              class_names: {
                type: "array",
                items: { type: "string" },
                description: "Specific class names to search for"
              },
              function_names: {
                type: "array", 
                items: { type: "string" },
                description: "Specific function names to search for"
              },
              code: {
                type: "array",
                items: { type: "string" },
                description: "Specific code snippets to search for"
              }
            }
          }
        },
        {
          name: "str_replace_based_edit_tool",
          description: "View file contents (READ-ONLY - view command only)",
          input_schema: {
            type: "object",
            properties: {
              command: {
                type: "string",
                enum: ["view"],
                description: "Only 'view' command allowed for consulting agents"
              },
              path: {
                type: "string",
                description: "Path to file to view"
              },
              view_range: {
                type: "array",
                items: { type: "integer" },
                description: "Optional line range [start, end] to view"
              }
            },
            required: ["command", "path"]
          }
        }
      ]
    };

    // Call Claude API with consulting tools
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      system: agent.systemPrompt,
      messages: [
        { 
          role: 'user', 
          content: `CONSULTING REQUEST: ${message}

IMPORTANT: Provide your analysis in this exact format:
## ${agent.name}'s Analysis
📋 **Current State**: [detailed assessment of what you found]
🎯 **Recommendation**: [specific improvements needed]  
📝 **Tell Replit AI**: "[exact instructions for implementation]"`
        }
      ],
      tools: consultingToolConfig.tools
    });

    let agentResponse = '';
    let toolResults = [];

    // Handle tool execution (read-only)
    if (response.content) {
      for (const contentBlock of response.content) {
        if (contentBlock.type === 'text') {
          agentResponse += contentBlock.text;
        } else if (contentBlock.type === 'tool_use') {
          console.log(`🔧 CONSULTING ${agent.name.toUpperCase()} TOOL: ${contentBlock.name}`, contentBlock.input);
          
          try {
            let toolResult = null;
            
            if (contentBlock.name === 'search_filesystem') {
              const { search_filesystem } = await import('../tools/search_filesystem');
              toolResult = await search_filesystem(contentBlock.input);
            } else if (contentBlock.name === 'str_replace_based_edit_tool') {
              const input = contentBlock.input as any;
              // Enforce read-only access - only allow view command
              if (input.command !== 'view') {
                throw new Error('Consulting agents can only use view command - no file modifications allowed');
              }
              const { str_replace_based_edit_tool } = await import('../tools/str_replace_based_edit_tool');
              toolResult = await str_replace_based_edit_tool(input);
            }
            
            console.log(`✅ CONSULTING ${agent.name.toUpperCase()} TOOL RESULT: Success`);
            toolResults.push({
              tool: contentBlock.name,
              result: toolResult,
              success: true
            });
            
          } catch (error) {
            console.error(`❌ CONSULTING ${agent.name.toUpperCase()} TOOL ERROR:`, error);
            agentResponse += `\n\n❌ **Analysis tool error:** ${error.message}`;
          }
        }
      }
    }

    if (!agentResponse) {
      agentResponse = `## ${agent.name}'s Analysis\n📋 **Current State**: Unable to complete analysis\n🎯 **Recommendation**: Please try again with a more specific request\n📝 **Tell Replit AI**: "The consulting agent encountered an error - please retry the request"`;
    }

    console.log(`✅ CONSULTING ${agent.name.toUpperCase()}: Analysis complete`);

    res.json({
      success: true,
      message: agentResponse,
      agentName: agent.name,
      agentRole: agent.role,
      consulting: true,
      toolResults: toolResults
    });

  } catch (error) {
    console.error('❌ CONSULTING AGENT ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Consulting analysis failed',
      error: error.message
    });
  }
});

export default router;