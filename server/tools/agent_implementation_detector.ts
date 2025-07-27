import { AgentImplementationRequest } from './agent_implementation_toolkit';

/**
 * Agent Implementation Detector - Automatically detects when agents should switch from advisory to implementation mode
 * Transforms "strategic guidance" requests into "autonomous implementation" actions
 */

export interface ImplementationDetectionResult {
  isImplementationRequest: boolean;
  agentName: string;
  implementationRequest?: AgentImplementationRequest;
  confidence: number;
  reasoning: string[];
}

export class AgentImplementationDetector {

  /**
   * Detect if a message is requesting implementation rather than advice
   */
  detectImplementationRequest(
    agentName: string, 
    userMessage: string, 
    conversationHistory?: any[]
  ): ImplementationDetectionResult {
    
    const result: ImplementationDetectionResult = {
      isImplementationRequest: false,
      agentName: agentName.toLowerCase(),
      confidence: 0,
      reasoning: []
    };

    // Implementation keywords that indicate action vs advice  
    const implementationKeywords = [
      'create', 'build', 'implement', 'generate', 'make', 'develop', 'code', 'write',
      'fix', 'update', 'modify', 'refactor', 'redesign', 'optimize', 'edit',
      'set up', 'setup', 'configure', 'install', 'deploy', 'launch', 'add'
    ];
    
    // High-value implementation phrases
    const strongImplementationPhrases = [
      'create a', 'build a', 'make a', 'implement a', 'generate a',
      'create new', 'build new', 'add new', 'write a', 'code a'
    ];

    // Advisory keywords that indicate consultation
    const advisoryKeywords = [
      'analyze', 'review', 'suggest', 'recommend', 'advise', 'explain',
      'tell me', 'what do you think', 'how would you', 'should i',
      'opinion', 'assessment', 'evaluation', 'strategy'
    ];

    // System building phrases that indicate complex implementation
    const systemBuildingPhrases = [
      'multi-file system', 'complete system', 'enterprise system',
      'full implementation', 'production ready', 'working solution',
      'entire component', 'complex architecture', 'full stack'
    ];

    const message = userMessage.toLowerCase();
    
    // Check for implementation keywords
    const implementationMatches = implementationKeywords.filter(keyword => 
      message.includes(keyword)
    );
    
    const advisoryMatches = advisoryKeywords.filter(keyword => 
      message.includes(keyword)
    );

    const systemBuildingMatches = systemBuildingPhrases.filter(phrase => 
      message.includes(phrase)
    );
    
    const strongImplementationMatches = strongImplementationPhrases.filter(phrase => 
      message.includes(phrase)
    );

    // Calculate confidence score
    let confidence = 0;
    
    // High-value implementation phrases (strong indicators)
    if (strongImplementationMatches.length > 0) {
      confidence += strongImplementationMatches.length * 35;
      result.reasoning.push(`Strong implementation phrases found: ${strongImplementationMatches.join(', ')}`);
    }
    
    // Regular implementation indicators
    if (implementationMatches.length > 0) {
      confidence += implementationMatches.length * 15;
      result.reasoning.push(`Implementation keywords found: ${implementationMatches.join(', ')}`);
    }

    // System building is strong indicator
    if (systemBuildingMatches.length > 0) {
      confidence += systemBuildingMatches.length * 30;
      result.reasoning.push(`System building phrases found: ${systemBuildingMatches.join(', ')}`);
    }

    // Advisory indicators reduce confidence
    if (advisoryMatches.length > 0) {
      confidence -= advisoryMatches.length * 15;
      result.reasoning.push(`Advisory keywords found: ${advisoryMatches.join(', ')}`);
    }

    // Agent-specific detection patterns
    confidence += this.detectAgentSpecificPatterns(agentName, message, result.reasoning);

    // Context from previous messages
    if (conversationHistory && conversationHistory.length > 0) {
      const contextConfidence = this.analyzeConversationContext(conversationHistory, result.reasoning);
      confidence += contextConfidence;
    }

    // Determine if this is an implementation request
    result.confidence = Math.max(0, Math.min(100, confidence));
    result.isImplementationRequest = result.confidence >= 35;  // Lowered threshold for better detection

    // Generate implementation request if detected
    if (result.isImplementationRequest) {
      result.implementationRequest = this.generateImplementationRequest(
        agentName, 
        userMessage, 
        result.confidence
      );
    }

    return result;
  }

