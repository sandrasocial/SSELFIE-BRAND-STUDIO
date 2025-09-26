// Shared types for the application
import { type User as DbUser, type InsertUser } from './schema.js';

// Re-export User type from schema
export type User = DbUser;

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Chat input types
export interface MayaChatCreateInput {
  chatTitle: string;
  initialMessage?: string;
}

// Memory types
export interface AgentMemoryData {
  conversationHistory: {
    role: string;
    content: string;
  }[];
  lastSaved: string;
  [key: string]: unknown;
}

// Asset types
export interface BrandAssetCreateInput {
  userId: string;
  kind: 'logo' | 'product';
  url: string;
  filename: string;
  fileSize?: number;
  meta?: Record<string, unknown>;
}

export interface ImageVariantCreateInput {
  userId: string;
  originalImageId: number;
  variantUrl: string;
  variantType: string;
  brandAssetId?: number;
  placementData?: Record<string, unknown>;
  processingStatus?: string;
}