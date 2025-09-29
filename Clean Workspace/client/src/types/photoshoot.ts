export interface PhotoshootPrompt {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt: string;
}

export interface PhotoshootCollection {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  preview: string;
  prompts: PhotoshootPrompt[];
}

export interface GenerationTracker {
  id: number;
  status: 'processing' | 'completed' | 'failed';
  imageUrls?: string[];
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  trackerId: number | null;
  generatedImages: string[];
  selectedPrompt: PhotoshootPrompt | null;
}

export interface ImageSaveState {
  savedImages: Set<string>;
  savingImages: Set<string>;
}