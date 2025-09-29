/**
 * AGENT CONTEXT INTELLIGENCE - PHASE 4.5
 * Gives agents the ability to distinguish between conversation and workflow execution modes
 * Integrates with personalities to provide natural context switching
 */

export interface ContextDecision {
  mode: 'conversation' | 'workflow_execution' | 'clarification_needed';
  confidence: number;
  reasoning: string;
  personalityResponse?: string;
  workflowTriggers?: string[];
  nextAction: string;
}

export class AgentContextIntelligence {
  private static instance: AgentContextIntelligence;
  
  private constructor() {
    console.log('🧠 PHASE 4.5: Agent Context Intelligence initializing...');
    console.log('🎭 CONNECTED: Personality Integration + Context Switching + Autonomous Decision Making');
  }

  public static getInstance(): AgentContextIntelligence {
    if (!AgentContextIntelligence.instance) {
      AgentContextIntelligence.instance = new AgentContextIntelligence();
    }
    return AgentContextIntelligence.instance;
  }

  /**
   * MAIN INTELLIGENCE: Determine how agent should respond to user input
   */
  analyzeUserInput(userInput: string, agentId: string, conversationContext?: any): ContextDecision {
    const input = userInput.toLowerCase().trim();
    
    // 1. WORKFLOW EXECUTION SIGNALS
    const workflowTriggers = [
      'execute', 'implement', 'build', 'create', 'deploy', 'setup', 'configure',
      'fix this', 'add this', 'update this', 'make this', 'coordinate',
      'please do', 'go ahead and', 'start working on', 'can you implement'
    ];
    
    // 2. CONVERSATION SIGNALS  
    const conversationTriggers = [
      'what do you think', 'how are you', 'explain to me', 'tell me about',
      'what is your opinion', 'how does this work', 'why', 'what would you',
      'i need advice', 'thoughts on', 'help me understand', 'what are your'
    ];
    
    // 3. QUESTION PATTERNS
    const isQuestion = input.includes('?') || 
                      input.startsWith('what') || 
                      input.startsWith('how') || 
                      input.startsWith('why') ||
                      input.startsWith('when') ||
                      input.startsWith('where') ||
                      input.startsWith('can you explain') ||
                      input.startsWith('tell me');
    
    // 4. ACTION INDICATORS
    const hasActionWords = ['please', 'go ahead', 'do this', 'start', 'begin', 'now'].some(word => input.includes(word));
    const hasUrgencyWords = ['urgent', 'asap', 'immediately', 'quickly', 'right now'].some(word => input.includes(word));
    
    // 5. ANALYZE PATTERNS
    const workflowScore = workflowTriggers.filter(trigger => input.includes(trigger)).length;
    const conversationScore = conversationTriggers.filter(trigger => input.includes(trigger)).length;
    
    // 6. DECISION LOGIC
    let mode: 'conversation' | 'workflow_execution' | 'clarification_needed';
    let confidence: number;
    let reasoning: string;
    let nextAction: string;
    
    if (workflowScore > 0 && hasActionWords && !isQuestion) {
      // Clear execution request
      mode = 'workflow_execution';
      confidence = Math.min(0.9, 0.6 + (workflowScore * 0.1) + (hasUrgencyWords ? 0.2 : 0));
      reasoning = `Detected ${workflowScore} workflow triggers with action words. User wants task execution.`;
      nextAction = 'Start autonomous workflow execution with agent coordination';
      
    } else if (isQuestion && conversationScore > 0) {
      // Clear conversation request
      mode = 'conversation';
      confidence = Math.min(0.9, 0.7 + (conversationScore * 0.1));
      reasoning = `Question format with ${conversationScore} conversation signals. User wants discussion.`;
      nextAction = 'Engage in personality-driven conversation';
      
    } else if (workflowScore > 0 && isQuestion) {
      // Mixed signals - asking about implementation
      mode = 'clarification_needed';
      confidence = 0.6;
      reasoning = 'Mixed signals: workflow triggers with question format. Need clarification.';
      nextAction = 'Ask user to clarify if they want explanation or implementation';
      
    } else if (input.length < 10 && !isQuestion) {
      // Short commands might be execution
      mode = 'workflow_execution';
      confidence = 0.5;
      reasoning = 'Short command-like input. Assuming execution intent.';
      nextAction = 'Proceed with cautious execution or ask for details';
      
    } else {
      // Default to conversation for safety
      mode = 'conversation';
      confidence = 0.7;
      reasoning = 'No clear execution signals. Defaulting to conversation mode.';
      nextAction = 'Respond with personality and offer to help';
    }

    return {
      mode,
      confidence,
      reasoning,
      workflowTriggers: workflowScore > 0 ? workflowTriggers.filter(t => input.includes(t)) : undefined,
      nextAction
    };
  }

