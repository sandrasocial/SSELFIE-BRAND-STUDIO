/**
 * PATTERN LIBRARY SERVICE
 * Caches successful agent workflows and responses for instant local processing
 * Eliminates token costs for repetitive tasks through intelligent pattern matching
 */

import { db } from '../../db';
import { agentLearning } from '../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface WorkflowPattern {
  id: string;
  agentId: string;
  category: string;
  inputPattern: string;
  responseTemplate: string;
  confidence: number;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
  metadata: {
    tokens_saved: number;
    success_rate: number;
    user_satisfaction: number;
  };
}

export interface PatternMatch {
  pattern: WorkflowPattern;
  matchConfidence: number;
  adaptations: string[];
}

export class PatternLibraryService {
  private static instance: PatternLibraryService;
  private patternCache = new Map<string, WorkflowPattern[]>();
  private recentPatterns = new Map<string, WorkflowPattern>();

  private constructor() {}

  public static getInstance(): PatternLibraryService {
    if (!PatternLibraryService.instance) {
      PatternLibraryService.instance = new PatternLibraryService();
    }
    return PatternLibraryService.instance;
  }

  /**
   * FIND MATCHING PATTERNS
   * Searches for cached patterns that match the current request
   */
  async findMatchingPatterns(agentId: string, userInput: string, userId: string): Promise<PatternMatch[]> {
    console.log(`🔍 PATTERN SEARCH: Finding matches for ${agentId} request`);

    try {
      // Load agent patterns from cache or database
      let agentPatterns = this.patternCache.get(agentId);
      
      if (!agentPatterns) {
        agentPatterns = await this.loadAgentPatterns(agentId, userId);
        this.patternCache.set(agentId, agentPatterns);
      }

      // Find matching patterns
      const matches: PatternMatch[] = [];

      for (const pattern of agentPatterns) {
        const matchConfidence = this.calculatePatternMatch(userInput, pattern);
        
        if (matchConfidence > 0.6) { // Minimum confidence threshold
          matches.push({
            pattern,
            matchConfidence,
            adaptations: this.generateAdaptations(userInput, pattern)
          });
        }
      }

      // Sort by confidence
      matches.sort((a, b) => b.matchConfidence - a.matchConfidence);

      console.log(`📚 PATTERN MATCHES: Found ${matches.length} patterns with confidence > 0.6`);
      return matches.slice(0, 3); // Return top 3 matches

    } catch (error) {
      console.error('Pattern matching error:', error);
      return [];
    }
  }

  /**
   * GENERATE RESPONSE FROM PATTERN
   * Creates contextualized response using cached pattern
   */
  async generatePatternResponse(
    match: PatternMatch, 
    agentId: string, 
    userInput: string,
    context: any
  ): Promise<string> {
    
    console.log(`🎭 PATTERN RESPONSE: Generating from ${match.pattern.category} pattern`);

    try {
      let response = match.pattern.responseTemplate;

      // Apply adaptations
      for (const adaptation of match.adaptations) {
        response = this.applyAdaptation(response, adaptation, userInput, context);
      }

      // Update usage statistics
      await this.updatePatternUsage(match.pattern.id);

      // Personalize with current context
      response = this.personalizeResponse(response, agentId, context);

      console.log(`✅ PATTERN GENERATED: ${match.matchConfidence.toFixed(2)} confidence, ${match.pattern.metadata.tokens_saved} tokens saved`);

      return response;

    } catch (error) {
      console.error('Pattern response generation error:', error);
      return '';
    }
  }