  /**
   * Agent-specific pattern detection
   */
  private detectAgentSpecificPatterns(agentName: string, message: string, reasoning: string[]): number {
    let confidence = 0;

    switch (agentName.toLowerCase()) {
      case 'zara':
        // Technical implementation patterns
        if (message.includes('backend') || message.includes('api') || message.includes('database')) {
          confidence += 25;
          reasoning.push('Zara: Backend/API implementation pattern detected');
        }
        if (message.includes('architecture') || message.includes('performance')) {
          confidence += 20;
          reasoning.push('Zara: Architecture/performance implementation pattern');
        }
        break;

      case 'aria':
        // Design implementation patterns
        if (message.includes('component') || message.includes('ui') || message.includes('interface')) {
          confidence += 25;
          reasoning.push('Aria: UI/Component implementation pattern detected');
        }
        if (message.includes('luxury') || message.includes('design') || message.includes('beautiful')) {
          confidence += 20;
          reasoning.push('Aria: Luxury design implementation pattern');
        }
        break;

      case 'elena':
        // Coordination implementation patterns
        if (message.includes('workflow') || message.includes('coordinate') || message.includes('system')) {
          confidence += 25;
          reasoning.push('Elena: Workflow/coordination implementation pattern detected');
        }
        if (message.includes('monitor') || message.includes('manage') || message.includes('orchestrate')) {
          confidence += 20;
          reasoning.push('Elena: Management system implementation pattern');
        }
        break;

      case 'maya':
        // AI photography implementation patterns
        if (message.includes('generate') || message.includes('image') || message.includes('photo')) {
          confidence += 25;
          reasoning.push('Maya: AI photography implementation pattern detected');
        }
        if (message.includes('flux') || message.includes('model') || message.includes('training')) {
          confidence += 20;
          reasoning.push('Maya: AI model implementation pattern');
        }
        break;
    }

    return confidence;
  }

  /**
   * Analyze conversation context for implementation signals
   */
  private analyzeConversationContext(conversationHistory: any[], reasoning: string[]): number {
    let confidence = 0;

    // Look for escalating requests (advice -> implementation)
    const recentMessages = conversationHistory.slice(-3);
    
    for (const msg of recentMessages) {
      if (msg.content && typeof msg.content === 'string') {
        const content = msg.content.toLowerCase();
        
        // Previous advice given, now asking for implementation
        if (content.includes('how would i') || content.includes('can you help me')) {
          confidence += 15;
          reasoning.push('Context: Previous advisory, now requesting help');
        }

        // Follow-up implementation requests
        if (content.includes('actually do') || content.includes('implement that')) {
          confidence += 20;
          reasoning.push('Context: Follow-up implementation request');
        }
      }
    }

    return confidence;
  }

  /**
   * Generate structured implementation request
   */
  private generateImplementationRequest(
    agentName: string, 
    userMessage: string, 
    confidence: number
  ): AgentImplementationRequest {
    
    // Extract system name from message
    const systemName = this.extractSystemName(userMessage) || 'UnnamedSystem';
    
    // Determine task type based on message content
    const taskType = this.determineTaskType(userMessage);
    
    // Extract requirements from message
    const requirements = this.extractRequirements(userMessage);
    
    // Determine complexity
    const complexity = this.determineComplexity(userMessage, requirements);

    return {
      agentName: agentName.toLowerCase(),
      taskType,
      specifications: {
        systemName,
        requirements,
        designPattern: this.determineDesignPattern(agentName, userMessage),
        complexity,
        files: this.extractMentionedFiles(userMessage),
        integrationPoints: this.extractIntegrationPoints(userMessage)
      },
      validation: {
        requireTesting: confidence > 80,
        requireVerification: true,
        performanceTargets: this.extractPerformanceTargets(userMessage)
      }
    };
  }

  private extractSystemName(message: string): string {
    // Simple extraction - look for capitalized words or quoted names
    const matches = message.match(/["']([^"']+)["']/) || 
                   message.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/);
    
    if (matches && matches[1]) {
      return matches[1].replace(/\s+/g, '');
    }
    
    // Default based on common system types
    if (message.includes('component')) return 'LuxuryComponent';
    if (message.includes('api')) return 'EnterpriseAPI';
    if (message.includes('dashboard')) return 'AdminDashboard';
    if (message.includes('monitor')) return 'SystemMonitor';
    
