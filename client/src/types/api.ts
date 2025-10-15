export interface Scene {
  // Add scene type properties based on your implementation
  id: string;
  // Add other properties
}

export interface StoryGenerationOptions {
  scenes: Scene[];
  conditioningImages?: string[];
  format?: string;
}

export interface JobStatus {
  id: string;
  status: string;
  // Add other job status properties
}

export interface MayaMessage {
  content: string;
  role: 'user' | 'assistant';
}

export interface MayaChatHistory {
  messages: MayaMessage[];
}

export type PhotoPrompt = {
  text: string;
  style?: string;
  seed?: number;
};