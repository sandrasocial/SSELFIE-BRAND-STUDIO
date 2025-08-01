/**
 * Claude Content Generator Service
 * Dedicated service for generating actual code content through Claude API
 */

export interface CodeGenerationRequest {
  agentId: string;
  task: string;
  fileType: 'component' | 'service' | 'interface' | 'utility';
  filePath: string;
  requirements: string[];
  designContext?: 'luxury' | 'editorial' | 'technical';
}

export interface CodeGenerationResponse {
  success: boolean;
  content: string;
  error?: string;
  metadata: {
    tokens: number;
    model: string;
    timestamp: Date;
  };
}

class ClaudeContentGenerator {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for content generation');
    }
  }

  async generateContent(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    console.log(`🎨 CLAUDE CONTENT GENERATION: ${request.agentId} - ${request.fileType} for ${request.filePath}`);

    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Claude API Error: ${response.status} ${response.statusText}: ${errorText}`);
        return {
          success: false,
          content: '',
          error: `API Error: ${response.status} ${response.statusText}`,
          metadata: {
            tokens: 0,
            model: 'claude-3-5-sonnet-20241022',
            timestamp: new Date()
          }
        };
      }

      const data = await response.json();
      
      if (data.content && Array.isArray(data.content) && data.content.length > 0) {
        const content = data.content[0].text || data.content[0].content || '';
        
        console.log(`✅ CLAUDE CONTENT SUCCESS: Generated ${content.length} characters for ${request.filePath}`);
        
        return {
          success: true,
          content,
          metadata: {
            tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
            model: 'claude-3-5-sonnet-20241022',
            timestamp: new Date()
          }
        };
      } else {
        console.error('❌ Claude API returned empty content');
        return {
          success: false,
          content: '',
          error: 'Empty response from Claude API',
          metadata: {
            tokens: 0,
            model: 'claude-3-5-sonnet-20241022',
            timestamp: new Date()
          }
        };
      }
    } catch (error) {
      console.error('❌ Claude Content Generation Error:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          tokens: 0,
          model: 'claude-3-5-sonnet-20241022',
          timestamp: new Date()
        }
      };
    }
  }

  private buildSystemPrompt(request: CodeGenerationRequest): string {
    let systemPrompt = `You are ${request.agentId.toUpperCase()}, an expert developer working on SSELFIE Studio. You generate complete, functional code files.

CRITICAL REQUIREMENTS:
1. Generate COMPLETE, WORKING code - never create empty files
2. Include ALL necessary imports and dependencies
3. Follow TypeScript/React best practices
4. Use proper interfaces and type definitions
5. Include comprehensive error handling
6. Add proper JSDoc comments for complex functions

PROJECT CONTEXT:
- SSELFIE Studio: AI-powered personal branding platform
- Tech Stack: React 18, TypeScript, Tailwind CSS, Express.js, PostgreSQL
- Design System: Luxury editorial with Times New Roman, black/white/gray palette
- Authentication: Replit Auth with session management
- Database: Drizzle ORM with PostgreSQL`;

    // Add agent-specific expertise
    switch (request.agentId.toLowerCase()) {
      case 'aria':
        systemPrompt += `\n\nARIA SPECIALIZATION:
- UX/UI Components with luxury editorial design
- Shadcn/ui components with custom styling
- Responsive layouts with Tailwind CSS
- Accessibility and user experience optimization
- Times New Roman typography for headlines`;
        break;
      
      case 'zara':
        systemPrompt += `\n\nZARA SPECIALIZATION:
- Backend services and API development
- Database schemas and data modeling
- Authentication and security systems
- Service integration and error handling
- Performance optimization and monitoring`;
        break;
      
      case 'maya':
        systemPrompt += `\n\nMAYA SPECIALIZATION:
- Technical architecture and system design
- AI/ML integration and optimization
- Performance monitoring and analytics
- Code quality and testing frameworks
- DevOps and deployment strategies`;
        break;
      
      case 'victoria':
        systemPrompt += `\n\nVICTORIA SPECIALIZATION:
- Integration workflows and testing
- Cross-service communication
- Data validation and transformation
- Business logic implementation
- Quality assurance and debugging`;
        break;
      
      case 'elena':
        systemPrompt += `\n\nELENA SPECIALIZATION:
- Project coordination and workflow management
- Documentation and knowledge management
- Process optimization and automation
- Team collaboration tools
- Progress tracking and reporting`;
        break;
      
      case 'olga':
        systemPrompt += `\n\nOLGA SPECIALIZATION:
- Code organization and cleanup
- File structure optimization
- Legacy system migration
- Documentation maintenance
- Technical debt management`;
        break;
    }

    // Add design context
    if (request.designContext === 'luxury') {
      systemPrompt += `\n\nLUXURY DESIGN REQUIREMENTS:
- Times New Roman for headlines, system fonts for UI
- Black (#0a0a0a), white (#ffffff), editorial gray (#f5f5f5)
- Generous whitespace and minimal icons
- Editorial magazine-style layouts
- Premium, sophisticated aesthetic`;
    }

    return systemPrompt;
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    let prompt = `Generate a complete ${request.fileType} file for: ${request.filePath}

TASK: ${request.task}

REQUIREMENTS:
${request.requirements.map((req, index) => `${index + 1}. ${req}`).join('\n')}

CRITICAL INSTRUCTIONS:
- Generate COMPLETE, FUNCTIONAL code (not pseudo-code or comments)
- Include ALL necessary imports at the top
- Use proper TypeScript interfaces and types
- Follow React/Node.js best practices
- Add comprehensive error handling
- Include JSDoc comments for complex functions
- Make the code production-ready

Return ONLY the complete code file content - no explanations or markdown formatting.`;

    // Add file-type specific instructions
    switch (request.fileType) {
      case 'component':
        prompt += `\n\nCOMPONENT REQUIREMENTS:
- Export as named function component
- Include proper prop interfaces
- Use React hooks appropriately
- Add loading and error states
- Include accessibility attributes
- Use Tailwind CSS for styling`;
        break;
      
      case 'service':
        prompt += `\n\nSERVICE REQUIREMENTS:
- Export class or functions with proper interfaces
- Include comprehensive error handling
- Add logging for debugging
- Use TypeScript strict types
- Include proper async/await patterns
- Add input validation`;
        break;
      
      case 'interface':
        prompt += `\n\nINTERFACE REQUIREMENTS:
- Define all necessary TypeScript interfaces
- Include proper type exports
- Add JSDoc documentation
- Use generic types where appropriate
- Include utility types if needed`;
        break;
      
      case 'utility':
        prompt += `\n\nUTILITY REQUIREMENTS:
- Pure functions with no side effects
- Comprehensive input validation
- Proper error handling
- Type-safe implementations
- Add unit test examples in comments`;
        break;
    }

    return prompt;
  }

  // Convenience methods for specific file types
  async generateComponent(agentId: string, filePath: string, task: string, requirements: string[]): Promise<CodeGenerationResponse> {
    return this.generateContent({
      agentId,
      task,
      fileType: 'component',
      filePath,
      requirements,
      designContext: 'luxury'
    });
  }

  async generateService(agentId: string, filePath: string, task: string, requirements: string[]): Promise<CodeGenerationResponse> {
    return this.generateContent({
      agentId,
      task,
      fileType: 'service',
      filePath,
      requirements,
      designContext: 'technical'
    });
  }

  async generateInterface(agentId: string, filePath: string, task: string, requirements: string[]): Promise<CodeGenerationResponse> {
    return this.generateContent({
      agentId,
      task,
      fileType: 'interface',
      filePath,
      requirements
    });
  }

  // Test the Claude API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 50,
          messages: [
            {
              role: 'user',
              content: 'Test connection. Respond with "Connection successful"'
            }
          ]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Claude API connection successful'
        };
      } else {
        return {
          success: false,
          message: `API connection failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const claudeContentGenerator = new ClaudeContentGenerator();
export default claudeContentGenerator;