  /**
   * PERSONALITY INTEGRATION: Get agent's natural response based on their personality
   */
  getPersonalityResponse(agentId: string, mode: string, userInput: string): string {
    // Agent-specific personality responses
    const personalityResponses: { [key: string]: any } = {
      elena: {
        conversation: [
          "Hey! I'm here and ready to help with whatever you need. What's on your mind?",
          "Absolutely! I love coordinating and making things happen. What are we working on?",
          "I'm all ears! Whether it's strategy, execution, or just bouncing ideas around."
        ],
        workflow_execution: [
          "Got it! I'm mobilizing the team now.",
          "On it! Coordinating agents for execution.",
          "Perfect - I'll handle the coordination and get this done."
        ],
        clarification: [
          "I want to make sure I understand - are you looking for my thoughts on this, or do you want me to coordinate the team to implement it?"
        ]
      },
      maya: {
        conversation: [
          "Girl, I'm so excited to chat! What's happening in your world?",
          "I'm obsessed with helping you figure this out! Tell me everything.",
          "You know I'm always here for the fashion and business talk!"
        ],
        workflow_execution: [
          "This is going to be so good! I'm on it right now.",
          "I'm literally getting chills thinking about how amazing this will be!",
          "Girl, yes! I'm making this happen for you."
        ],
        clarification: [
          "Okay but hear me out - do you want me to create this for you, or are we just talking through ideas first?"
        ]
      },
      zara: {
        conversation: [
          "Hey! I'm here and caffeinated. What technical challenge are we tackling?",
          "Love it! I'm ready to dive deep into whatever architecture you're thinking about.",
          "I'm spinning in my desk chair and ready to code. What's up?"
        ],
        workflow_execution: [
          "Sweet! I'm firing up my development environment now.",
          "Perfect - I'll architect this solution and get it built.",
          "On it! Time to make some code magic happen."
        ],
        clarification: [
          "Just to be clear - are you looking for my technical thoughts on this approach, or do you want me to start building it?"
        ]
      }
    };

    const responses = personalityResponses[agentId] || personalityResponses['elena'];
    const modeResponses = responses[mode] || responses['conversation'];
    
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  }

  /**
   * CONTEXT SWITCHING INTELLIGENCE: Help agents know when to switch modes during conversation
   */
  detectModeSwitch(previousMode: string, currentInput: string, agentId: string): {
    shouldSwitch: boolean;
    newMode: string;
    confidence: number;
    switchReason: string;
  } {
    const analysis = this.analyzeUserInput(currentInput, agentId);
    
    const shouldSwitch = previousMode !== analysis.mode && analysis.confidence > 0.7;
    
    return {
      shouldSwitch,
      newMode: analysis.mode,
      confidence: analysis.confidence,
      switchReason: shouldSwitch ? 
        `User shifted from ${previousMode} to ${analysis.mode}: ${analysis.reasoning}` :
        'No mode switch needed'
    };
  }

  /**
   * SMART WORKFLOW EXECUTION: Determine if user really wants execution
   */
  confirmExecutionIntent(userInput: string, agentId: string): {
    shouldExecute: boolean;
    confidence: number;
    confirmationNeeded: boolean;
    suggestedConfirmation?: string;
  } {
    const analysis = this.analyzeUserInput(userInput, agentId);
    
    if (analysis.mode === 'workflow_execution' && analysis.confidence > 0.8) {
      return {
        shouldExecute: true,
        confidence: analysis.confidence,
        confirmationNeeded: false
      };
    }
    
    if (analysis.mode === 'workflow_execution' && analysis.confidence > 0.6) {
      return {
        shouldExecute: false,
        confidence: analysis.confidence,
        confirmationNeeded: true,
        suggestedConfirmation: `I can ${analysis.workflowTriggers?.join(' and ')} for you. Should I go ahead and start the execution?`
      };
    }
    
    return {
      shouldExecute: false,
      confidence: analysis.confidence,
      confirmationNeeded: false
    };
  }
}

// Export singleton instance
export const agentContextIntelligence = AgentContextIntelligence.getInstance();