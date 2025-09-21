/**
 * Common types and interfaces for the API
 */

export interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt: string;
  category: string;
  emoji: string;
}

export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  message?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  plan: string;
  role: string;
  stackUser: Record<string, unknown>;
}