/**
 * Unified ConceptCard Type Definitions
 * Resolves type conflicts across the application
 */

// Base ConceptCard interface with all possible properties
export interface ConceptCard {
  // Core properties
  id: string;
  title: string;
  description: string;
  
  // Server-specific properties (optional for client-side compatibility)
  userId?: string;
  conversationId?: string;
  clientId?: string; // For idempotency
  
  // Content properties
  images?: string[];
  tags?: string[];
  fluxPrompt?: string;
  imageUrl?: string;
  generatedImages?: string[];
  
  // UI state properties
  isLoading?: boolean;
  isGenerating?: boolean;
  hasGenerated?: boolean;
  isSelected?: boolean;
  
  // Status and ordering
  status?: 'draft' | 'final';
  sortOrder?: number;
  
  // Visual properties
  emoji?: string;
  category?: string;
  type?: 'portrait' | 'flatlay' | 'lifestyle';
  creativeLook?: string;
  creativeLookDescription?: string;
  
  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  // Allow additional properties for flexibility
  [key: string]: unknown;
}

// Specific variants for different use cases
export interface ServerConceptCard extends ConceptCard {
  // Server-side required properties
  userId: string;
  status: 'draft' | 'final';
  sortOrder: number;
  isLoading: boolean;
  isGenerating: boolean;
  hasGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientConceptCard extends ConceptCard {
  // Client-side required properties
  title: string;
  description: string;
  type?: 'portrait' | 'flatlay' | 'lifestyle';
}

// For creating new concept cards
export interface CreateConceptCardData {
  title: string;
  description?: string;
  conversationId?: string;
  clientId?: string;
  images?: string[];
  tags?: string[];
  status?: 'draft' | 'final';
  sortOrder?: number;
  fluxPrompt?: string;
  category?: string;
  type?: 'portrait' | 'flatlay' | 'lifestyle';
}

// For updating concept cards
export interface UpdateConceptCardData {
  title?: string;
  description?: string;
  images?: string[];
  tags?: string[];
  status?: 'draft' | 'final';
  sortOrder?: number;
  fluxPrompt?: string;
  category?: string;
  type?: 'portrait' | 'flatlay' | 'lifestyle';
  generatedImages?: string[];
  isLoading?: boolean;
  isGenerating?: boolean;
  hasGenerated?: boolean;
}

// Type guards for runtime type checking
export function isServerConceptCard(card: ConceptCard): card is ServerConceptCard {
  return !!(card.userId && typeof card.status === 'string' && typeof card.sortOrder === 'number');
}

export function isClientConceptCard(card: ConceptCard): card is ClientConceptCard {
  return !!(card.title && card.description);
}

// Conversion utilities
export function toServerConceptCard(card: ConceptCard, userId: string): ServerConceptCard {
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

export function toClientConceptCard(card: ConceptCard): ClientConceptCard {
  return {
    ...card,
    title: card.title || '',
    description: card.description || '',
  };
}