  /**
   * SAVE SUCCESSFUL PATTERN
   * Records new successful interactions for future use
   */
  async saveSuccessfulPattern(
    agentId: string,
    userId: string,
    userInput: string,
    response: string,
    category: string,
    tokensUsed: number
  ): Promise<void> {
    
    console.log(`💾 SAVING PATTERN: ${agentId} - ${category}`);

    try {
      const pattern: WorkflowPattern = {
        id: `${agentId}_${Date.now()}_${category}`,
        agentId,
        category,
        inputPattern: this.extractInputPattern(userInput),
        responseTemplate: this.createResponseTemplate(response),
        confidence: 0.8, // Initial confidence
        usageCount: 1,
        lastUsed: new Date(),
        createdAt: new Date(),
        metadata: {
          tokens_saved: tokensUsed,
          success_rate: 1.0,
          user_satisfaction: 0.9
        }
      };

      // Save to database via agent learning system
      await db.insert(agentLearning).values({
        agentName: agentId,
        userId,
        learningType: 'workflow_pattern',
        category,
        data: { pattern },
        confidence: pattern.confidence.toString(),
        frequency: 1,
        lastSeen: new Date(),
        context: category
      });

      // Update cache
      const agentPatterns = this.patternCache.get(agentId) || [];
      agentPatterns.push(pattern);
      this.patternCache.set(agentId, agentPatterns);

      console.log(`✅ PATTERN SAVED: ${pattern.id} for future zero-cost processing`);

    } catch (error) {
      console.error('Pattern save error:', error);
    }
  }

  /**
   * LOAD AGENT PATTERNS
   * Retrieves cached patterns from database
   */
  private async loadAgentPatterns(agentId: string, userId: string): Promise<WorkflowPattern[]> {
    try {
      const learningData = await db
        .select()
        .from(agentLearning)
        .where(and(
          eq(agentLearning.agentName, agentId),
          eq(agentLearning.learningType, 'workflow_pattern')
        ))
        .orderBy(desc(agentLearning.lastSeen))
        .limit(50);

      const patterns: WorkflowPattern[] = [];

      for (const learning of learningData) {
        if (learning.data && typeof learning.data === 'object' && 'pattern' in learning.data) {
          const patternData = (learning.data as any).pattern;
          if (this.isValidPattern(patternData)) {
            patterns.push(patternData);
          }
        }
      }

      console.log(`📚 LOADED PATTERNS: ${patterns.length} patterns for ${agentId}`);
      return patterns;

    } catch (error) {
      console.error('Pattern loading error:', error);
      return [];
    }
  }

  /**
   * CALCULATE PATTERN MATCH
   * Determines how well a pattern matches the current input
   */
  private calculatePatternMatch(userInput: string, pattern: WorkflowPattern): number {
    const inputLower = userInput.toLowerCase();
    const patternLower = pattern.inputPattern.toLowerCase();

    let score = 0;

    // Exact keyword matching
    const inputWords = inputLower.split(/\s+/);
    const patternWords = patternLower.split(/\s+/);
    
    const matchingWords = inputWords.filter(word => 
      patternWords.some(patternWord => 
        word.includes(patternWord) || patternWord.includes(word)
      )
    );

    score += (matchingWords.length / inputWords.length) * 0.6;

    // Category matching bonus
    if (inputLower.includes(pattern.category.toLowerCase())) {
      score += 0.3;
    }

    // Structural similarity
    if (this.hasSimilarStructure(inputLower, patternLower)) {
      score += 0.2;
    }

    // Usage frequency bonus
    score += Math.min(0.1, pattern.usageCount * 0.01);

    return Math.min(1.0, score);
  }

  /**
   * GENERATE ADAPTATIONS
   * Creates adaptations needed to fit pattern to current context
   */
  private generateAdaptations(userInput: string, pattern: WorkflowPattern): string[] {
    const adaptations: string[] = [];

    // Extract specific elements from user input
    const filePattern = /[\w\/\.-]+\.(ts|js|tsx|jsx|json|md|css|html)/i;
    const fileMatch = userInput.match(filePattern);
    if (fileMatch) {
      adaptations.push(`file_reference:${fileMatch[0]}`);
    }

    // Extract action verbs
    const actionPattern = /(add|create|update|fix|remove|delete|implement|build)/i;
    const actionMatch = userInput.match(actionPattern);
    if (actionMatch) {
      adaptations.push(`action:${actionMatch[0]}`);
    }

    // Extract component names
    const componentPattern = /(button|component|page|form|modal|menu|navbar|footer)/i;
    const componentMatch = userInput.match(componentPattern);
    if (componentMatch) {
      adaptations.push(`component:${componentMatch[0]}`);
    }

    return adaptations;
  }

