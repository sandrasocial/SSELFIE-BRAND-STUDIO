// Maya STYLE Interface - Centralized State Management
// August 10, 2025 - Redesign Implementation

import React, { useReducer, useContext, createContext, useCallback } from 'react';
import { MayaState, MayaAction, initialMayaState } from '@/types/maya/MayaState';
import { ChatMessage } from '@/types/maya/MayaTypes';

// State context
const MayaStateContext = createContext<{
  state: MayaState;
  dispatch: React.Dispatch<MayaAction>;
} | null>(null);

// Reducer function
function mayaStateReducer(state: MayaState, action: MayaAction): MayaState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        phase: 'CHAT',
        isInitialized: true,
        chat: {
          ...state.chat,
          currentChatId: action.payload.chatId || null,
        },
      };

    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload,
      };

    case 'SET_INPUT':
      return {
        ...state,
        chat: {
          ...state.chat,
          input: action.payload,
        },
      };

    case 'SEND_MESSAGE':
      const userMessage: ChatMessage = {
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: [...state.chat.messages, userMessage],
          input: '',
          isTyping: true,
        },
        ui: {
          ...state.ui,
          mood: 'thinking',
        },
      };

    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: [...state.chat.messages, action.payload],
          isTyping: false,
        },
        ui: {
          ...state.ui,
          mood: 'confident',
        },
      };

    case 'SET_TYPING':
      return {
        ...state,
        chat: {
          ...state.chat,
          isTyping: action.payload,
        },
        ui: {
          ...state.ui,
          mood: action.payload ? 'thinking' : 'confident',
        },
      };

    case 'LOAD_CHAT_HISTORY':
      return {
        ...state,
        chat: {
          ...state.chat,
          chatHistory: action.payload,
        },
      };

    case 'LOAD_MESSAGES':
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: action.payload,
        },
      };

    case 'START_GENERATION':
      return {
        ...state,
        phase: 'GENERATING',
        generation: {
          ...state.generation,
          status: 'PROCESSING',
          isGenerating: true,
          progress: 0,
          trackerId: action.payload.trackerId,
          imageUrls: [],
        },
        ui: {
          ...state.ui,
          mood: 'creating',
        },
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        generation: {
          ...state.generation,
          progress: Math.min(100, Math.max(0, action.payload)),
        },
      };

    case 'GENERATION_COMPLETE':
      return {
        ...state,
        phase: 'VIEWING',
        generation: {
          ...state.generation,
          status: 'COMPLETED',
          isGenerating: false,
          progress: 100,
          imageUrls: action.payload,
        },
        ui: {
          ...state.ui,
          mood: 'excited',
        },
      };

    case 'GENERATION_FAILED':
      return {
        ...state,
        phase: 'CHAT',
        generation: {
          ...state.generation,
          status: 'FAILED',
          isGenerating: false,
          progress: 0,
        },
        error: {
          hasError: true,
          message: action.payload,
        },
        ui: {
          ...state.ui,
          mood: 'confident',
        },
      };

    case 'SAVE_TO_GALLERY':
      return {
        ...state,
        gallery: {
          ...state.gallery,
          savingImages: new Set([...state.gallery.savingImages, action.payload]),
        },
      };

    case 'GALLERY_SAVE_COMPLETE':
      const newSavedImages = new Set(state.gallery.savedImages);
      newSavedImages.add(action.payload);
      const newSavingImages = new Set(state.gallery.savingImages);
      newSavingImages.delete(action.payload);
      
      return {
        ...state,
        gallery: {
          ...state.gallery,
          savedImages: newSavedImages,
          savingImages: newSavingImages,
        },
      };

    case 'SELECT_IMAGE':
      return {
        ...state,
        gallery: {
          ...state.gallery,
          selectedImage: action.payload,
        },
      };

    case 'SET_MOOD':
      return {
        ...state,
        ui: {
          ...state.ui,
          mood: action.payload,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: {
          hasError: true,
          message: action.payload,
        },
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: {
          hasError: false,
          message: null,
        },
      };

    case 'RESET_GENERATION':
      return {
        ...state,
        phase: 'CHAT',
        generation: {
          status: 'IDLE',
          progress: 0,
          trackerId: null,
          imageUrls: [],
          isGenerating: false,
        },
        ui: {
          ...state.ui,
          mood: 'confident',
        },
      };

    default:
      return state;
  }
}

// Provider component
export function MayaStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mayaStateReducer, initialMayaState);
  
  return (
    <MayaStateContext.Provider value={{ state, dispatch }}>
      {children}
    </MayaStateContext.Provider>
  );
}

// Hook to use Maya state
export function useMayaState() {
  const context = useContext(MayaStateContext);
  if (!context) {
    throw new Error('useMayaState must be used within MayaStateProvider');
  }
  return context;
}

// Action creators for cleaner usage
export function useMayaActions() {
  const { dispatch } = useMayaState();
  
  return {
    initialize: useCallback((chatId?: number) => {
      dispatch({ type: 'INITIALIZE', payload: { chatId } });
    }, [dispatch]),
    
    setPhase: useCallback((phase: MayaState['phase']) => {
      dispatch({ type: 'SET_PHASE', payload: phase });
    }, [dispatch]),
    
    setInput: useCallback((input: string) => {
      dispatch({ type: 'SET_INPUT', payload: input });
    }, [dispatch]),
    
    sendMessage: useCallback((content: string) => {
      dispatch({ type: 'SEND_MESSAGE', payload: content });
    }, [dispatch]),
    
    receiveMessage: useCallback((message: ChatMessage) => {
      dispatch({ type: 'RECEIVE_MESSAGE', payload: message });
    }, [dispatch]),
    
    setTyping: useCallback((isTyping: boolean) => {
      dispatch({ type: 'SET_TYPING', payload: isTyping });
    }, [dispatch]),
    
    startGeneration: useCallback((prompt: string, trackerId: number) => {
      dispatch({ type: 'START_GENERATION', payload: { prompt, trackerId } });
    }, [dispatch]),
    
    updateProgress: useCallback((progress: number) => {
      dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
    }, [dispatch]),
    
    generationComplete: useCallback((imageUrls: string[]) => {
      dispatch({ type: 'GENERATION_COMPLETE', payload: imageUrls });
    }, [dispatch]),
    
    generationFailed: useCallback((error: string) => {
      dispatch({ type: 'GENERATION_FAILED', payload: error });
    }, [dispatch]),
    
    saveToGallery: useCallback((imageUrl: string) => {
      dispatch({ type: 'SAVE_TO_GALLERY', payload: imageUrl });
    }, [dispatch]),
    
    gallerySaveComplete: useCallback((imageUrl: string) => {
      dispatch({ type: 'GALLERY_SAVE_COMPLETE', payload: imageUrl });
    }, [dispatch]),
    
    selectImage: useCallback((imageUrl: string | null) => {
      dispatch({ type: 'SELECT_IMAGE', payload: imageUrl });
    }, [dispatch]),
    
    setMood: useCallback((mood: MayaState['ui']['mood']) => {
      dispatch({ type: 'SET_MOOD', payload: mood });
    }, [dispatch]),
    
    setError: useCallback((error: string) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, [dispatch]),
    
    clearError: useCallback(() => {
      dispatch({ type: 'CLEAR_ERROR' });
    }, [dispatch]),
    
    resetGeneration: useCallback(() => {
      dispatch({ type: 'RESET_GENERATION' });
    }, [dispatch]),
  };
}