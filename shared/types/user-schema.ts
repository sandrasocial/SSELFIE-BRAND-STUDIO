import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  subscriptionStatus: text("subscription_status").default("free"),
  isAdmin: boolean("is_admin").default(false),
  avatarUrl: text("avatar_url"),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  status: text("status").notNull(),
  priceId: text("price_id"),
  customerId: text("customer_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Images table
export const aiImages = pgTable("ai_images", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Website Onboarding table
export const userWebsiteOnboarding = pgTable("user_website_onboarding", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  businessDescription: text("business_description").notNull(),
  targetAudience: text("target_audience").notNull(),
  websiteGoals: text("website_goals").notNull(),
  brandPersonality: text("brand_personality").notNull(),
  preferredColors: text("preferred_colors"),
  competitorUrls: text("competitor_urls"),
  specialFeatures: text("special_features"),
  contentSections: text("content_sections"),
  callToAction: text("call_to_action"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Generated Websites table
export const userGeneratedWebsites = pgTable("user_generated_websites", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  onboardingId: text("onboarding_id").references(() => userWebsiteOnboarding.id),
  websiteName: text("website_name").notNull(),
  websiteStructure: jsonb("website_structure").notNull(), // Store complete website structure
  designTheme: text("design_theme").notNull(),
  colorScheme: jsonb("color_scheme"),
  typography: jsonb("typography"),
  layout: jsonb("layout"),
  content: jsonb("content"), // Store all website content
  images: jsonb("images"), // Store image references and metadata
  seoSettings: jsonb("seo_settings"),
  customDomain: text("custom_domain"),
  isPublished: boolean("is_published").default(false),
  publishedUrl: text("published_url"),
  lastPublished: timestamp("last_published"),
  version: integer("version").default(1),
  status: text("status").default("draft"), // draft, published, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Website Builder Conversations table
export const websiteBuilderConversations = pgTable("website_builder_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  websiteId: text("website_id").references(() => userGeneratedWebsites.id),
  conversationHistory: jsonb("conversation_history").notNull(), // Array of messages
  currentContext: jsonb("current_context"), // Current state of the conversation
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  aiImages: many(aiImages),
  websiteOnboarding: many(userWebsiteOnboarding),
  generatedWebsites: many(userGeneratedWebsites),
  builderConversations: many(websiteBuilderConversations),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const aiImagesRelations = relations(aiImages, ({ one }) => ({
  user: one(users, {
    fields: [aiImages.userId],
    references: [users.id],
  }),
}));

export const userWebsiteOnboardingRelations = relations(userWebsiteOnboarding, ({ one, many }) => ({
  user: one(users, {
    fields: [userWebsiteOnboarding.userId],
    references: [users.id],
  }),
  generatedWebsites: many(userGeneratedWebsites),
}));

export const userGeneratedWebsitesRelations = relations(userGeneratedWebsites, ({ one, many }) => ({
  user: one(users, {
    fields: [userGeneratedWebsites.userId],
    references: [users.id],
  }),
  onboarding: one(userWebsiteOnboarding, {
    fields: [userGeneratedWebsites.onboardingId],
    references: [userWebsiteOnboarding.id],
  }),
  builderConversations: many(websiteBuilderConversations),
}));

export const websiteBuilderConversationsRelations = relations(websiteBuilderConversations, ({ one }) => ({
  user: one(users, {
    fields: [websiteBuilderConversations.userId],
    references: [users.id],
  }),
  website: one(userGeneratedWebsites, {
    fields: [websiteBuilderConversations.websiteId],
    references: [userGeneratedWebsites.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type AiImage = typeof aiImages.$inferSelect;
export type NewAiImage = typeof aiImages.$inferInsert;

export type UserWebsiteOnboarding = typeof userWebsiteOnboarding.$inferSelect;
export type NewUserWebsiteOnboarding = typeof userWebsiteOnboarding.$inferInsert;

export type UserGeneratedWebsite = typeof userGeneratedWebsites.$inferSelect;
export type NewUserGeneratedWebsite = typeof userGeneratedWebsites.$inferInsert;

export type WebsiteBuilderConversation = typeof websiteBuilderConversations.$inferSelect;
export type NewWebsiteBuilderConversation = typeof websiteBuilderConversations.$inferInsert;