  /**
   * APPLY ADAPTATION
   * Modifies response template based on adaptation
   */
  private applyAdaptation(response: string, adaptation: string, userInput: string, context: any): string {
    const [type, value] = adaptation.split(':');

    switch (type) {
      case 'file_reference':
        return response.replace(/\{file\}/g, value);
      case 'action':
        return response.replace(/\{action\}/g, value);
      case 'component':
        return response.replace(/\{component\}/g, value);
      default:
        return response;
    }
  }

  /**
   * PERSONALIZE RESPONSE
   * Adds agent personality and current context
   */
  private personalizeResponse(response: string, agentId: string, context: any): string {
    // Add timestamp
    response = response.replace(/\{timestamp\}/g, new Date().toLocaleTimeString());
    
    // Add agent specific touches
    if (agentId === 'zara') {
      response = response.replace(/\{agent_touch\}/g, '🔧 ');
    } else if (agentId === 'maya') {
      response = response.replace(/\{agent_touch\}/g, '🎨 ');
    } else {
      response = response.replace(/\{agent_touch\}/g, '✨ ');
    }

    return response;
  }

  /**
   * UPDATE PATTERN USAGE
   * Increments usage statistics for successful patterns
   */
  private async updatePatternUsage(patternId: string): Promise<void> {
    try {
      // Update in-memory cache
      for (const patterns of this.patternCache.values()) {
        const pattern = patterns.find(p => p.id === patternId);
        if (pattern) {
          pattern.usageCount++;
          pattern.lastUsed = new Date();
          pattern.confidence = Math.min(1.0, pattern.confidence + 0.01);
          break;
        }
      }
    } catch (error) {
      console.error('Pattern usage update error:', error);
    }
  }

  /**
   * EXTRACT INPUT PATTERN
   * Creates a pattern from user input for future matching
   */
  private extractInputPattern(userInput: string): string {
    // Remove specific details but keep structure
    let pattern = userInput.toLowerCase();
    
    // Replace specific files with placeholder
    pattern = pattern.replace(/[\w\/\.-]+\.(ts|js|tsx|jsx|json|md|css|html)/gi, '{file}');
    
    // Replace specific components with placeholder
    pattern = pattern.replace(/(button|component|page|form|modal)/gi, '{component}');
    
    // Keep action words and structure
    return pattern;
  }

  /**
   * CREATE RESPONSE TEMPLATE
   * Converts response to reusable template
   */
  private createResponseTemplate(response: string): string {
    let template = response;
    
    // Replace specific files with placeholder
    template = template.replace(/[\w\/\.-]+\.(ts|js|tsx|jsx|json|md|css|html)/gi, '{file}');
    
    // Replace timestamps with placeholder
    template = template.replace(/\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?/gi, '{timestamp}');
    
    // Replace specific components
    template = template.replace(/(button|component|page|form|modal)/gi, '{component}');
    
    return template;
  }

  private hasSimilarStructure(input1: string, input2: string): boolean {
    // Simple structural similarity check
    const structure1 = input1.replace(/\w+/g, 'W').replace(/\d+/g, 'N');
    const structure2 = input2.replace(/\w+/g, 'W').replace(/\d+/g, 'N');
    return structure1 === structure2;
  }

  private isValidPattern(pattern: any): pattern is WorkflowPattern {
    return pattern && 
           typeof pattern.id === 'string' &&
           typeof pattern.agentId === 'string' &&
           typeof pattern.category === 'string' &&
           typeof pattern.responseTemplate === 'string';
  }
}