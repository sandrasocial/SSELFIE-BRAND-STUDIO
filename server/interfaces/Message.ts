export interface Message {
    id: string;
    conversationId: string;
    content: string;
    role: 'user' | 'agent' | 'system';
    timestamp: Date;
    metadata?: {
        agentId?: string;
        contextReferences?: string[];
        entities?: string[];
        intent?: string;
    };
}