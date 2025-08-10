// Maya STYLE Interface - Core Types
// August 10, 2025 - Redesign Implementation

export interface ChatMessage {
  id?: number;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  imagePreview?: string[];
  canGenerate?: boolean;
  generatedPrompt?: string;
}

export interface MayaChat {
  id: number;
  userId: string;
  chatTitle: string;
  chatSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationTracker {
  id: number;
  userId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  imageUrls?: string[];
  prompt?: string;
  trackerId?: string;
}

export type GenerationStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type MayaPhase = 'LOADING' | 'CHAT' | 'GENERATING' | 'VIEWING' | 'SAVING' | 'ERROR';
export type MayaMood = 'confident' | 'excited' | 'thinking' | 'creating';