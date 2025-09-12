// src/types/index.ts

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  role?: string;
  gender?: string; // Added to fix simple-training error
  monthlyGenerationLimit: number;
  generationsUsedThisMonth: number;
}

export interface UserModel {
  trainingStatus?: string;
  hasRetrainingAccess?: boolean; // Added to fix simple-training error
  // Add any other userModel properties you need
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  content: any; // Can be string or a concept card object
  type: 'text' | 'concept'; // Added to distinguish message types
}

export interface UseMayaChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: string, context?: any) => void; // Corrected arguments
  isLoading: boolean;
  error: string | null;
}