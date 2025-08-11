import { Message } from '../interfaces/Message';

export class ContextManager {
    private static instance: ContextManager;
    private contexts: Map<string, any>;
    private contextHistory: Map<string, any[]>;
    private readonly MAX_HISTORY_LENGTH = 100;

    private constructor() {
        this.contexts = new Map();
        this.contextHistory = new Map();
    }

    public static getInstance(): ContextManager {
        if (!ContextManager.instance) {
            ContextManager.instance = new ContextManager();
        }
        return ContextManager.instance;
    }

    public initializeContext(conversationId: string): void {
        this.contexts.set(conversationId, {
            created: new Date(),
            lastUpdated: new Date(),
            summary: '',
            keyPoints: [],
            entities: new Set(),
            metadata: {}
        });
        this.contextHistory.set(conversationId, []);
    }

    public updateContext(conversationId: string, message: Message): void {
        const context = this.getContext(conversationId);
        if (!context) {
            this.initializeContext(conversationId);
        }

        // Update current context
        const updatedContext = this.processMessage(context, message);
        this.contexts.set(conversationId, updatedContext);

        // Update history
        this.updateContextHistory(conversationId, updatedContext);
    }

    public getContext(conversationId: string): any {
        const context = this.contexts.get(conversationId);
        if (!context) {
            throw new Error(`Context for conversation ${conversationId} not found`);
        }
        return context;
    }

    public getContextHistory(conversationId: string): any[] {
        return this.contextHistory.get(conversationId) || [];
    }

    private processMessage(context: any, message: Message): any {
        // Deep clone the context to avoid mutations
        const updatedContext = JSON.parse(JSON.stringify(context));
        
        // Update context properties
        updatedContext.lastUpdated = new Date();
        
        // Extract and update entities
        const newEntities = this.extractEntities(message);
        updatedContext.entities = new Set([...updatedContext.entities, ...newEntities]);
        
        // Update summary and key points
        this.updateSummary(updatedContext, message);
        
        return updatedContext;
    }

    private updateContextHistory(conversationId: string, context: any): void {
        let history = this.contextHistory.get(conversationId) || [];
        
        // Add new context snapshot
        history.push({
            timestamp: new Date(),
            context: JSON.parse(JSON.stringify(context))
        });

        // Maintain history length
        if (history.length > this.MAX_HISTORY_LENGTH) {
            history = history.slice(-this.MAX_HISTORY_LENGTH);
        }

        this.contextHistory.set(conversationId, history);
    }

    private extractEntities(message: Message): string[] {
        // Implement entity extraction logic
        // This is a placeholder - implement proper NLP/entity extraction
        return [];
    }

    private updateSummary(context: any, message: Message): void {
        // Implement summary update logic
        // This is a placeholder - implement proper summarization
        context.summary = context.summary || '';
        context.keyPoints = context.keyPoints || [];
    }
}