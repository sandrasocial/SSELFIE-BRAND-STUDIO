import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from './schema.js';

// Maya Gallery Images
export const mayaGalleryImages = pgTable("maya_gallery_images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Image data
  imageUrl: varchar("image_url").notNull(), // S3 URL
  thumbnailUrl: varchar("thumbnail_url"), // Optimized thumbnail
  permanentUrl: varchar("permanent_url"), // Migration path
  
  // Metadata
  prompt: text("prompt"), // Original prompt
  generatedPrompt: text("generated_prompt"), // Maya-enhanced prompt
  category: varchar("category"), // Business, Editorial, Lifestyle, etc.
  style: varchar("style"), // professional, creative, luxury
  
  // User interactions
  isFavorite: boolean("is_favorite").default(false),
  isArchived: boolean("is_archived").default(false),
  downloadCount: integer("download_count").default(0),
  
  // Technical details
  modelId: varchar("model_id"), // Reference to trained model
  predictionId: varchar("prediction_id"), // External generation ID
  generationStatus: varchar("generation_status").default("completed"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_maya_gallery_user").on(table.userId),
  index("idx_maya_gallery_category").on(table.category),
  index("idx_maya_gallery_favorites").on(table.userId, table.isFavorite),
]);

// Maya Creative Collections
export const mayaCollections = pgTable("maya_collections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Collection details
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"), // photoshoot, story, concept, etc.
  
  // Content
  imageIds: integer("image_ids").array(), // References to gallery images
  conceptData: jsonb("concept_data"), // Concept card data
  prompt: text("prompt"), // Original creative prompt
  
  // Organization
  tags: text("tags").array(),
  sortOrder: integer("sort_order").default(0),
  
  // Status
  isPrivate: boolean("is_private").default(false),
  isArchived: boolean("is_archived").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_maya_collections_user").on(table.userId),
  index("idx_maya_collections_category").on(table.category),
]);

// Maya Story Studio Projects
export const mayaStoryProjects = pgTable("maya_story_projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Project details
  title: varchar("title").notNull(),
  description: text("description"),
  
  // Story content
  storyboard: jsonb("storyboard"), // Scene sequence
  imageIds: integer("image_ids").array(), // Referenced images
  
  // Technical details
  templateId: varchar("template_id"),
  videoUrl: varchar("video_url"), // Generated video URL
  
  // Status
  status: varchar("status").default("draft"), // draft, generating, completed
  isPublished: boolean("is_published").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
}, (table) => [
  index("idx_maya_story_user").on(table.userId),
  index("idx_maya_story_status").on(table.status),
]);

// Creative Assets Storage
export const mayaCreativeAssets = pgTable("maya_creative_assets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Asset details
  assetType: varchar("asset_type").notNull(), // image, video, template
  originalUrl: varchar("original_url").notNull(), // Original uploaded URL
  processedUrl: varchar("processed_url"), // Processed/optimized URL
  permanentUrl: varchar("permanent_url"), // Migration path
  
  // Metadata
  filename: varchar("filename").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  dimensions: jsonb("dimensions"), // width, height
  
  // Organization
  category: varchar("category"),
  tags: text("tags").array(),
  
  // Processing
  processingStatus: varchar("processing_status").default("pending"),
  errorMessage: text("error_message"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_maya_assets_user").on(table.userId),
  index("idx_maya_assets_type").on(table.assetType),
  index("idx_maya_assets_status").on(table.processingStatus),
]);

// Insert schemas
export const insertMayaGalleryImageSchema = createInsertSchema(mayaGalleryImages);
export const insertMayaCollectionSchema = createInsertSchema(mayaCollections);
export const insertMayaStoryProjectSchema = createInsertSchema(mayaStoryProjects);
export const insertMayaCreativeAssetSchema = createInsertSchema(mayaCreativeAssets);

// Type exports
export type MayaGalleryImage = typeof mayaGalleryImages.$inferSelect;
export type InsertMayaGalleryImage = typeof mayaGalleryImages.$inferInsert;
export type MayaCollection = typeof mayaCollections.$inferSelect;
export type InsertMayaCollection = typeof mayaCollections.$inferInsert;
export type MayaStoryProject = typeof mayaStoryProjects.$inferSelect;
export type InsertMayaStoryProject = typeof mayaStoryProjects.$inferInsert;
export type MayaCreativeAsset = typeof mayaCreativeAssets.$inferSelect;
export type InsertMayaCreativeAsset = typeof mayaCreativeAssets.$inferInsert;