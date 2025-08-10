import { AgentProtocolValidator } from './agent-protocol-validator';

export class AgentProtocolEnforcer {
  static async validateFileCreation(
    fileContent: string,
    filePath: string
  ): Promise<{ canProceed: boolean; errors?: string[]; fixedContent?: string }> {
    // Determine if this is a component file
    const isComponent = filePath.includes('/components/') || filePath.endsWith('.tsx');
    
    // Run appropriate validation
    const validation = isComponent 
      ? AgentProtocolValidator.validateComponent(fileContent)
      : AgentProtocolValidator.validateSourceCode(fileContent);

    if (!validation.isValid) {
      // Try to auto-fix the issues
      const fixedContent = AgentProtocolValidator.autoFixImports(fileContent);
      
      // Validate the fixed content
      const revalidation = isComponent
        ? AgentProtocolValidator.validateComponent(fixedContent)
        : AgentProtocolValidator.validateSourceCode(fixedContent);

      if (revalidation.isValid) {
        return {
          canProceed: true,
          fixedContent
        };
      }

      return {
        canProceed: false,
        errors: validation.errors
      };
    }

    return { canProceed: true };
  }

  static async enforceProtocols(
    agentId: string,
    action: 'create' | 'modify',
    filePath: string,
    content: string
  ): Promise<{ 
    success: boolean;
    message: string;
    fixedContent?: string;
  }> {
    try {
      const validation = await this.validateFileCreation(content, filePath);

      if (!validation.canProceed) {
        return {
          success: false,
          message: `Protocol violation by agent ${agentId}:\n${validation.errors?.join('\n')}`,
        };
      }

      if (validation.fixedContent) {
        return {
          success: true,
          message: 'Content auto-fixed to meet protocols',
          fixedContent: validation.fixedContent
        };
      }

      return {
        success: true,
        message: 'Content meets all safety protocols'
      };
    } catch (error) {
      return {
        success: false,
        message: `Protocol enforcement error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}