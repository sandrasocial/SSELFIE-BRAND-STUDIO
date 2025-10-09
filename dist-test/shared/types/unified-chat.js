// Type guards
export const isChatMessage = (obj) => {
    return (typeof obj === 'object' &&
        obj !== null &&
        'role' in obj &&
        'content' in obj &&
        typeof obj.content === 'string' &&
        ['user', 'assistant', 'system', 'maya', 'victoria'].includes(obj.role));
};
export const isMayaChatMessage = (obj) => {
    return isChatMessage(obj) && 'chatId' in obj && 'userId' in obj;
};
export const isClaudeMessage = (obj) => {
    return (isChatMessage(obj) &&
        'conversationId' in obj &&
        'tokens' in obj &&
        'completionTokens' in obj &&
        'promptTokens' in obj);
};
