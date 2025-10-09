/**
 * AI Agent Service
 *
 * Handles intelligent command processing using Claude LLM for natural language understanding
 * and integrates with various services including High Level CRM for contact management.
 */
import Anthropic from '@anthropic-ai/sdk';
import { HighLevelService } from './highlevel-service.js';
export class AIAgentService {
    claudeApiKey;
    highLevelApiKey;
    highLevelService = null;
    claude;
    conversationState;
    constructor(claudeApiKey, highLevelApiKey) {
        this.claudeApiKey = claudeApiKey;
        this.highLevelApiKey = highLevelApiKey;
        // Initialize Claude API client
        this.claude = new Anthropic({
            apiKey: claudeApiKey,
        });
        // Initialize High Level service if API key is provided
        if (highLevelApiKey) {
            this.highLevelService = new HighLevelService(highLevelApiKey);
        }
        // Initialize conversation state
        this.conversationState = {
            step: 'idle',
            intent: '',
            data: {},
            timestamp: new Date()
        };
    }
    /**
     * Process and handle user commands using Claude LLM with multi-step conversation support
     * @param command - User command string in natural language
     * @returns Promise with command execution result
     */
    async handleCommand(command) {
        console.log('AIAgentService.handleCommand called with:', {
            command,
            currentState: this.conversationState.step
        });
        try {
            // Handle ongoing conversations
            if (this.conversationState.step !== 'idle') {
                return await this.handleConversationStep(command);
            }
            // Initial command analysis for new conversations
            const systemPrompt = `You are an AI assistant for SSELFIE Studio's command center. Your job is to understand user commands and determine their intent.

Currently supported intents:
- create_contact: When user wants to create a contact in High Level CRM
- create_funnel: When user wants to create a lead generation funnel in High Level

Analyze the user's command and respond with a JSON object containing:
{
  "intent": "create_contact" | "create_funnel" | "unknown",
  "confidence": number (0-1),
  "extracted_data": {
    // For create_contact:
    "email": "string",
    "name": "string",
    // For create_funnel:
    "topic": "string (optional)"
  },
  "reasoning": "brief explanation of your analysis"
}

Rules for create_contact:
- Only return "create_contact" if you can clearly extract both email and name
- Email must be valid format, name should be full name

Rules for create_funnel:
- Return "create_funnel" for requests about building/creating funnels, landing pages, lead generation
- Topic is optional in initial request
- Examples: "create a funnel", "build a landing page funnel", "make a lead gen funnel for my coaching business"

Examples:
- "Create a contact for john@email.com named John Doe" → create_contact
- "Build a funnel" → create_funnel  
- "Create a lead generation funnel for my fitness coaching" → create_funnel
- "Make a landing page funnel" → create_funnel
- "Hello there" → unknown

Return only valid JSON, no additional text.`;
            // Send command to Claude for intent analysis
            const response = await this.claude.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                temperature: 0.1,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: command.trim()
                    }
                ]
            });
            const claudeResponse = response.content[0];
            if (claudeResponse.type !== 'text') {
                throw new Error('Unexpected response format from Claude');
            }
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(claudeResponse.text);
            }
            catch (parseError) {
                console.error('Failed to parse Claude response as JSON:', claudeResponse.text);
                throw new Error('AI analysis failed - invalid response format');
            }
            console.log('Claude analysis result:', parsedResponse);
            // Handle create_contact intent (existing functionality)
            if (parsedResponse.intent === 'create_contact' && parsedResponse.confidence > 0.7) {
                return await this.handleContactCreation(parsedResponse);
            }
            // Handle create_funnel intent (new functionality)
            if (parsedResponse.intent === 'create_funnel' && parsedResponse.confidence > 0.7) {
                return await this.initiateFunnelCreation(parsedResponse, command);
            }
            // Handle unknown or low-confidence intents
            return {
                success: false,
                message: parsedResponse.confidence < 0.7
                    ? `I'm not confident I understood your request correctly. ${parsedResponse.reasoning}\n\nCurrently I can help you:\n• Create contacts in High Level CRM\n• Build lead generation funnels\n\nTry rephrasing your request or ask "What can you help me with?"`
                    : `I understood your message but I don't know how to handle that type of request yet.\n\nCurrently supported actions:\n• Create contacts in High Level CRM\n• Build lead generation funnels\n\nExamples:\n• "Create a contact for john@example.com named John Doe"\n• "Build a funnel for my coaching business"`,
                reasoning: parsedResponse.reasoning,
                confidence: parsedResponse.confidence,
                availableCommands: this.getAvailableCommands()
            };
        }
        catch (error) {
            console.error('AI Agent processing error:', error);
            return {
                success: false,
                message: 'I encountered an error while processing your command. This might be a temporary issue with my AI brain. Please try again or rephrase your request.',
                error: error instanceof Error ? error.message : 'Unknown AI processing error'
            };
        }
    }
    /**
     * Handle contact creation (extracted from main method)
     */
    async handleContactCreation(parsedResponse) {
        const { email, name } = parsedResponse.extracted_data;
        if (!email || !name) {
            return {
                success: false,
                message: 'I understood you want to create a contact, but I couldn\'t extract both the email and name clearly. Please provide both pieces of information.',
                reasoning: parsedResponse.reasoning
            };
        }
        if (!this.highLevelService) {
            return {
                success: false,
                message: 'High Level integration is not configured. Please check your API key.',
                error: 'HIGHLEVEL_API_KEY not provided'
            };
        }
        try {
            console.log('Processing High Level contact creation:', { email, name });
            const result = await this.highLevelService.createContact(email, name);
            return {
                success: true,
                message: `Successfully created contact "${name}" with email "${email}" in High Level CRM.`,
                data: result,
                reasoning: parsedResponse.reasoning
            };
        }
        catch (error) {
            console.error('Failed to create High Level contact:', error);
            return {
                success: false,
                message: 'I understood your request but failed to create the contact in High Level. Please try again.',
                error: error instanceof Error ? error.message : 'Unknown error',
                reasoning: parsedResponse.reasoning
            };
        }
    }
    /**
     * Initiate funnel creation workflow
     */
    async initiateFunnelCreation(parsedResponse, originalCommand) {
        const topic = parsedResponse.extracted_data?.topic;
        if (topic) {
            // User provided topic in initial command, proceed to copy generation
            this.conversationState = {
                step: 'awaiting_copy_approval',
                intent: 'create_funnel',
                data: { funnelTopic: topic, funnelName: `${topic} Lead Generation Funnel` },
                timestamp: new Date()
            };
            return await this.generateFunnelCopy(topic);
        }
        else {
            // Ask for funnel topic
            this.conversationState = {
                step: 'awaiting_funnel_topic',
                intent: 'create_funnel',
                data: {},
                timestamp: new Date()
            };
            return {
                success: true,
                message: 'Great! I\'ll help you create a lead generation funnel in High Level.\n\nWhat is the topic or purpose of your funnel? For example:\n• "Fitness coaching for busy professionals"\n• "Digital marketing course for small businesses"\n• "Real estate lead generation"\n\nPlease tell me what your funnel is for.',
                conversationState: 'awaiting_topic'
            };
        }
    }
    /**
     * Handle ongoing conversation steps
     */
    async handleConversationStep(command) {
        switch (this.conversationState.step) {
            case 'awaiting_funnel_topic':
                return await this.processFunnelTopic(command);
            case 'awaiting_copy_approval':
                return await this.processCopyApproval(command);
            default:
                // Reset state if in unknown step
                this.conversationState.step = 'idle';
                return {
                    success: false,
                    message: 'I seem to have lost track of our conversation. Please start over with your request.'
                };
        }
    }
    /**
     * Process funnel topic from user
     */
    async processFunnelTopic(topic) {
        this.conversationState.data.funnelTopic = topic.trim();
        this.conversationState.data.funnelName = `${topic.trim()} Lead Generation Funnel`;
        this.conversationState.step = 'awaiting_copy_approval';
        return await this.generateFunnelCopy(topic.trim());
    }
    /**
     * Generate landing page and thank you page copy using Claude
     */
    async generateFunnelCopy(topic) {
        try {
            const copyPrompt = `You are a professional copywriter creating high-converting funnel copy for SSELFIE Studio clients.

Create compelling copy for a lead generation funnel about: "${topic}"

Generate two pieces of copy:

1. LANDING PAGE COPY:
- Attention-grabbing headline
- Clear value proposition
- 3-4 key benefits
- Social proof element
- Strong call-to-action for email signup
- Professional, conversion-focused tone

2. THANK YOU PAGE COPY:
- Gratitude message
- What happens next
- Additional value/bonus offer
- Social media follow encouragement
- Professional tone maintaining excitement

Format your response as JSON:
{
  "landingPageCopy": "complete HTML-formatted landing page copy",
  "thankYouPageCopy": "complete HTML-formatted thank you page copy"
}

Make the copy compelling, professional, and optimized for conversions. Include HTML formatting for structure.`;
            const response = await this.claude.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                temperature: 0.3, // Slightly higher for creative copy
                messages: [
                    {
                        role: 'user',
                        content: copyPrompt
                    }
                ]
            });
            const claudeResponse = response.content[0];
            if (claudeResponse.type !== 'text') {
                throw new Error('Unexpected response format from Claude');
            }
            let generatedCopy;
            try {
                generatedCopy = JSON.parse(claudeResponse.text);
            }
            catch (parseError) {
                console.error('Failed to parse Claude copy response:', claudeResponse.text);
                throw new Error('Failed to generate copy - invalid response format');
            }
            // Store generated copy in conversation state
            this.conversationState.data.landingPageCopy = generatedCopy.landingPageCopy;
            this.conversationState.data.thankYouPageCopy = generatedCopy.thankYouPageCopy;
            return {
                success: true,
                message: `Perfect! I've generated compelling copy for your "${topic}" funnel.\n\n**LANDING PAGE COPY:**\n${generatedCopy.landingPageCopy}\n\n**THANK YOU PAGE COPY:**\n${generatedCopy.thankYouPageCopy}\n\n---\n\nAre you happy with this copy? Reply with "yes" to create the funnel, or "no" to regenerate different copy.`,
                conversationState: 'awaiting_approval',
                generatedCopy
            };
        }
        catch (error) {
            console.error('Failed to generate funnel copy:', error);
            this.conversationState.step = 'idle'; // Reset state
            return {
                success: false,
                message: 'I encountered an error while generating the funnel copy. Please try starting over with your funnel request.',
                error: error instanceof Error ? error.message : 'Copy generation failed'
            };
        }
    }
    /**
     * Process copy approval from user
     */
    async processCopyApproval(response) {
        const normalizedResponse = response.toLowerCase().trim();
        if (normalizedResponse.includes('yes') || normalizedResponse.includes('approve') || normalizedResponse.includes('good') || normalizedResponse.includes('perfect')) {
            // User approved, create the funnel
            return await this.createApprovedFunnel();
        }
        else if (normalizedResponse.includes('no') || normalizedResponse.includes('regenerate') || normalizedResponse.includes('different')) {
            // User wants different copy, regenerate
            const topic = this.conversationState.data.funnelTopic;
            return await this.generateFunnelCopy(topic);
        }
        else {
            // Unclear response, ask for clarification
            return {
                success: true,
                message: 'I\'m not sure if you\'re happy with the copy or not. Please respond with:\n• "Yes" if you\'re happy and want to create the funnel\n• "No" if you\'d like me to generate different copy',
                conversationState: 'awaiting_clear_approval'
            };
        }
    }
    /**
     * Create the funnel with approved copy
     */
    async createApprovedFunnel() {
        if (!this.highLevelService) {
            this.conversationState.step = 'idle'; // Reset state
            return {
                success: false,
                message: 'High Level integration is not configured. Please check your API key.',
                error: 'HIGHLEVEL_API_KEY not provided'
            };
        }
        try {
            this.conversationState.step = 'processing';
            const { funnelName, landingPageCopy, thankYouPageCopy } = this.conversationState.data;
            const result = await this.highLevelService.createFunnel(funnelName, landingPageCopy, thankYouPageCopy);
            // Reset conversation state
            this.conversationState.step = 'idle';
            this.conversationState.data = {};
            return {
                success: true,
                message: `🎉 Excellent! Your funnel "${funnelName}" has been successfully created in High Level!\n\n**Funnel Details:**\n• Funnel ID: ${result.funnelId}\n• Landing Page: ${result.data.landingPageUrl}\n• Thank You Page: ${result.data.thankYouPageUrl}\n• Status: ${result.data.status}\n\nYour funnel is now ready to start generating leads! You can customize it further in your High Level dashboard.`,
                data: result,
                funnelCreated: true
            };
        }
        catch (error) {
            console.error('Failed to create funnel:', error);
            this.conversationState.step = 'idle'; // Reset state
            return {
                success: false,
                message: 'I encountered an error while creating your funnel in High Level. Please try again or contact support.',
                error: error instanceof Error ? error.message : 'Funnel creation failed'
            };
        }
    }
    /**
     * Get available commands and their natural language examples
     */
    getAvailableCommands() {
        return [
            'Create a contact for john@example.com named John Doe',
            'Add sarah@company.com as Sarah Johnson to High Level',
            'Make a contact for user@domain.com with name User Name',
            'Build a funnel for my coaching business',
            'Create a lead generation funnel',
            'Make a landing page funnel for fitness training'
        ];
    }
    /**
     * Validate if Claude AI service is available
     */
    isClaudeConfigured() {
        return this.claude !== null && this.claudeApiKey !== '';
    }
    /**
     * Validate if High Level service is available
     */
    isHighLevelConfigured() {
        return this.highLevelService !== null;
    }
    /**
     * Get service status for debugging
     */
    getServiceStatus() {
        return {
            claude: this.isClaudeConfigured(),
            highLevel: this.isHighLevelConfigured(),
            capabilities: ['natural_language_processing', 'crm_contact_creation']
        };
    }
}
