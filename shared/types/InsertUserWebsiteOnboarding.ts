import { pgTable, text, timestamp, uuid, jsonb, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Existing tables remain unchanged...

// User Website Onboarding Table
export const userWebsiteOnboarding = pgTable("user_website_onboarding", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  targetAudience: text("target_audience").notNull(),
  businessGoals: jsonb("business_goals").notNull(), // Array of goals
  brandPersonality: text("brand_personality").notNull(),
  preferredColors: jsonb("preferred_colors").notNull(), // Array of color preferences
  contentFocus: jsonb("content_focus").notNull(), // Array of content types
  hasExistingBranding: boolean("has_existing_branding").notNull().default(false),
  existingWebsite: text("existing_website"),
  socialMediaHandles: jsonb("social_media_handles"), // Object with platform: handle pairs
  specialRequirements: text("special_requirements"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// User Generated Websites Table
export const userGeneratedWebsites = pgTable("user_generated_websites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  onboardingId: uuid("onboarding_id").notNull().references(() => userWebsiteOnboarding.id, { onDelete: "cascade" }),
  websiteName: text("website_name").notNull(),
  websiteUrl: text("website_url").notNull().unique(), // Generated subdomain
  template: text("template").notNull(),
  colorScheme: jsonb("color_scheme").notNull(), // Generated color palette
  typography: jsonb("typography").notNull(), // Font selections and hierarchy
  layout: jsonb("layout").notNull(), // Page structure and components
  content: jsonb("content").notNull(), // Generated copy and sections
  images: jsonb("images").notNull(), // AI-generated or selected images
  seoData: jsonb("seo_data").notNull(), // Meta titles, descriptions, keywords
  socialLinks: jsonb("social_links"), // Social media integration
  contactInfo: jsonb("contact_info").notNull(), // Business contact details
  features: jsonb("features").notNull(), // Enabled website features
  customCss: text("custom_css"), // Additional styling
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  lastModified: timestamp("last_modified").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Website Builder Conversations Table
export const websiteBuilderConversations = pgTable("website_builder_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  websiteId: uuid("website_id").references(() => userGeneratedWebsites.id, { onDelete: "cascade" }),
  conversationType: text("conversation_type").notNull(), // "onboarding", "editing", "support"
  messages: jsonb("messages").notNull(), // Array of conversation messages
  context: jsonb("context"), // Additional conversation context
  status: text("status").notNull().default("active"), // "active", "completed", "archived"
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Relations for Website Builder Tables
export const userWebsiteOnboardingRelations = relations(userWebsiteOnboarding, ({ one, many }) => ({
  user: one(users, {
    fields: [userWebsiteOnboarding.userId],
    references: [users.id],
  }),
  websites: many(userGeneratedWebsites),
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
  conversations: many(websiteBuilderConversations),
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

// Zod Schemas for Website Builder Tables
export const insertUserWebsiteOnboardingSchema = createInsertSchema(userWebsiteOnboarding);
export const selectUserWebsiteOnboardingSchema = createSelectSchema(userWebsiteOnboarding);
export type InsertUserWebsiteOnboarding = z.infer<typeof insertUserWebsiteOnboardingSchema>;
export type SelectUserWebsiteOnboarding = z.infer<typeof selectUserWebsiteOnboardingSchema>;

export const insertUserGeneratedWebsitesSchema = createInsertSchema(userGeneratedWebsites);
export const selectUserGeneratedWebsitesSchema = createSelectSchema(userGeneratedWebsites);
export type InsertUserGeneratedWebsites = z.infer<typeof insertUserGeneratedWebsitesSchema>;
export type SelectUserGeneratedWebsites = z.infer<typeof selectUserGeneratedWebsitesSchema>;

export const insertWebsiteBuilderConversationsSchema = createInsertSchema(websiteBuilderConversations);
export const selectWebsiteBuilderConversationsSchema = createSelectSchema(websiteBuilderConversations);
export type InsertWebsiteBuilderConversations = z.infer<typeof insertWebsiteBuilderConversationsSchema>;
export type SelectWebsiteBuilderConversations = z.infer<typeof selectWebsiteBuilderConversationsSchema>;

// Update users relations to include website builder relationships
export const usersRelations = relations(users, ({ many }) => ({
  aiImages: many(aiImages),
  subscriptions: many(subscriptions),
  websiteOnboarding: many(userWebsiteOnboarding),
  generatedWebsites: many(userGeneratedWebsites),
  websiteConversations: many(websiteBuilderConversations),
}));