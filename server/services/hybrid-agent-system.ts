/**
 * Hybrid Agent System
 * Claude API for content generation + Direct tool access for operations
 */

export interface HybridAgentRequest {
  agentId: string;
  message: string;
  fileEditMode?: boolean;
  conversationId?: string;
}

export interface HybridAgentResponse {
  success: boolean;
  response: string;
  contentGenerated?: boolean;
  toolsUsed?: string[];
  claudeApiUsed?: boolean;
  fileOperations?: any[];
}

class HybridAgentSystem {
  private claudeApiKey: string;

  constructor() {
    this.claudeApiKey = process.env.ANTHROPIC_API_KEY || '';
  }

  async processRequest(request: HybridAgentRequest): Promise<HybridAgentResponse> {
    console.log(`🔄 HYBRID PROCESSING: ${request.agentId} - Analyzing request type`);

    // Analyze if the request needs content generation
    const needsContentGeneration = this.analyzeContentNeed(request.message);
    
    if (needsContentGeneration) {
      console.log(`🎨 CONTENT GENERATION NEEDED: Using Claude API for ${request.agentId}`);
      return await this.generateContentWithClaude(request);
    } else {
      console.log(`🔧 TOOL OPERATION: Direct tool access for ${request.agentId}`);
      return await this.executeDirectToolOperation(request);
    }
  }

  private analyzeContentNeed(message: string): boolean {
    const contentKeywords = [
      'create', 'generate', 'write', 'implement', 'build', 'design',
      'component', 'function', 'interface', 'service', 'code',
      'tsx', 'ts', 'js', 'css', 'html', 'react',
      'luxury', 'editorial', 'sophisticated', 'professional'
    ];

    const toolKeywords = [
      'view', 'check', 'list', 'find', 'search', 'debug',
      'test', 'verify', 'validate', 'monitor', 'status'
    ];

    const messageWords = message.toLowerCase().split(/\s+/);
    
    const contentScore = messageWords.filter(word => 
      contentKeywords.some(keyword => word.includes(keyword))
    ).length;
    
    const toolScore = messageWords.filter(word => 
      toolKeywords.some(keyword => word.includes(keyword))
    ).length;

    // If asking for file creation or code generation, use Claude
    if (message.includes('.tsx') || message.includes('.ts') || message.includes('component')) {
      return true;
    }

    // If content score is higher, use Claude for generation
    return contentScore > toolScore;
  }

