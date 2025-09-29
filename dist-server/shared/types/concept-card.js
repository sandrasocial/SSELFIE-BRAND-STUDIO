export function isServerConceptCard(card) {
    return !!(card.userId && typeof card.status === 'string' && typeof card.sortOrder === 'number');
}
export function isClientConceptCard(card) {
    return !!(card.title && card.description);
}
export function toServerConceptCard(card, userId) {
    return {
        ...card,
        userId,
        status: card.status || 'draft',
        sortOrder: card.sortOrder || 0,
        isLoading: card.isLoading || false,
        isGenerating: card.isGenerating || false,
        hasGenerated: card.hasGenerated || false,
        createdAt: typeof card.createdAt === 'string' ? card.createdAt : new Date().toISOString(),
        updatedAt: typeof card.updatedAt === 'string' ? card.updatedAt : new Date().toISOString(),
    };
}
export function toClientConceptCard(card) {
    return {
        ...card,
        title: card.title || '',
        description: card.description || '',
    };
}
//# sourceMappingURL=concept-card.js.map