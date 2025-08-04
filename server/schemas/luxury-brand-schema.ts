/**
 * SSELFIE Studio Luxury Brand Database Schema
 * Enterprise-grade database architecture with Drizzle ORM
 * 
 * This schema demonstrates our premium backend approach:
 * - Type-safe database operations with Drizzle ORM
 * - Optimized indexes for performance at scale
 * - Rich relationships and constraints
 * - Audit trail and versioning support
 * - Elegant JSON column usage for flexibility
 */

import { pgTable, text, timestamp, uuid, json, varchar, integer, boolean, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User table with luxury account features
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  avatar: text('avatar'),
  subscription: varchar('subscription', { length: 20 }).notNull().default('free'), // free, premium, enterprise
  
  // Luxury user preferences
  preferences: json('preferences').$type<{
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    brandingStyle: 'luxury' | 'editorial' | 'minimalist' | 'bold';
    preferredFonts: string[];
  }>().default({
    theme: 'light',
    notifications: true,
    brandingStyle: 'luxury',
    preferredFonts: ['Times New Roman']
  }),
  
  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  subscriptionIdx: index('users_subscription_idx').on(table.subscription),
}));

// Brand table - core of SSELFIE Studio
export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Brand identity
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  description: text('description'),
  
  // Brand style configuration
  style: varchar('style', { length: 20 }).notNull(), // luxury, editorial, minimalist, bold
  colors: json('colors').$type<string[]>().notNull().default([]),
  
  // Brand personality (AI-generated and refined)
  personality: json('personality').$type<{
    tone: string;
    values: string[];
    targetAudience: string;
    brandVoice: string;
    emotionalTriggers: string[];
    competitiveAdvantages: string[];
  }>().notNull(),
  
  // Visual assets
  assets: json('assets').$type<{
    logo: string;
    logoVariations: string[];
    colorPalette: string[];
    typography: {
      primary: string;
      secondary: string;
      accent: string;
    };
    guidelines: string;
    templateIds: string[];
  }>().default({
    logo: '',
    logoVariations: [],
    colorPalette: [],
    typography: {
      primary: 'Times New Roman',
      secondary: 'Arial',
      accent: 'Georgia'
    },
    guidelines: '',
    templateIds: []
  }),
  
  // Brand status and analytics
  status: varchar('status', { length: 20 }).notNull().default('creating'), // creating, ready, error, archived
  visibility: varchar('visibility', { length: 20 }).notNull().default('private'), // private, public, unlisted
  
  // Performance metrics
  metrics: json('metrics').$type<{
    views: number;
    shares: number;
    downloads: number;
    engagementRate: number;
    lastActivityAt: string;
  }>().default({
    views: 0,
    shares: 0,
    downloads: 0,
    engagementRate: 0,
    lastActivityAt: new Date().toISOString()
  }),
  
  // Audit and versioning
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
}, (table) => ({
  userIdIdx: index('brands_user_id_idx').on(table.userId),
  statusIdx: index('brands_status_idx').on(table.status),
  styleIdx: index('brands_style_idx').on(table.style),
  visibilityIdx: index('brands_visibility_idx').on(table.visibility),
  slugUniqueIdx: unique('brands_slug_unique').on(table.userId, table.slug),
}));

// Brand assets table for detailed media management
export const brandAssets = pgTable('brand_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  
  // Asset details
  type: varchar('type', { length: 50 }).notNull(), // logo, image, video, document, template
  category: varchar('category', { length: 50 }).notNull(), // primary, secondary, social, print
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  
  // File information
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(), // bytes
  dimensions: json('dimensions').$type<{
    width: number;
    height: number;
    aspectRatio: string;
  }>(),
  
  // Asset metadata
  metadata: json('metadata').$type<{
    colors: string[];
    tags: string[];
    aiGenerated: boolean;
    generationPrompt?: string;
    usage: string[]; // web, print, social, email
    licenses: string[];
  }>().default({
    colors: [],
    tags: [],
    aiGenerated: false,
    usage: [],
    licenses: []
  }),
  
  // Usage tracking
  downloadCount: integer('download_count').notNull().default(0),
  lastDownloadAt: timestamp('last_download_at'),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, archived, deleted
  isPublic: boolean('is_public').default(false),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  brandIdIdx: index('brand_assets_brand_id_idx').on(table.brandId),
  typeIdx: index('brand_assets_type_idx').on(table.type),
  statusIdx: index('brand_assets_status_idx').on(table.status),
  mimeTypeIdx: index('brand_assets_mime_type_idx').on(table.mimeType),
}));

// Brand generation history for AI tracking and improvement
export const brandGenerations = pgTable('brand_generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Generation details
  type: varchar('type', { length: 50 }).notNull(), // initial, refinement, variation, update
  prompt: text('prompt').notNull(),
  
  // AI model information
  model: varchar('model', { length: 100 }).notNull(),
  modelVersion: varchar('model_version', { length: 50 }),
  parameters: json('parameters').$type<{
    temperature: number;
    style: string;
    seed?: number;
    iterations: number;
  }>(),
  
  // Results
  results: json('results').$type<{
    brandName: string;
    colors: string[];
    personality: any;
    assets: any[];
    confidence: number;
    alternatives: any[];
  }>(),
  
  // Performance metrics
  processingTime: integer('processing_time'), // milliseconds
  cost: integer('cost'), // credits used
  userRating: integer('user_rating'), // 1-5 stars
  userFeedback: text('user_feedback'),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('completed'), // pending, completed, failed, cancelled
  
  // Audit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  brandIdIdx: index('brand_generations_brand_id_idx').on(table.brandId),
  userIdIdx: index('brand_generations_user_id_idx').on(table.userId),
  typeIdx: index('brand_generations_type_idx').on(table.type),
  statusIdx: index('brand_generations_status_idx').on(table.status),
  createdAtIdx: index('brand_generations_created_at_idx').on(table.createdAt),
}));

// Elegant relationship definitions
export const usersRelations = relations(users, ({ many }) => ({
  brands: many(brands),
  generations: many(brandGenerations),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, {
    fields: [brands.userId],
    references: [users.id],
  }),
  assets: many(brandAssets),
  generations: many(brandGenerations),
}));

export const brandAssetsRelations = relations(brandAssets, ({ one }) => ({
  brand: one(brands, {
    fields: [brandAssets.brandId],
    references: [brands.id],
  }),
}));

export const brandGenerationsRelations = relations(brandGenerations, ({ one }) => ({
  brand: one(brands, {
    fields: [brandGenerations.brandId],
    references: [brands.id],
  }),
  user: one(users, {
    fields: [brandGenerations.userId],
    references: [users.id],
  }),
}));

// Type exports for frontend usage
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type BrandAsset = typeof brandAssets.$inferSelect;
export type NewBrandAsset = typeof brandAssets.$inferInsert;
export type BrandGeneration = typeof brandGenerations.$inferSelect;
export type NewBrandGeneration = typeof brandGenerations.$inferInsert;