    return 'CustomSystem';
  }

  private determineTaskType(message: string): AgentImplementationRequest['taskType'] {
    const msg = message.toLowerCase();
    
    if (msg.includes('create') || msg.includes('build') || msg.includes('generate')) {
      return 'create-system';
    }
    if (msg.includes('refactor') || msg.includes('restructure') || msg.includes('architecture')) {
      return 'refactor-architecture';
    }
    if (msg.includes('optimize') || msg.includes('performance') || msg.includes('speed')) {
      return 'optimize-performance';
    }
    if (msg.includes('redesign') || msg.includes('luxury') || msg.includes('beautiful')) {
      return 'luxury-redesign';
    }
    
    return 'build-feature';
  }

  private extractRequirements(message: string): string[] {
    const requirements: string[] = [];
    
    // Look for requirement indicators
    const requirementPatterns = [
      /needs? to (.+?)(?:\.|,|$)/gi,
      /should (.+?)(?:\.|,|$)/gi,
      /must (.+?)(?:\.|,|$)/gi,
      /require[s]? (.+?)(?:\.|,|$)/gi,
      /with (.+?)(?:\.|,|$)/gi
    ];
    
    for (const pattern of requirementPatterns) {
      const matches = Array.from(message.matchAll(pattern));
      for (const match of matches) {
        if (match[1] && match[1].length > 3) {
          requirements.push(match[1].trim());
        }
      }
    }
    
    // Default requirements if none found
    if (requirements.length === 0) {
      requirements.push('Professional implementation');
      requirements.push('Production ready code');
      requirements.push('Proper error handling');
    }
    
    return requirements.slice(0, 5); // Limit to 5 requirements
  }

  private determineComplexity(message: string, requirements: string[]): 'simple' | 'moderate' | 'complex' | 'enterprise' {
    let complexityScore = 0;
    
    const msg = message.toLowerCase();
    
    // Complexity indicators
    if (msg.includes('enterprise') || msg.includes('production') || msg.includes('scalable')) {
      complexityScore += 3;
    }
    if (msg.includes('multi') || msg.includes('complete') || msg.includes('full')) {
      complexityScore += 2;
    }
    if (msg.includes('system') || msg.includes('architecture') || msg.includes('integration')) {
      complexityScore += 2;
    }
    
    complexityScore += requirements.length;
    
    if (complexityScore >= 8) return 'enterprise';
    if (complexityScore >= 5) return 'complex';
    if (complexityScore >= 3) return 'moderate';
    return 'simple';
  }

  private determineDesignPattern(agentName: string, message: string): 'luxury-editorial' | 'enterprise-dashboard' | 'minimalist-interface' {
    const msg = message.toLowerCase();
    
    if (agentName.toLowerCase() === 'aria' || msg.includes('luxury') || msg.includes('editorial')) {
      return 'luxury-editorial';
    }
    if (msg.includes('dashboard') || msg.includes('admin') || msg.includes('monitor')) {
      return 'enterprise-dashboard';
    }
    return 'minimalist-interface';
  }

  private extractMentionedFiles(message: string): string[] {
    const filePattern = /[\w-]+\.(ts|tsx|js|jsx|css|scss|json|md)/gi;
    return Array.from(message.matchAll(filePattern)).map(match => match[0]);
  }

  private extractIntegrationPoints(message: string): string[] {
    const integrationPatterns = [
      /integrate(?:s|d)? with (.+?)(?:\.|,|$)/gi,
      /connect(?:s|ed)? to (.+?)(?:\.|,|$)/gi,
      /work(?:s)? with (.+?)(?:\.|,|$)/gi
    ];
    
    const integrations: string[] = [];
    
    for (const pattern of integrationPatterns) {
      const matches = Array.from(message.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          integrations.push(match[1].trim());
        }
      }
    }
    
    return integrations;
  }

  private extractPerformanceTargets(message: string): string[] {
    const msg = message.toLowerCase();
    const targets: string[] = [];
    
    if (msg.includes('fast') || msg.includes('speed') || msg.includes('performance')) {
      targets.push('High performance');
    }
    if (msg.includes('scalable') || msg.includes('scale')) {
      targets.push('Scalability');
    }
    if (msg.includes('responsive') || msg.includes('mobile')) {
      targets.push('Responsive design');
    }
    
    return targets;
  }
}

// Export singleton instance
export const agentImplementationDetector = new AgentImplementationDetector();