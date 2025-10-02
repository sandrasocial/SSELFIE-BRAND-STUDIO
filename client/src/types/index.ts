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

import type { BaseChatMessage, MayaChatMessage } from '../../../shared/types/unified-chat.js';

export interface ClientChatMessage extends Omit<BaseChatMessage, 'content'> {
  sender: 'user' | 'ai';
  type: 'text' | 'concept';
  content: string | Record<string, unknown>; // Can be string or a concept card object
}