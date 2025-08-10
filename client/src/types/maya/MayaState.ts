// Maya STYLE Interface - State Management
// August 10, 2025 - Redesign Implementation

import { ChatMessage, MayaChat, GenerationStatus, MayaPhase, MayaMood } from './MayaTypes';

export interface MayaState {
  // Core phase management
  phase: MayaPhase;
  isInitialized: boolean;
  
  // Chat state
  chat: {
    messages: ChatMessage[];
    currentChatId: number | null;
    isTyping: boolean;
    input: string;
    chatHistory: MayaChat[];
  };
  
  // Generation state
  generation: {
    status: GenerationStatus;
    progress: number;
    trackerId: number | null;
    imageUrls: string[];
    isGenerating: boolean;
  };
  
  // Gallery state
  gallery: {
    savedImages: Set<string>;
    savingImages: Set<string>;
    selectedImage: string | null;
  };
  
  // UI state
  ui: {
    mood: MayaMood;
    showHistory: boolean;
    isMobile: boolean;
  };
  
  // Error state
  error: {
    hasError: boolean;
    message: string | null;
  };
}

export type MayaAction = 
  | { type: 'INITIALIZE'; payload: { chatId?: number } }
  | { type: 'SET_PHASE'; payload: MayaPhase }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SEND_MESSAGE'; payload: string }
  | { type: 'RECEIVE_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'LOAD_CHAT_HISTORY'; payload: MayaChat[] }
  | { type: 'LOAD_MESSAGES'; payload: ChatMessage[] }
  | { type: 'START_GENERATION'; payload: { prompt: string; trackerId: number } }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'GENERATION_COMPLETE'; payload: string[] }
  | { type: 'GENERATION_FAILED'; payload: string }
  | { type: 'SAVE_TO_GALLERY'; payload: string }
  | { type: 'GALLERY_SAVE_COMPLETE'; payload: string }
  | { type: 'SELECT_IMAGE'; payload: string | null }
  | { type: 'SET_MOOD'; payload: MayaMood }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_GENERATION' };

export const initialMayaState: MayaState = {
  phase: 'LOADING',
  isInitialized: false,
  
  chat: {
    messages: [],
    currentChatId: null,
    isTyping: false,
    input: '',
    chatHistory: [],
  },
  
  generation: {
    status: 'IDLE',
    progress: 0,
    trackerId: null,
    imageUrls: [],
    isGenerating: false,
  },
  
  gallery: {
    savedImages: new Set(),
    savingImages: new Set(),
    selectedImage: null,
  },
  
  ui: {
    mood: 'confident',
    showHistory: false,
    isMobile: false,
  },
  
  error: {
    hasError: false,
    message: null,
  },
};