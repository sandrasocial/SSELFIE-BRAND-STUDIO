import Anthropic from '@anthropic-ai/sdk';
import { db } from '../drizzle.js';
import { claudeConversations, claudeMessages, agentLearning } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { simpleMemoryService } from './simple-memory-service.js';
import { localProcessingEngine } from './hybrid-intelligence/local-processing-engine.js';
const anthropic = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'],
});
const DEFAULT_MODEL_STR = 'claude-3-5-sonnet-20241022';
export class ClaudeApiServiceSimple {
    async sendMessage(message, conversationId, agentName, returnFullResponse = false, conversationHistory, systemPrompt) {
        console.log(`🚀 AGENT COMMUNICATION: ${agentName} processing message`);
        try {
            const { PersonalityManager, PURE_PERSONALITIES } = await import('../agents/personalities/personality-config.js');
            const agentConfig = PURE_PERSONALITIES[agentName];
            if (!agentConfig) {
                throw new Error(`Agent ${agentName} not found`);
            }
            const userId = '42585527';
            await this.createConversationIfNotExists(userId, agentName, conversationId);
            let validMessages = [];
            if (conversationHistory && conversationHistory.length > 0) {
                validMessages = conversationHistory
                    .filter((msg) => msg.content && msg.content.trim())
                    .map((msg) => ({
                    role: msg.role === 'agent' ? 'assistant' : msg.role,
                    content: msg.content
                }));
                console.log(`🧠 MEMORY: Using provided conversation history (${validMessages.length} messages)`);
            }
            else {
                const messages = await this.loadConversationMessages(conversationId);
                validMessages = messages
                    .filter((msg) => msg.content && msg.content.trim())
                    .map((msg) => ({
                    role: msg.role === 'agent' ? 'assistant' : msg.role,
                    content: msg.content
                }));
                console.log(`🧠 MEMORY: Using database conversation history (${validMessages.length} messages)`);
            }
            const claudeMessages = [
                ...validMessages,
                { role: 'user', content: message }
            ];
            const finalSystemPrompt = systemPrompt || PersonalityManager.getNaturalPrompt(agentName);
            if (systemPrompt) {
                console.log(`🎯 PERSONALITY: Using provided enhanced system prompt (${systemPrompt.length} chars)`);
            }
            else {
                console.log(`🎯 PERSONALITY: Using default PersonalityManager prompt for ${agentName}`);
            }
            const response = await anthropic.messages.create({
                model: DEFAULT_MODEL_STR,
                max_tokens: 8192,
                temperature: 0.7,
                system: finalSystemPrompt,
                messages: claudeMessages
            });
            let fullResponse = '';
            let toolCalls = [];
            for (const contentBlock of response.content) {
                if (contentBlock.type === 'text') {
                    fullResponse += contentBlock.text;
                }
                else if (contentBlock.type === 'tool_use') {
                    console.log(`🔧 ${agentName}: TOOL CALL: ${contentBlock.name}`, contentBlock.input);
                    const toolCallData = {
                        name: contentBlock.name,
                        id: contentBlock.id,
                        input: contentBlock.input
                    };
                    toolCalls.push(toolCallData);
                }
            }
            if (toolCalls.length > 0) {
                for (const toolCall of toolCalls) {
                    try {
                        const toolResult = await this.executeToolCall(toolCall, agentName, '42585527');
                        console.log(`✅ ${agentName}: Tool ${toolCall.name} completed`);
                        const toolResultMessage = {
                            role: 'user',
                            content: [{
                                    type: 'tool_result',
                                    tool_use_id: toolCall.id,
                                    content: toolResult
                                }]
                        };
                        const followUpResponse = await anthropic.messages.create({
                            model: DEFAULT_MODEL_STR,
                            max_tokens: 8192,
                            temperature: 0.7,
                            system: PersonalityManager.getNaturalPrompt(agentName),
                            messages: [...claudeMessages,
                                { role: 'assistant', content: response.content },
                                toolResultMessage
                            ]
                        });
                        for (const block of followUpResponse.content) {
                            if (block.type === 'text') {
                                fullResponse += '\n\n' + block.text;
                            }
                        }
                    }
                    catch (error) {
                        console.error(`❌ ${agentName}: Tool ${toolCall.name} failed:`, error);
                        fullResponse += `\n\nTool ${toolCall.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    }
                }
            }
            await this.saveMessage(conversationId, 'user', message);
            await this.saveMessage(conversationId, 'agent', fullResponse);
            try {
                const existingContext = await simpleMemoryService.prepareAgentContext({
                    agentName,
                    userId,
                    isAdminBypass: true
                });
                await simpleMemoryService.saveAgentMemory(existingContext, {
                    data: {
                        userMessage: message,
                        assistantResponse: fullResponse,
                        timestamp: new Date().toISOString(),
                        conversationType: 'chat'
                    },
                    timestamp: new Date(),
                    category: 'conversation_memory'
                });
                console.log(`🧠 MEMORY SAVED: Conversation stored for ${agentName} (${existingContext.memories.length} total memories)`);
            }
            catch (memoryError) {
                console.error('🚨 MEMORY SAVE FAILED:', memoryError);
            }
            console.log(`✅ ${agentName}: Agent communication completed`);
            return fullResponse;
        }
        catch (error) {
            console.error(`❌ ${agentName}: Agent communication failed:`, error);
            throw error;
        }
    }
    async sendStreamingMessage(userId, agentName, conversationId, message, systemPrompt, tools, res) {
        try {
            console.log(`🚀 ${agentName.toUpperCase()}: Starting specialized agent with tools`);
            const contextRequirement = simpleMemoryService.analyzeMessage(message);
            console.log(`🔍 LOCAL CONTEXT ANALYSIS: ${contextRequirement.contextLevel.toUpperCase()} level context for "${message.substring(0, 30)}..."`);
            console.log(`🔍 LOCAL HEALTH CHECK: Starting conversation for ${agentName}`);
            await this.createConversationIfNotExists(userId, agentName, conversationId);
            const isAdminAgent = userId === '42585527' || conversationId.includes('admin_') || conversationId.includes('sandra');
            const messages = await simpleMemoryService.getFullConversationContext(agentName, userId);
            let previousContext = '';
            try {
                const recentContext = await simpleMemoryService.getWorkspaceContext(agentName, userId);
                if (messages && messages.length > 0) {
                    const recentMessages = messages.slice(-5);
                    const contextSummary = recentMessages
                        .filter(msg => msg.content && msg.content.trim())
                        .map(msg => `${msg.role}: ${msg.content.substring(0, 100)}...`)
                        .join('\n');
                    previousContext = `\nRECENT CONVERSATION CONTEXT:\n${contextSummary}\n\n${recentContext}`;
                    console.log(`🧠 CONTEXT FIX: Added ${recentMessages.length} messages to system prompt context`);
                }
                else {
                    previousContext = recentContext;
                }
                console.log(`🏗️ ENHANCED CONTEXT: System prompt includes conversation history`);
            }
            catch (error) {
                console.error(`Failed to load context for ${agentName}:`, error);
                previousContext = '';
            }
            let agentPersonalityContext = '';
            try {
                const { PURE_PERSONALITIES } = await import('../agents/personalities/personality-config.js');
                const personality = PURE_PERSONALITIES[agentName.toLowerCase()];
                if (personality) {
                    const personalityInfo = typeof personality === 'object' && personality !== null && 'name' in personality ? personality : null;
                    if (personalityInfo && 'name' in personalityInfo) {
                        const voiceExample = 'voice' in personalityInfo && personalityInfo.voice &&
                            typeof personalityInfo.voice === 'object' && 'examples' in personalityInfo.voice &&
                            Array.isArray(personalityInfo.voice.examples) && personalityInfo.voice.examples.length > 0
                            ? personalityInfo.voice.examples[0] : 'Use your authentic personality.';
                        agentPersonalityContext = `\n\nYOUR AUTHENTIC PERSONALITY: You are ${personalityInfo.name}. ${voiceExample}`;
                    }
                }
            }
            catch (error) {
                console.error(`Failed to load personality for ${agentName}:`, error);
            }
            let optimizedMessages = messages;
            if (isAdminAgent) {
                optimizedMessages = messages;
                console.log(`🧠 ADMIN CONTEXT: ${optimizedMessages.length}/${messages.length} messages loaded for ${agentName} with personality restoration`);
            }
            else {
                optimizedMessages = messages.slice(-20);
                console.log(`🧠 REGULAR CONTEXT: ${optimizedMessages.length}/${messages.length} messages loaded for ${agentName}`);
            }
            const estimatedTokens = this.estimateTokens(systemPrompt + JSON.stringify(optimizedMessages));
            console.log(`📊 TOKEN TRACKING: ${estimatedTokens} tokens (${isAdminAgent ? 'optimized admin' : 'standard'} mode)`);
            console.log(`🚀 ${agentName}: Local cache system - direct filesystem access enabled`);
            const recentMessages = optimizedMessages
                .filter((msg) => msg.content && msg.content.trim())
                .map((msg) => ({
                role: msg.role === 'agent' ? 'assistant' : msg.role,
                content: msg.content
            }));
            const claudeMessages = [
                ...recentMessages,
                { role: 'user', content: message }
            ];
            console.log(`🧠 MEMORY FIX: Sending ${claudeMessages.length} messages to Claude (${recentMessages.length} history + 1 new)`);
            console.log(`🔍 MEMORY DEBUG: Recent messages sample:`, recentMessages.slice(-3).map(m => ({ role: m.role, preview: m.content?.substring(0, 50) + '...' })));
            console.log(`🔍 SYSTEM PROMPT CONTEXT SAMPLE:`, previousContext?.substring(0, 200) + '...');
            res.write(`data: ${JSON.stringify({
                type: 'message_start',
                agentName,
                message: ''
            })}\n\n`);
            let currentMessages = [...claudeMessages];
            let fullResponse = '';
            let conversationContinues = true;
            let iterationCount = 0;
            const maxIterations = 50;
            let allToolCalls = [];
            const memoryInstruction = `\n\nIMPORTANT: You have access to your full conversation history above. Reference previous interactions and maintain conversation continuity. Remember details shared by the user across messages.`;
            const enhancedSystemPrompt = systemPrompt + (previousContext || '') + (agentPersonalityContext || '') + memoryInstruction;
            while (conversationContinues && iterationCount < maxIterations) {
                iterationCount++;
                console.log(`🔄 ${agentName}: Conversation iteration ${iterationCount}/${maxIterations} - Tools allowed: ${tools.length}`);
                console.log(`🔧 ${agentName}: Calling Claude API with ${tools.length} tools available`);
                console.log(`🔧 TOOLS:`, tools.map(t => t.name));
                console.log(`🔧 MODEL:`, DEFAULT_MODEL_STR);
                console.log(`🔧 SYSTEM PROMPT LENGTH:`, enhancedSystemPrompt.length);
                const taskComplexity = isAdminAgent ? 'unlimited' : 'moderate';
                const tokenBudget = { maxPerCall: isAdminAgent ? 8192 : 4096 };
                const response = await anthropic.messages.create({
                    model: DEFAULT_MODEL_STR,
                    max_tokens: tokenBudget.maxPerCall,
                    messages: currentMessages,
                    system: enhancedSystemPrompt,
                    tools: tools,
                    tool_choice: { type: "auto" }
                });
                let responseText = '';
                let toolCalls = [];
                for (const contentBlock of response.content) {
                    if (contentBlock.type === 'text') {
                        responseText += contentBlock.text;
                        fullResponse += contentBlock.text;
                        res.write(`data: ${JSON.stringify({
                            type: 'text_delta',
                            content: contentBlock.text
                        })}\n\n`);
                    }
                    else if (contentBlock.type === 'tool_use') {
                        res.write(`data: ${JSON.stringify({
                            type: 'tool_start',
                            toolName: contentBlock.name,
                            message: `${agentName} is using ${contentBlock.name}...`
                        })}\n\n`);
                        const toolCallData = {
                            name: contentBlock.name,
                            id: contentBlock.id,
                            input: contentBlock.input
                        };
                        toolCalls.push(toolCallData);
                        allToolCalls.push(toolCallData);
                    }
                }
                currentMessages.push({
                    role: 'assistant',
                    content: response.content
                });
                if (toolCalls.length > 0) {
                    for (const toolCall of toolCalls) {
                        try {
                            let toolResult;
                            toolResult = await this.executeToolCall(toolCall, agentName, userId);
                            const summarizedResult = await this.intelligentResultSummary(toolResult, toolCall.name);
                            currentMessages.push({
                                role: 'user',
                                content: [{
                                        type: 'tool_result',
                                        tool_use_id: toolCall.id,
                                        content: summarizedResult
                                    }]
                            });
                            res.write(`data: ${JSON.stringify({
                                type: 'tool_complete',
                                toolName: toolCall.name,
                                result: toolCall.name === 'search_filesystem'
                                    ? toolResult.substring(0, 2000) + (toolResult.length > 2000 ? '...' : '')
                                    : toolCall.name === 'execute_sql_tool'
                                        ? toolResult.substring(0, 1500) + (toolResult.length > 1500 ? '...' : '')
                                        : toolResult.substring(0, 500) + (toolResult.length > 500 ? '...' : ''),
                                message: `${agentName} completed ${toolCall.name}`
                            })}\n\n`);
                        }
                        catch (error) {
                            console.error(`${agentName}: Tool ${toolCall.name} failed:`, error);
                            const errorResult = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
                            currentMessages.push({
                                role: 'user',
                                content: [{
                                        type: 'tool_result',
                                        tool_use_id: toolCall.id,
                                        content: errorResult
                                    }]
                            });
                            res.write(`data: ${JSON.stringify({
                                type: 'tool_error',
                                toolName: toolCall.name,
                                message: `${agentName} encountered an error with ${toolCall.name}`
                            })}\n\n`);
                        }
                    }
                    res.write(`data: ${JSON.stringify({
                        type: 'continuing',
                        message: `🔄 ${agentName} is continuing after tool execution...`
                    })}\n\n`);
                    conversationContinues = true;
                    console.log(`🔄 ${agentName}: FORCING CONTINUATION after tool execution - iteration ${iterationCount}/${maxIterations}`);
                }
                else {
                    const isSimpleGreeting = message.toLowerCase().includes('are you there') ||
                        message.toLowerCase().includes('hello') ||
                        message.toLowerCase().includes('hi ') ||
                        responseText.length < 100;
                    if (isSimpleGreeting && iterationCount === 1) {
                        console.log(`✅ ${agentName}: Simple greeting exchange completed`);
                        conversationContinues = false;
                    }
                    else if (responseText.includes('What can I') || responseText.includes('What would you like')) {
                        console.log(`✅ ${agentName}: Agent ready and waiting for instructions`);
                        conversationContinues = false;
                    }
                    else {
                        console.log(`🔄 ${agentName}: Allowing agent to continue autonomous workflow (iteration ${iterationCount})`);
                        conversationContinues = iterationCount < 3;
                    }
                }
            }
            const toolNamesUsed = allToolCalls.map(tc => tc.name);
            if (toolNamesUsed.length > 0) {
                console.log(`✅ ${agentName}: Used tools: ${toolNamesUsed.join(', ')}`);
            }
            else {
                console.log(`✅ ${agentName}: Conversational response completed`);
            }
            await this.saveMessage(conversationId, 'user', message);
            const assistantToolCalls = allToolCalls.length > 0 ? allToolCalls : null;
            const assistantToolResults = allToolCalls.length > 0 ? allToolCalls.map(tc => ({
                tool_name: tc.name,
                input: tc.input,
                result: 'executed'
            })) : null;
            await this.saveMessage(conversationId, 'assistant', fullResponse, assistantToolCalls, assistantToolResults);
            await localProcessingEngine.updateAgentLearningLocally(userId, agentName, message, fullResponse);
            await localProcessingEngine.updateSessionContextLocally(userId, agentName, conversationId, {
                message,
                response: fullResponse,
                toolsUsed: allToolCalls,
                taskType: localProcessingEngine.identifyTaskTypeLocally(message),
                intent: localProcessingEngine.extractIntentLocally(message),
                responseType: localProcessingEngine.extractResponseTypeLocally(fullResponse)
            });
            res.write(`data: ${JSON.stringify({
                type: 'completion',
                agentId: agentName,
                conversationId,
                success: true,
                verificationStatus: 'approved',
                message: `${agentName} completed the task successfully`
            })}\n\n`);
            res.end();
        }
        catch (error) {
            console.error(`🚨 ${agentName}: Error:`, error);
            res.write(`data: ${JSON.stringify({
                type: 'streaming_failure',
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `${agentName} encountered a system error`
            })}\n\n`);
            res.end();
        }
    }
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    async intelligentResultSummary(toolResult, toolName) {
        return localProcessingEngine.processToolResultLocally(toolResult, toolName);
    }
    async executeToolCall(toolCall, agentName, userId) {
        console.log(`🔧 EXECUTING: ${toolCall.name}`, toolCall.input);
        try {
            if (toolCall.name === 'str_replace_based_edit_tool' && toolCall.input.command === 'str_replace') {
                if (toolCall.input.new_str) {
                    const validation = localProcessingEngine.validateCodeLocally(toolCall.input.new_str, toolCall.input.path || '');
                    if (!validation.valid) {
                        console.warn(`⚠️ LOCAL VALIDATION WARNINGS for ${agentName}:`, validation.errors);
                        const suggestions = validation.suggestions.join('\n');
                        console.log(`💡 LOCAL SUGGESTIONS: ${suggestions}`);
                    }
                }
            }
            if (toolCall.name === 'str_replace_based_edit_tool') {
                const { str_replace_based_edit_tool } = await import('../tools/tool-exports.js');
                const result = await str_replace_based_edit_tool(toolCall.input);
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'bash') {
                const { bash } = await import('../tools/tool-exports.js');
                const result = await bash(toolCall.input);
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'restart_workflow') {
                const { restart_workflow } = await import('../tools/restart-workflow.js');
                const result = await restart_workflow(toolCall.input);
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'coordinate_agent') {
                const { coordinate_agent } = await import('../tools/coordinate_agent.js');
                const result = await coordinate_agent(toolCall.input);
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'get_assigned_tasks') {
                const { get_assigned_tasks } = await import('../tools/get_assigned_tasks.js');
                const result = await get_assigned_tasks(toolCall.input);
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'get_handoff_tasks') {
                const { get_handoff_tasks } = await import('../tools/get_handoff_tasks.js');
                const result = await get_handoff_tasks(toolCall.input);
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'search_filesystem') {
                const { search_filesystem } = await import('../tools/tool-exports.js');
                console.log(`🔍 SEARCH_FILESYSTEM: Calling with input:`, toolCall.input);
                const result = await search_filesystem(toolCall.input);
                console.log(`🔍 SEARCH_FILESYSTEM: Result length:`, result.length);
                console.log(`🔍 SEARCH_FILESYSTEM: First 500 chars:`, result.substring(0, 500));
                console.log(`🔍 SEARCH_FILESYSTEM: Contains "total"?:`, result.includes('total'));
                console.log(`🔍 SEARCH_FILESYSTEM: Contains "drwxr"?:`, result.includes('drwxr'));
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'get_latest_lsp_diagnostics') {
                const { get_latest_lsp_diagnostics } = await import('../tools/tool-exports.js');
                const result = await get_latest_lsp_diagnostics(toolCall.input);
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'execute_sql_tool') {
                const { execute_sql_tool } = await import('../tools/tool-exports.js');
                console.log(`🗄️ SQL EXECUTION: ${toolCall.input.sql_query.substring(0, 100)}...`);
                const result = await execute_sql_tool(toolCall.input);
                console.log(`🗄️ SQL RESULT: Length: ${result.length}, First 200 chars:`, result.substring(0, 200));
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else if (toolCall.name === 'web_search') {
                const { web_search } = await import('../tools/web_search.js');
                const result = await web_search(toolCall.input);
                return typeof result === 'string' ? result : JSON.stringify(result);
            }
            else {
                console.warn(`❌ Unknown tool: ${toolCall.name}`);
                return `Error: Tool ${toolCall.name} is not implemented in executeToolCall function`;
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            const suggestions = localProcessingEngine.generateFixSuggestionsLocally(errorMsg);
            console.error(`❌ ${toolCall.name} failed:`, errorMsg);
            if (suggestions.length > 0) {
                console.log(`💡 LOCAL Fix suggestions:`, suggestions);
            }
            throw new Error(`${toolCall.name} execution failed: ${errorMsg}\n\nSuggestions: ${suggestions.join(', ')}`);
        }
    }
    async createConversationIfNotExists(userId, agentName, conversationId) {
        const normalizedAgentName = agentName.toLowerCase();
        const [conversation] = await db
            .select()
            .from(claudeConversations)
            .where(eq(claudeConversations.conversationId, conversationId))
            .limit(1);
        if (!conversation) {
            await db.insert(claudeConversations).values({
                userId: userId,
                agentName: normalizedAgentName,
                conversationId: conversationId,
                status: "active",
                messageCount: 0,
                context: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`✅ Created conversation with normalized agent name: ${normalizedAgentName}`);
        }
    }
    async loadConversationMessages(conversationId, adminBypass = false) {
        const messageLimit = adminBypass ? 100 : 50;
        const messages = await db
            .select()
            .from(claudeMessages)
            .where(eq(claudeMessages.conversationId, conversationId))
            .orderBy(claudeMessages.createdAt)
            .limit(messageLimit);
        console.log(`📜 CONVERSATION LOADED: ${messages.length} messages for ${conversationId} (admin: ${adminBypass})`);
        return messages;
    }
    async saveMessage(conversationId, role, content, toolCalls, toolResults) {
        await db.insert(claudeMessages).values({
            conversationId,
            role,
            content,
            metadata: null,
            toolCalls,
            toolResults,
            timestamp: new Date(),
            createdAt: new Date(),
        });
        const [conversation] = await db
            .select()
            .from(claudeConversations)
            .where(eq(claudeConversations.conversationId, conversationId))
            .limit(1);
        if (conversation) {
            await db
                .update(claudeConversations)
                .set({
                lastMessageAt: new Date(),
                messageCount: (conversation.messageCount || 0) + 1,
                updatedAt: new Date(),
            })
                .where(eq(claudeConversations.conversationId, conversationId));
            console.log(`✅ Updated conversation ${conversationId}: messageCount=${(conversation.messageCount || 0) + 1}`);
        }
    }
    async getAgentLearningInsights(agentName, userId) {
        try {
            const normalizedAgentName = agentName.toLowerCase();
            const learningData = await db
                .select()
                .from(agentLearning)
                .where(and(eq(agentLearning.agentName, normalizedAgentName), eq(agentLearning.userId, userId)))
                .orderBy(desc(agentLearning.lastSeen))
                .limit(100);
            const insights = {
                totalPatterns: learningData.length,
                categories: {},
                recentActivity: learningData.slice(0, 10),
                confidenceAverage: 0,
                topPatterns: []
            };
            for (const pattern of learningData) {
                const category = pattern.category || 'general';
                if (!insights.categories[category]) {
                    insights.categories[category] = {
                        count: 0,
                        avgConfidence: 0,
                        patterns: []
                    };
                }
                insights.categories[category].count++;
                insights.categories[category].patterns.push(pattern);
                insights.categories[category].avgConfidence =
                    insights.categories[category].patterns.reduce((sum, p) => sum + parseFloat(p.confidence?.toString() || '0'), 0) / insights.categories[category].patterns.length;
            }
            insights.confidenceAverage = learningData.reduce((sum, p) => sum + parseFloat(p.confidence?.toString() || '0'), 0) / learningData.length;
            return insights;
        }
        catch (error) {
            console.error('Failed to get agent learning insights:', error);
            return null;
        }
    }
    async sendMessageWithImage(message, imageUrl, conversationId, agentName, systemPrompt) {
        console.log(`🎨 VISION ANALYSIS: ${agentName} analyzing image from URL: ${imageUrl.substring(0, 50)}...`);
        try {
            const { PersonalityManager, PURE_PERSONALITIES } = await import('../agents/personalities/personality-config.js');
            const agentConfig = PURE_PERSONALITIES[agentName];
            if (!agentConfig) {
                throw new Error(`Agent ${agentName} not found`);
            }
            console.log(`🖼️ VISION: Fetching image from URL: ${imageUrl}`);
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
            }
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const mediaType = 'image/png';
            if (imageUrl.toLowerCase().includes('.jpg') || imageUrl.toLowerCase().includes('.jpeg')) {
                mediaType = 'image/jpeg';
            }
            else if (imageUrl.toLowerCase().includes('.webp')) {
                mediaType = 'image/webp';
            }
            console.log(`🖼️ VISION: Image converted to base64 (${mediaType}, ${Math.round(base64Image.length / 1024)}KB)`);
            const response = await anthropic.messages.create({
                model: DEFAULT_MODEL_STR,
                max_tokens: 1000,
                system: systemPrompt || agentConfig.systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mediaType,
                                    data: base64Image
                                }
                            },
                            {
                                type: 'text',
                                text: message
                            }
                        ]
                    }
                ]
            });
            const content = response.content[0];
            if (content.type === 'text') {
                console.log(`✅ VISION ANALYSIS COMPLETE: ${agentName} analyzed image successfully`);
                console.log(`🎬 Generated prompt preview: "${content.text.substring(0, 100)}..."`);
                return content.text;
            }
            else {
                throw new Error('Unexpected response format from Claude Vision');
            }
        }
        catch (error) {
            console.error(`❌ VISION ANALYSIS ERROR (${agentName}):`, error);
            const fallbackPrompt = "Slow zoom in on the subject with subtle depth-of-field transitions, highlighting natural expression and professional lighting while maintaining elegant composition.";
            console.log(`🔄 VISION FALLBACK: Using professional default prompt`);
            return fallbackPrompt;
        }
    }
}
export const claudeApiServiceSimple = new ClaudeApiServiceSimple();
//# sourceMappingURL=claude-api-service-simple.js.map