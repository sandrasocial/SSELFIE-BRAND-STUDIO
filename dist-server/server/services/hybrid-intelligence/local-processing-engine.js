import { db } from '../../drizzle.js';
import { agentLearning, agentSessionContexts, agentKnowledgeBase, agentPerformanceMetrics } from '../../../shared/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
export class LocalProcessingEngine {
    static instance;
    learningCache = new Map();
    crossAgentPatterns = new Map();
    constructor() {
        console.log('🧠 PHASE 3: Cross-Agent Learning Engine initializing...');
        this.initializeCrossAgentLearning();
    }
    static getInstance() {
        if (!LocalProcessingEngine.instance) {
            LocalProcessingEngine.instance = new LocalProcessingEngine();
        }
        return LocalProcessingEngine.instance;
    }
    async initializeCrossAgentLearning() {
        try {
            const existingLearning = await db
                .select()
                .from(agentLearning)
                .orderBy(desc(agentLearning.confidence))
                .limit(100);
            for (const learning of existingLearning) {
                if (parseFloat(learning.confidence || '0') > 0.7) {
                    const cacheKey = `${learning.agentName}-${learning.category}`;
                    this.learningCache.set(cacheKey, learning);
                }
            }
            console.log(`🧠 PHASE 3: Loaded ${existingLearning.length} learning patterns for cross-agent sharing`);
            console.log(`🔥 PHASE 3: Cached ${this.learningCache.size} high-confidence patterns`);
        }
        catch (error) {
            console.error('⚠️ PHASE 3: Learning initialization error:', error);
        }
    }
    extractPatternsLocally(userMessage, assistantMessage) {
        const patterns = [];
        const userLower = userMessage.toLowerCase();
        const assistantLower = assistantMessage.toLowerCase();
        patterns.push({
            type: 'pattern',
            category: 'conversation',
            data: {
                userIntent: this.extractIntentLocally(userMessage),
                responseType: this.extractResponseTypeLocally(assistantMessage),
                interactionLength: userMessage.length + assistantMessage.length,
                timestamp: new Date().toISOString()
            }
        });
        if (assistantMessage.includes('✅') || assistantMessage.includes('completed') || assistantMessage.includes('success')) {
            patterns.push({
                type: 'task_completion',
                category: 'workflow',
                data: {
                    taskType: this.identifyTaskTypeLocally(userMessage),
                    completionIndicators: ['success', 'completed', 'finished'].filter(indicator => assistantLower.includes(indicator)),
                    responseLength: assistantMessage.length
                }
            });
        }
        if (assistantMessage.includes('str_replace_based_edit_tool') || assistantMessage.includes('bash')) {
            patterns.push({
                type: 'tool_usage',
                category: 'technical',
                data: {
                    toolsUsed: this.extractToolsUsedLocally(assistantMessage),
                    taskContext: userMessage.substring(0, 150),
                    success: assistantMessage.includes('✅') || assistantMessage.includes('successfully')
                }
            });
        }
        if (userLower.includes('please') || userLower.includes('can you') || userLower.includes('help')) {
            patterns.push({
                type: 'communication_style',
                category: 'user_interaction',
                data: {
                    politeRequest: true,
                    helpSeeking: true,
                    communicationTone: 'collaborative'
                }
            });
        }
        return patterns;
    }
    async saveLearningData(agentName, learningType, category, data) {
        try {
            console.log(`💾 SAVING LEARNING: ${agentName} - ${category}`);
            await db.insert(agentLearning).values({
                agentName,
                learningType,
                category,
                data: JSON.stringify(data),
                confidence: "0.8",
                frequency: 1,
                lastSeen: new Date()
            });
            console.log(`✅ LEARNING SAVED: ${agentName} pattern stored in database`);
        }
        catch (error) {
            console.error(`❌ LEARNING SAVE FAILED:`, error);
        }
    }
    extractIntentLocally(userMessage) {
        const message = userMessage.toLowerCase();
        if (message.includes('fix') || message.includes('error') || message.includes('bug')) {
            return 'debugging';
        }
        else if (message.includes('create') || message.includes('build') || message.includes('add')) {
            return 'creation';
        }
        else if (message.includes('update') || message.includes('modify') || message.includes('change')) {
            return 'modification';
        }
        else if (message.includes('help') || message.includes('how') || message.includes('what')) {
            return 'assistance';
        }
        else {
            return 'general';
        }
    }
    extractResponseTypeLocally(assistantMessage) {
        const message = assistantMessage.toLowerCase();
        if (message.includes('tool_calls') || message.includes('str_replace')) {
            return 'implementation';
        }
        else if (message.includes('explanation') || message.includes('analysis')) {
            return 'explanation';
        }
        else if (message.includes('✅') || message.includes('completed')) {
            return 'completion';
        }
        else {
            return 'conversational';
        }
    }
    identifyTaskTypeLocally(userMessage) {
        const message = userMessage.toLowerCase();
        if (message.includes('database') || message.includes('sql')) {
            return 'database';
        }
        else if (message.includes('frontend') || message.includes('ui') || message.includes('component')) {
            return 'frontend';
        }
        else if (message.includes('backend') || message.includes('api') || message.includes('server')) {
            return 'backend';
        }
        else if (message.includes('fix') || message.includes('debug')) {
            return 'debugging';
        }
        else {
            return 'general';
        }
    }
    extractToolsUsedLocally(assistantMessage) {
        const tools = [];
        if (assistantMessage.includes('str_replace_based_edit_tool')) {
            tools.push('file_editing');
        }
        if (assistantMessage.includes('bash')) {
            tools.push('shell_commands');
        }
        if (assistantMessage.includes('execute_sql_tool')) {
            tools.push('database_operations');
        }
        if (assistantMessage.includes('search_filesystem')) {
            tools.push('file_search');
        }
        return tools;
    }
    extractCommunicationPatternsLocally(userMessage) {
        const patterns = [];
        const message = userMessage.toLowerCase();
        if (message.includes('please') || message.includes('can you')) {
            patterns.push({
                type: 'communication_style',
                category: 'preference',
                data: {
                    politenessLevel: message.includes('please') ? 'polite' : 'direct',
                    requestType: message.includes('help') ? 'assistance' : 'action',
                    urgencyLevel: message.includes('urgent') || message.includes('quickly') ? 'high' : 'normal'
                }
            });
        }
        if (message.includes('design') || message.includes('ui') || message.includes('component')) {
            patterns.push({
                type: 'design_request',
                category: 'creative',
                data: {
                    designType: this.identifyDesignTypeLocally(userMessage),
                    luxuryElements: message.includes('luxury') || message.includes('sophisticated'),
                    colorPreferences: this.extractColorPreferencesLocally(userMessage)
                }
            });
        }
        return patterns;
    }
    processToolResultLocally(toolResult, toolName) {
        if (toolResult.length <= 2000) {
            return toolResult;
        }
        if (toolName === 'str_replace_based_edit_tool') {
            return this.processFileEditResultLocally(toolResult);
        }
        if (toolName === 'bash' || toolName === 'execute_sql_tool') {
            return this.processCommandResultLocally(toolResult);
        }
        if (toolName === 'search_filesystem') {
            return this.processSearchResultLocally(toolResult);
        }
        return this.processGenericResultLocally(toolResult);
    }
    processFileEditResultLocally(result) {
        if (result.length <= 8000) {
            return result;
        }
        const lines = result.split('\n');
        const importantLines = lines.filter(line => line.includes('successfully') ||
            line.includes('created') ||
            line.includes('modified') ||
            line.includes('error') ||
            line.includes('failed') ||
            line.includes('File:') ||
            line.includes('Result:') ||
            line.includes('line') && line.includes(':'));
        if (importantLines.length > 0) {
            return `${importantLines.slice(0, 30).join('\n')}\n\n[File operation details - ${result.length} chars total]`;
        }
        return `${result.substring(0, 4000)}\n\n[File content truncated - ${result.length} total characters]`;
    }
    processCommandResultLocally(result) {
        if (result.length <= 5000) {
            return result;
        }
        const lines = result.split('\n');
        const importantLines = lines.filter(line => line.includes('error') ||
            line.includes('warning') ||
            line.includes('success') ||
            line.includes('completed') ||
            line.includes('failed') ||
            line.includes('●') ||
            line.includes('✓') ||
            line.includes('✗') ||
            line.trim().startsWith('['));
        if (importantLines.length > 0) {
            return `${importantLines.slice(0, 20).join('\n')}\n\n[Command output - ${result.length} chars total]`;
        }
        return `${result.substring(0, 2500)}\n\n[Output truncated - ${result.length} total characters]`;
    }
    processSearchResultLocally(result) {
        try {
            const files = result.match(/fileName[^}]+/g) || [];
            const fileList = files.slice(0, 15).map(f => {
                const name = f.match(/"([^"]+)"/)?.[1] || '';
                return `- ${name}`;
            }).join('\n');
            return `SEARCH RESULTS (${files.length} files found):\n${fileList}\n\nUse str_replace_based_edit_tool to view or modify these files.`;
        }
        catch (error) {
            return this.processGenericResultLocally(result);
        }
    }
    processGenericResultLocally(result) {
        const lines = result.split('\n');
        const importantLines = lines.filter(line => line.includes('successfully') ||
            line.includes('created') ||
            line.includes('modified') ||
            line.includes('error') ||
            line.includes('failed') ||
            line.includes('Result:') ||
            line.includes('Status:')).slice(0, 20);
        const summary = importantLines.join('\n') || lines.slice(0, 30).join('\n');
        return `${summary}\n\n[${result.length} chars total - showing key results]`;
    }
    validateCodeLocally(code, filePath) {
        const errors = [];
        const suggestions = [];
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            this.validateTypeScriptLocally(code, errors, suggestions);
        }
        if (filePath.endsWith('.css')) {
            this.validateCSSLocally(code, errors, suggestions);
        }
        if (filePath.endsWith('.json')) {
            this.validateJSONLocally(code, errors, suggestions);
        }
        return {
            valid: errors.length === 0,
            errors,
            suggestions
        };
    }
    validateTypeScriptLocally(code, errors, suggestions) {
        const brackets = this.countBrackets(code);
        if (brackets.curly !== 0) {
            errors.push('Mismatched curly braces');
            suggestions.push('Check for missing or extra { } braces');
        }
        if (brackets.round !== 0) {
            errors.push('Mismatched parentheses');
            suggestions.push('Check for missing or extra ( ) parentheses');
        }
        if (brackets.square !== 0) {
            errors.push('Mismatched square brackets');
            suggestions.push('Check for missing or extra [ ] brackets');
        }
        const stringQuotes = (code.match(/"/g) || []).length;
        const templateLiterals = (code.match(/`/g) || []).length;
        if (stringQuotes % 2 !== 0) {
            errors.push('Unterminated string literal');
            suggestions.push('Check for missing closing quote');
        }
        if (templateLiterals % 2 !== 0) {
            errors.push('Unterminated template literal');
            suggestions.push('Check for missing closing backtick');
        }
    }
    validateCSSLocally(code, errors, suggestions) {
        const brackets = this.countBrackets(code);
        if (brackets.curly !== 0) {
            errors.push('Mismatched CSS braces');
            suggestions.push('Check for missing closing } in CSS rules');
        }
        const lines = code.split('\n').filter(line => line.trim());
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes(':') && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}')) {
                suggestions.push(`Line ${i + 1}: Consider adding semicolon`);
            }
        }
    }
    validateJSONLocally(code, errors, suggestions) {
        try {
            JSON.parse(code);
        }
        catch (error) {
            errors.push('Invalid JSON syntax');
            suggestions.push('Check for trailing commas, missing quotes, or malformed structure');
        }
    }
    countBrackets(code) {
        let curly = 0, round = 0, square = 0;
        for (const char of code) {
            switch (char) {
                case '{':
                    curly++;
                    break;
                case '}':
                    curly--;
                    break;
                case '(':
                    round++;
                    break;
                case ')':
                    round--;
                    break;
                case '[':
                    square++;
                    break;
                case ']':
                    square--;
                    break;
            }
        }
        return { curly, round, square };
    }
    async updateAgentLearningLocally(userId, agentName, userMessage, assistantMessage) {
        try {
            const normalizedAgentName = agentName.toLowerCase();
            const patterns = this.extractPatternsLocally(userMessage, assistantMessage);
            for (const pattern of patterns) {
                const existing = await db
                    .select()
                    .from(agentLearning)
                    .where(and(eq(agentLearning.agentName, normalizedAgentName), eq(agentLearning.userId, userId), eq(agentLearning.learningType, pattern.type), eq(agentLearning.category, pattern.category)))
                    .limit(1);
                if (existing.length > 0) {
                    await db
                        .update(agentLearning)
                        .set({
                        frequency: (existing[0].frequency || 0) + 1,
                        confidence: Math.min(1.0, parseFloat(existing[0].confidence?.toString() || "0.5") + 0.1).toString(),
                        lastSeen: new Date(),
                        updatedAt: new Date(),
                    })
                        .where(eq(agentLearning.id, existing[0].id));
                }
                else {
                    await db.insert(agentLearning).values({
                        agentName: normalizedAgentName,
                        userId: userId,
                        learningType: pattern.type,
                        category: pattern.category,
                        data: pattern.data,
                        confidence: "0.7",
                        frequency: 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            }
            console.log(`🧠 LOCAL: Learning updated for ${normalizedAgentName}: ${patterns.length} patterns`);
        }
        catch (error) {
            console.error('Failed to update agent learning locally:', error);
        }
    }
    async updateSessionContextLocally(userId, agentName, conversationId, context) {
        try {
            const normalizedAgentName = agentName.toLowerCase();
            const sessionId = `${userId}_${normalizedAgentName}_session`;
            const existing = await db
                .select()
                .from(agentSessionContexts)
                .where(and(eq(agentSessionContexts.userId, userId), eq(agentSessionContexts.agentId, normalizedAgentName)))
                .limit(1);
            const contextData = {
                lastConversationId: conversationId,
                recentInteractions: context,
                timestamp: new Date().toISOString()
            };
            if (existing.length > 0) {
                await db
                    .update(agentSessionContexts)
                    .set({
                    contextData: contextData,
                    lastInteraction: new Date(),
                    updatedAt: new Date(),
                })
                    .where(eq(agentSessionContexts.id, existing[0].id));
            }
            else {
                await db.insert(agentSessionContexts).values({
                    userId: userId,
                    agentId: normalizedAgentName,
                    sessionId: sessionId,
                    contextData: contextData,
                    workflowState: 'active',
                    lastInteraction: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            console.log(`🔄 LOCAL: Session context updated for ${normalizedAgentName}`);
        }
        catch (error) {
            console.error('Failed to update session context locally:', error);
        }
    }
    extractToolsFromResponse(response) {
        const tools = [];
        if (response.includes('str_replace_based_edit_tool'))
            tools.push('str_replace_based_edit_tool');
        if (response.includes('bash'))
            tools.push('bash');
        if (response.includes('execute_sql_tool'))
            tools.push('execute_sql_tool');
        if (response.includes('search_filesystem'))
            tools.push('search_filesystem');
        if (response.includes('coordinate_agent'))
            tools.push('coordinate_agent');
        return tools;
    }
    identifyDesignTypeLocally(message) {
        const lower = message.toLowerCase();
        if (lower.includes('dashboard') || lower.includes('admin'))
            return 'dashboard';
        if (lower.includes('landing') || lower.includes('homepage'))
            return 'landing_page';
        if (lower.includes('form') || lower.includes('input'))
            return 'form';
        if (lower.includes('nav') || lower.includes('menu'))
            return 'navigation';
        if (lower.includes('card') || lower.includes('component'))
            return 'component';
        if (lower.includes('modal') || lower.includes('popup'))
            return 'modal';
        if (lower.includes('table') || lower.includes('list'))
            return 'data_display';
        return 'general_ui';
    }
    extractColorPreferencesLocally(message) {
        const colors = [];
        const lower = message.toLowerCase();
        if (lower.includes('black') || lower.includes('dark'))
            colors.push('black');
        if (lower.includes('white') || lower.includes('light'))
            colors.push('white');
        if (lower.includes('gold') || lower.includes('luxury'))
            colors.push('gold');
        if (lower.includes('blue'))
            colors.push('blue');
        if (lower.includes('red'))
            colors.push('red');
        if (lower.includes('green'))
            colors.push('green');
        if (lower.includes('purple'))
            colors.push('purple');
        if (lower.includes('elegant') || lower.includes('sophisticated'))
            colors.push('neutral');
        return colors;
    }
    generateFixSuggestionsLocally(errorMessage) {
        const suggestions = [];
        const lower = errorMessage.toLowerCase();
        if (lower.includes('syntax')) {
            suggestions.push('Check for missing semicolons, brackets, or quotes');
        }
        if (lower.includes('file not found') || lower.includes('enoent')) {
            suggestions.push('Verify file path exists and has correct permissions');
        }
        if (lower.includes('permission denied')) {
            suggestions.push('Check file permissions or run with appropriate access');
        }
        if (lower.includes('port') && lower.includes('already in use')) {
            suggestions.push('Try a different port or stop the conflicting process');
        }
        if (lower.includes('module not found') || lower.includes('cannot resolve')) {
            suggestions.push('Install missing dependencies with npm install');
        }
        if (lower.includes('type error') || lower.includes('typescript')) {
            suggestions.push('Check type definitions and imports');
        }
        return suggestions.length > 0 ? suggestions : ['Review error details and check documentation'];
    }
    async saveAgentLearning(agentName, userId, learningType, category, data, confidence = 0.5) {
        try {
            const existing = await db
                .select()
                .from(agentLearning)
                .where(and(eq(agentLearning.agentName, agentName), eq(agentLearning.category, category), eq(agentLearning.learningType, learningType)))
                .limit(1);
            if (existing.length > 0) {
                const updatedConfidence = Math.min(1.0, confidence + 0.1);
                const updatedFrequency = (existing[0].frequency || 1) + 1;
                await db
                    .update(agentLearning)
                    .set({
                    data,
                    confidence: updatedConfidence.toString(),
                    frequency: updatedFrequency,
                    lastSeen: new Date(),
                    updatedAt: new Date()
                })
                    .where(eq(agentLearning.id, existing[0].id));
                console.log(`🧠 PHASE 3: Updated learning pattern for ${agentName}/${category} (confidence: ${updatedConfidence})`);
            }
            else {
                await db
                    .insert(agentLearning)
                    .values({
                    agentName,
                    userId,
                    learningType,
                    category,
                    data,
                    confidence: confidence.toString(),
                    frequency: 1,
                    lastSeen: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`🧠 PHASE 3: Created new learning pattern for ${agentName}/${category}`);
            }
            const cacheKey = `${agentName}-${category}`;
            this.learningCache.set(cacheKey, { agentName, category, data, confidence });
            if (confidence > 0.8) {
                await this.shareLearningAcrossAgents(agentName, category, data, confidence);
            }
        }
        catch (error) {
            console.error(`❌ PHASE 3: Failed to save learning for ${agentName}:`, error);
        }
    }
    async shareLearningAcrossAgents(sourceAgent, category, data, confidence) {
        const targetAgents = ['elena', 'zara', 'aria', 'maya', 'victoria'];
        const relevantAgents = targetAgents.filter(agent => agent !== sourceAgent);
        console.log(`🌐 PHASE 3: Sharing learning from ${sourceAgent} to ${relevantAgents.length} agents`);
        for (const targetAgent of relevantAgents) {
            try {
                await db
                    .insert(agentKnowledgeBase)
                    .values({
                    agentId: targetAgent,
                    topic: `Cross-agent learning: ${category}`,
                    content: JSON.stringify({
                        sourceAgent,
                        learningData: data,
                        sharedAt: new Date().toISOString(),
                        originalConfidence: confidence
                    }),
                    source: 'cross_agent_learning',
                    confidence: (confidence * 0.8).toString(),
                    lastUpdated: new Date(),
                    tags: [category, 'cross_agent', sourceAgent]
                });
                console.log(`📚 PHASE 3: Shared knowledge to ${targetAgent}`);
            }
            catch (error) {
                console.log(`⚠️ PHASE 3: Failed to share to ${targetAgent}:`, error);
            }
        }
    }
    async getCrossAgentLearning(agentName, category) {
        try {
            let ownLearningQuery = db
                .select()
                .from(agentLearning)
                .where(category
                ? and(eq(agentLearning.agentName, agentName), eq(agentLearning.category, category))
                : eq(agentLearning.agentName, agentName))
                .orderBy(desc(agentLearning.confidence))
                .limit(20);
            const ownLearning = await ownLearningQuery;
            const sharedLearningConditions = [
                eq(agentKnowledgeBase.agentId, agentName),
                eq(agentKnowledgeBase.source, 'cross_agent_learning')
            ];
            if (category) {
                sharedLearningConditions.push(and(like(agentKnowledgeBase.topic, `%${category}%`), sql `${agentKnowledgeBase.tags} @> ARRAY[${category}]::text[]`));
            }
            const sharedLearningQuery = await db
                .select()
                .from(agentKnowledgeBase)
                .where(and(...sharedLearningConditions))
                .orderBy(desc(agentKnowledgeBase.confidence));
            const sharedLearning = await sharedLearningQuery.limit(10);
            const performanceMetrics = await db
                .select()
                .from(agentPerformanceMetrics)
                .where(eq(agentPerformanceMetrics.agentId, agentName))
                .limit(1);
            console.log(`🧠 PHASE 3: Retrieved learning for ${agentName}: ${ownLearning.length} own patterns, ${sharedLearning.length} shared patterns`);
            return {
                ownLearning,
                sharedLearning,
                performanceMetrics: performanceMetrics[0] || null
            };
        }
        catch (error) {
            console.error(`❌ PHASE 3: Failed to get cross-agent learning for ${agentName}:`, error);
            return {
                ownLearning: [],
                sharedLearning: [],
                performanceMetrics: null
            };
        }
    }
    async recordAgentPerformance(agentId, taskType, success, duration, userSatisfaction) {
        try {
            const existing = await db
                .select()
                .from(agentPerformanceMetrics)
                .where(and(eq(agentPerformanceMetrics.agentId, agentId), eq(agentPerformanceMetrics.taskType, taskType)))
                .limit(1);
            if (existing.length > 0) {
                const current = existing[0];
                const totalTasks = (current.totalTasks || 0) + 1;
                const currentSuccessRate = parseFloat(current.successRate || '0');
                const newSuccessRate = ((currentSuccessRate * (totalTasks - 1)) + (success ? 1 : 0)) / totalTasks;
                const currentAvgTime = current.averageTime || 0;
                const newAvgTime = ((currentAvgTime * (totalTasks - 1)) + duration) / totalTasks;
                await db
                    .update(agentPerformanceMetrics)
                    .set({
                    successRate: newSuccessRate.toString(),
                    averageTime: Math.round(newAvgTime),
                    userSatisfactionScore: userSatisfaction?.toString() || current.userSatisfactionScore,
                    totalTasks,
                    improvementTrend: newSuccessRate > currentSuccessRate ? 'improving' :
                        newSuccessRate < currentSuccessRate ? 'declining' : 'stable',
                    lastUpdated: new Date()
                })
                    .where(eq(agentPerformanceMetrics.id, current.id));
                console.log(`📊 PHASE 3: Updated performance for ${agentId}/${taskType}: ${(newSuccessRate * 100).toFixed(1)}% success rate`);
            }
            else {
                await db
                    .insert(agentPerformanceMetrics)
                    .values({
                    agentId,
                    taskType,
                    successRate: success ? '1.0' : '0.0',
                    averageTime: duration,
                    userSatisfactionScore: userSatisfaction?.toString() || '0.0',
                    totalTasks: 1,
                    improvementTrend: 'stable',
                    lastUpdated: new Date()
                });
                console.log(`📊 PHASE 3: Created performance metrics for ${agentId}/${taskType}`);
            }
        }
        catch (error) {
            console.error(`❌ PHASE 3: Failed to record performance for ${agentId}:`, error);
        }
    }
    async getLearningRecommendations(agentId) {
        try {
            const performance = await db
                .select()
                .from(agentPerformanceMetrics)
                .where(eq(agentPerformanceMetrics.agentId, agentId))
                .orderBy(agentPerformanceMetrics.successRate);
            const skillsToImprove = performance
                .filter(p => parseFloat(p.successRate || '0') < 0.8)
                .map(p => p.taskType);
            const learningFromOthers = await db
                .select()
                .from(agentLearning)
                .where(and(sql `${agentLearning.agentName} != ${agentId}`, sql `${agentLearning.confidence} > 0.8`))
                .orderBy(desc(agentLearning.confidence))
                .limit(10);
            console.log(`💡 PHASE 3: Generated learning recommendations for ${agentId}: ${skillsToImprove.length} skills to improve`);
            return {
                skillsToImprove,
                learningFromOthers,
                performanceInsights: {
                    totalMetrics: performance.length,
                    averageSuccessRate: performance.reduce((sum, p) => sum + parseFloat(p.successRate || '0'), 0) / performance.length || 0,
                    improvingTasks: performance.filter(p => p.improvementTrend === 'improving').length
                }
            };
        }
        catch (error) {
            console.error(`❌ PHASE 3: Failed to get learning recommendations for ${agentId}:`, error);
            return {
                skillsToImprove: [],
                learningFromOthers: [],
                performanceInsights: {}
            };
        }
    }
}
export const localProcessingEngine = LocalProcessingEngine.getInstance();
//# sourceMappingURL=local-processing-engine.js.map