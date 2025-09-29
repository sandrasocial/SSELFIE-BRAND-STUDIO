import type { ConceptCard } from './concept-card.js';

export interface ChatMessage {
  id: string;
  type: 'user' | 'maya' | 'upload' | 'examples' | string;
  content: string;
  timestamp: string;
  conceptCards?: ConceptCard[];
  isStreaming?: boolean;
  showUpload?: boolean;
  showExamples?: boolean;
  metadata?: {
    [key: string]: unknown;
  };
}