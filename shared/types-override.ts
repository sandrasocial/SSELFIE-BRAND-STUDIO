// Type overrides for database schema
// This file provides additional type definitions that extend the base schema

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { 
  aiImages, 
  conversations,
  generationTrackers,
  userModels
} from './schema.js';
import { 
  mayaProfile, 
  mayaImages 
} from './schema-maya.js';

// AI Images types
export type InsertAiImage = InferInsertModel<typeof aiImages>;
export type SelectAiImage = InferSelectModel<typeof aiImages>;

// Maya Profile types
export type MayaProfile = InferSelectModel<typeof mayaProfile>;
export type InsertMayaProfile = InferInsertModel<typeof mayaProfile>;

// Maya Images types (InsertMayaImage is what the service expects)
export type InsertMayaImage = InferInsertModel<typeof mayaImages>;
export type SelectMayaImage = InferSelectModel<typeof mayaImages>;

// Conversation types
export type Conversation = InferSelectModel<typeof conversations>;
export type InsertConversation = InferInsertModel<typeof conversations>;

// Conversation Summary types (if there's a table, add it, otherwise use partial)
export type InsertConversationSummary = Partial<InsertConversation>;

// Generation Tracker types
export type GenerationTracker = InferSelectModel<typeof generationTrackers>;
export type InsertGenerationTracker = InferInsertModel<typeof generationTrackers>;

// User Model types
export type UserModel = InferSelectModel<typeof userModels>;
export type InsertUserModel = InferInsertModel<typeof userModels>;

// Re-export for backwards compatibility
export type { InsertAiImage as AiImage };