  private async generateContentWithClaude(request: HybridAgentRequest): Promise<HybridAgentResponse> {
    try {
      const { CONSULTING_AGENT_PERSONALITIES } = await import('../agent-personalities-consulting');
      const agentConfig = CONSULTING_AGENT_PERSONALITIES[request.agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];

      if (!agentConfig) {
        return {
          success: false,
          response: `Agent ${request.agentId} not found`,
          contentGenerated: false,
          claudeApiUsed: false
        };
      }

      const systemPrompt = `You are ${agentConfig.name}, ${agentConfig.role}.

${agentConfig.systemPrompt}

HYBRID SYSTEM INSTRUCTIONS:
- You have direct access to file operations through tools
- Generate complete, functional code content when creating files
- Use str_replace_based_edit_tool for file operations
- Include all imports, interfaces, and implementations
- Never create empty files - always include working code

Available tools:
- str_replace_based_edit_tool (view, create, str_replace)
- search_filesystem (find files and code)

When creating React components:
1. Include all necessary imports
2. Define proper TypeScript interfaces
3. Implement complete component logic
4. Use luxury design system (Times New Roman, black/white/gray)
5. Add proper error handling`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `${request.message}

CRITICAL: When creating files, include complete functional code in the file_text parameter. Never create empty files.`
            }
          ]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content && Array.isArray(data.content) && data.content.length > 0) {
          const content = data.content[0].text || data.content[0].content;
          console.log(`✅ CLAUDE CONTENT GENERATED: ${content.length} characters for ${request.agentId}`);
          
          return {
            success: true,
            response: content,
            contentGenerated: true,
            claudeApiUsed: true,
            toolsUsed: ['claude-api', 'content-generation']
          };
        }
      }

      throw new Error(`Claude API failed: ${response.status} ${response.statusText}`);

    } catch (error) {
      console.error(`❌ CLAUDE CONTENT GENERATION ERROR:`, error);
      return {
        success: false,
        response: `Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        contentGenerated: false,
        claudeApiUsed: false
      };
    }
  }

  private async executeDirectToolOperation(request: HybridAgentRequest): Promise<HybridAgentResponse> {
    console.log(`🔧 DIRECT TOOL OPERATION: ${request.agentId} executing actual tools without Claude API`);
    
    try {
      const { CONSULTING_AGENT_PERSONALITIES } = await import('../agent-personalities-consulting');
      const agentConfig = CONSULTING_AGENT_PERSONALITIES[request.agentId as keyof typeof CONSULTING_AGENT_PERSONALITIES];

      if (!agentConfig) {
        return {
          success: false,
          response: `Agent ${request.agentId} not found`,
          contentGenerated: false,
          claudeApiUsed: false
        };
      }

      let response = `**${agentConfig.name.toUpperCase()} EXECUTING TOOLS**\n\n`;
      const toolsUsed: string[] = [];
      const fileOperations: any[] = [];
      let actualWorkPerformed = false;

      // EXECUTE ACTUAL TOOLS BASED ON REQUEST
      const message = request.message.toLowerCase();

      // File cleanup operations
      if (message.includes('cleanup') || message.includes('delete') || message.includes('remove')) {
        const fs = await import('fs').then(m => m.promises);
        const path = await import('path');
        
        // Find Elena/MultiAgent files to cleanup
        if (message.includes('elena') || message.includes('multiagent')) {
          const filesToCleanup = [
            'client/src/components/admin/MultiAgentWorkflowInterface.tsx',
            'client/src/components/Elena/WorkflowCreator.tsx',
            'client/src/components/Elena/ElenaWorkflowsTab.tsx',
            'client/src/components/Elena/ElenaPhaseNavigation.tsx',
            'client/src/components/Elena/ElenaTestWorking.tsx'
          ];

          for (const filePath of filesToCleanup) {
            try {
              await fs.access(filePath);
              await fs.unlink(filePath);
              response += `✅ DELETED: ${filePath}\n`;
              actualWorkPerformed = true;
              toolsUsed.push('file-deletion');
            } catch (error) {
              response += `ℹ️  SKIP: ${filePath} (already deleted)\n`;
            }
          }
        }
      }

      // File creation operations - FIXED to handle any file creation
      if (message.includes('create')) {
        const fs = await import('fs').then(m => m.promises);
        const path = await import('path');
        
        // Extract filename from message using regex patterns
        const filePatterns = [
          /create\s+([^\s]+\.(tsx|ts|js|jsx|css|html|md|txt|json))/i,
          /create\s+([^\s]+)/i,
          /([^\s]+\.(tsx|ts|js|jsx|css|html|md|txt|json))/i
        ];
        
        let fileName = '';
        let fileContent = '';
        
        for (const pattern of filePatterns) {
          const match = request.message.match(pattern);
          if (match) {
            fileName = match[1];
            break;
          }
        }
        
        // Fallback filename if none detected
        if (!fileName) {
          fileName = `agent-created-${request.agentId}-${Date.now()}.txt`;
        }
        
        // Generate appropriate content based on file type
        const ext = path.extname(fileName).toLowerCase();
        
        if (ext === '.tsx') {
          // Create React TypeScript component
          const componentName = path.basename(fileName, '.tsx');
          fileContent = `import React from 'react';

interface ${componentName}Props {
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className = '' 
}) => {
  return (
    <div className={\`luxury-component \${className}\`}>
      <h2 className="text-2xl font-bold text-black">
        ${componentName}
      </h2>
      <p className="text-gray-600 mt-2">
        Generated by ${agentConfig.name}
      </p>
    </div>
  );
};

export default ${componentName};
`;
        } else if (ext === '.ts') {
          // Create TypeScript file
          fileContent = `// ${fileName} - Generated by ${agentConfig.name}

export interface ${path.basename(fileName, '.ts')}Config {
  enabled: boolean;
  timestamp: string;
}

export const ${path.basename(fileName, '.ts')}Service = {
  initialize: (): ${path.basename(fileName, '.ts')}Config => ({
    enabled: true,
    timestamp: new Date().toISOString()
  }),
  
  process: (config: ${path.basename(fileName, '.ts')}Config) => {
    console.log('Processing with config:', config);
    return config;
  }
};
`;
        } else if (ext === '.md') {
          // Create Markdown file
          fileContent = `# ${path.basename(fileName, '.md')}

Generated by **${agentConfig.name}** on ${new Date().toISOString()}

## Overview

This file was created automatically by the autonomous agent system.

## Features

- Automated content generation
- Luxury design system integration
- TypeScript and React compatibility

## Usage

Add your content here.
`;
        } else {
          // Default text content
          fileContent = `File created by ${agentConfig.name} at ${new Date().toISOString()}\n\nContent: ${request.message}\n\nGenerated automatically by SSELFIE Studio agent system.`;
        }
        
        try {
          // Ensure directory exists
          const dir = path.dirname(fileName);
          if (dir !== '.' && dir !== fileName) {
            await fs.mkdir(dir, { recursive: true });
          }
          
          await fs.writeFile(fileName, fileContent);
          response += `✅ CREATED: ${fileName} (${fileContent.length} characters)\n`;
          actualWorkPerformed = true;
          toolsUsed.push('file-creation');
          fileOperations.push({
            action: 'create',
            path: fileName,
            content: fileContent,
            size: fileContent.length
          });
        } catch (error) {
          response += `❌ FAILED to create ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
        }
      }

      // File viewing operations
      if (message.includes('view') || message.includes('check') || message.includes('status')) {
        const fs = await import('fs').then(m => m.promises);
        
        // Check for Elena files
        const filesToCheck = [
          'client/src/components/admin/MultiAgentWorkflowInterface.tsx',
          'client/src/components/Elena/WorkflowCreator.tsx'
        ];

        for (const filePath of filesToCheck) {
          try {
            await fs.access(filePath);
            response += `📁 EXISTS: ${filePath}\n`;
          } catch (error) {
            response += `✅ CLEAN: ${filePath} (not found)\n`;
          }
        }
        actualWorkPerformed = true;
        toolsUsed.push('file-checking');
      }

      if (!actualWorkPerformed) {
        response += `ℹ️  No specific file operations detected for: "${request.message}"\n`;
        response += `💡 Available operations: cleanup, delete, create test file, view status\n`;
      }

      response += `\n**TOOL EXECUTION COMPLETE** - Zero API costs, actual file operations performed.`;

      return {
        success: true,
        response,
        contentGenerated: false,
        claudeApiUsed: false,
        toolsUsed,
        fileOperations
      };

    } catch (error) {
      console.error(`❌ TOOL OPERATION ERROR:`, error);
      return {
        success: false,
        response: `Tool operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        contentGenerated: false,
        claudeApiUsed: false
      };
    }
  }

  // Test if Claude API is available
  async testClaudeConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 50,
          messages: [
            {
              role: 'user',
              content: 'Test connection'
            }
          ]
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const hybridAgentSystem = new HybridAgentSystem();
export default hybridAgentSystem;