import { Message } from './Message';

export interface Conversation {
    id: string;
    userId: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: {
        title?: string;
        tags?: string[];
        summary?: string;
    };
}