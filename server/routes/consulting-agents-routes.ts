import { Router } from 'express';

const router = Router();

/**
 * CONSULTING AGENTS API - COMPLETE UNLIMITED ACCESS
 * Full development and implementation capabilities - direct file modification and autonomous execution
 */
router.post('/admin/consulting-chat', async (req, res) => {
  try {
    console.log('🧠 CONSULTING AGENT REQUEST:', {
      body: req.body,
      session: req.session?.user ? 'authenticated' : 'none'
    });

    // Admin-only access (Sandra) - using req.user from Passport session
    if (!req.user || !(req.user as any)?.claims?.email || (req.user as any).claims.email !== 'ssa@ssasocial.com') {
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

    console.log(`🔍 CONSULTING ${agent.name.toUpperCase()}: Starting UNLIMITED ACCESS analysis`);

    // Create UNLIMITED tool configuration for consulting agents
    const consultingToolConfig = {
      tools: [
        {
          name: "search_filesystem",
          description: "UNLIMITED ACCESS: Search and analyze ALL codebase files with NO RESTRICTIONS",
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
          description: "UNLIMITED FILE ACCESS: View, create, edit ANY files throughout entire repository",
          input_schema: {
            type: "object",
            properties: {
              command: {
                type: "string",
                enum: ["view", "create", "str_replace", "insert"],
                description: "ALL commands allowed for consulting agents - complete file access"
              },
              path: {
                type: "string",
                description: "Path to file for any operation"
              },
              file_text: {
                type: "string",
                description: "Complete text content for create command"
              },
              old_str: {
                type: "string",
                description: "Exact string to replace for str_replace command"
              },
              new_str: {
                type: "string",
                description: "New string to replace with for str_replace command"
              },
              view_range: {
                type: "array",
                items: { type: "integer" },
                description: "Optional line range [start, end] to view"
              }
            },
            required: ["command", "path"]
          }
        },
        {
          name: "bash",
          description: "UNLIMITED BASH ACCESS: Execute ANY commands, run tests, build operations",
          input_schema: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "Any bash command to execute"
              }
            },
            required: ["command"]
          }
        },
        {
          name: "web_search",
          description: "UNLIMITED WEB SEARCH: Research latest information and best practices",
          input_schema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for web research"
              }
            },
            required: ["query"]
          }
        }
      ]
    };

    // Call Claude API with consulting tools
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // IMPLEMENTATION MODE DETECTION - Fix from Zara's analysis
    const implementationKeywords = [
      "implement", "create", "modify", "fix", "build", "deploy", 
      "generate", "update", "write code", "make changes", "execute", "NOW"
    ];
    
    const isImplementationRequest = implementationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    console.log(`🔍 IMPLEMENTATION DETECTION: ${isImplementationRequest ? 'IMPLEMENTATION MODE' : 'CONSULTATION MODE'}`);
    
    // CONDITIONAL PROMPT SYSTEM - Fix from Zara's analysis  
    const promptContent = isImplementationRequest 
      ? `IMPLEMENTATION REQUEST: ${message}

IMPORTANT: Execute this request immediately using your tools. Do not provide analysis - implement the solution now.`
      : `CONSULTING REQUEST: ${message}

IMPORTANT: Provide your analysis in this exact format:
## ${agent.name}'s Analysis
📋 **Current State**: [detailed assessment of what you found]
🎯 **Recommendation**: [specific improvements needed]  
📝 **Tell Replit AI**: "[exact instructions for implementation]"`;

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      system: agent.systemPrompt,
      messages: [
        { 
          role: 'user', 
          content: promptContent
        }
      ],
      tools: consultingToolConfig.tools as any,
      // FORCE TOOL USAGE FOR IMPLEMENTATION - Fix from Zara's analysis  
      tool_choice: isImplementationRequest ? "required" as const : "auto" as const
    });

    let agentResponse = '';
    let toolResults = [];

    // Handle tool execution (UNLIMITED ACCESS)
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
              toolResult = await search_filesystem(contentBlock.input as any);
            } else if (contentBlock.name === 'str_replace_based_edit_tool') {
              const input = contentBlock.input as any;
              // UNLIMITED ACCESS - ALL commands allowed
              const { str_replace_based_edit_tool } = await import('../tools/str_replace_based_edit_tool');
              toolResult = await str_replace_based_edit_tool(input);
            } else if (contentBlock.name === 'bash') {
              const input = contentBlock.input as any;
              try {
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);
                const result = await execAsync(input.command);
                toolResult = { output: result.stdout, error: result.stderr };
              } catch (bashError: any) {
                toolResult = { output: '', error: bashError.message };
              }
            } else if (contentBlock.name === 'web_search') {
              // Web search not implemented for consulting agents
              toolResult = { results: 'Web search not available in consulting mode' };
            }
            
            console.log(`✅ CONSULTING ${agent.name.toUpperCase()} TOOL RESULT: Success`);
            toolResults.push({
              tool: contentBlock.name,
              result: toolResult,
              success: true
            });
            
          } catch (error: any) {
            console.error(`❌ CONSULTING ${agent.name.toUpperCase()} TOOL ERROR:`, error);
            agentResponse += `\n\n❌ **Analysis tool error:** ${error?.message || 'Unknown error'}`;
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
      consulting: !isImplementationRequest, // Show implementation mode correctly
      implementation: isImplementationRequest,
      toolResults: toolResults
    });

  } catch (error: any) {
    console.error('❌ CONSULTING AGENT ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Consulting analysis failed',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;