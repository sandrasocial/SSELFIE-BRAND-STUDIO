/**
 * Unified ConceptCard Type Definitions
 * Resolves type conflicts across the application
 */
// Type guards for runtime type checking
export function isServerConceptCard(card) {
    return !!(card.userId && typeof card.status === 'string' && typeof card.sortOrder === 'number');
}
export function isClientConceptCard(card) {
    return !!(card.title && card.description);
}
// Conversion utilities
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
