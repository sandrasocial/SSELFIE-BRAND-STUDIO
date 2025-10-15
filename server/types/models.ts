export interface MayaPersonality {
  id: string;
  name: string;
  voice: string;
  // Add other personality properties
}

export interface EmailAccount {
  id: string;
  unreadCount: number;
  // Add other email account properties
}

export interface EmailInsight {
  id: string;
  priority: 'high' | 'medium' | 'low';
  type: 'customer' | 'internal' | 'other';
  needsResponse: boolean;
  // Add other insight properties
}

export interface ImageVariant {
  id: number;
  userId: string;
  createdAt: Date | null;
  processingStatus: string | null;
  originalImageId: number;
  variantUrl: string;
  variantType: string;
  brandAssetId: number | null;
  placementData: unknown;
  generationStatus?: string;
}

export interface AIImage {
  id: number;
  imageUrls: string;
  userId: string;
  category: string;
  createdAt: Date | null;
  prompt: string;
  modelId: number | null;
  subcategory: string;
  selectedUrl: string | null;
  saved: boolean | null;
}