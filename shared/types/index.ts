// Re-export all types from unified files
export * from './unified-chat.js';
export * from './base.js';
export * from './concept-card.js';

// Define global interfaces
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptionalBaseEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T> = {
  [K in keyof T]-?: T[K];
};