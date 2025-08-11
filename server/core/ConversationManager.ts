import { Conversation } from '../interfaces/Conversation';
import { Message } from '../interfaces/Message';
import { ContextManager } from '../memory/ContextManager';

export class ConversationManager {
    private static instance: ConversationManager;
    private conversations: Map<string, Conversation>;
    private contextManager: ContextManager;

    private constructor() {
        this.conversations = new Map();
        this.contextManager = ContextManager.getInstance();
    }

    public static getInstance(): ConversationManager {
        if (!ConversationManager.instance) {
            ConversationManager.instance = new ConversationManager();
        }
        return ConversationManager.instance;
    }

    public createConversation(userId: string): string {
        const conversationId = this.generateConversationId();
        const conversation: Conversation = {
            id: conversationId,
            userId,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.conversations.set(conversationId, conversation);
        return conversationId;
    }

    public addMessage(conversationId: string, message: Message): void {
        const conversation = this.getConversation(conversationId);
        conversation.messages.push(message);
        conversation.updatedAt = new Date();
        
        // Update context with new message
        this.contextManager.updateContext(conversationId, message);
    }

    public getConversation(conversationId: string): Conversation {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        return conversation;
    }

    public getConversationContext(conversationId: string): any {
        return this.contextManager.getContext(conversationId);
    }

    public getUserConversations(userId: string): Conversation[] {
        return Array.from(this.conversations.values())
            .filter(conv => conv.userId === userId);
    }

    private generateConversationId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}