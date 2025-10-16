/// <reference path="./types/global.d.ts" />
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User styleguides created by SANDRA AI
export const userStyleguides = pgTable("user_styleguides", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  templateId: varchar("template_id").notNull(), // refined-minimal, luxe-feminine, bold-femme, executive-essence, creative-bold
  title: varchar("title").notNull(),
  subtitle: varchar("subtitle"),
  personalMission: text("personal_mission"),
  brandVoice: text("brand_voice"),
  targetAudience: text("target_audience"),
  visualStyle: text("visual_style"),
  colorPalette: jsonb("color_palette"),
  typography: jsonb("typography"),
  imageSelections: jsonb("image_selections"),
  brandPersonality: jsonb("brand_personality"),
  businessApplications: jsonb("business_applications"),
  customizations: jsonb("customizations"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Styleguide templates for SANDRA AI to use as starting points
export const styleguideTemplates = pgTable("styleguide_templates", {
  id: varchar("id").primaryKey(), // refined-minimal, luxe-feminine, etc.
  name: varchar("name").notNull(),
  description: text("description"),
  colorScheme: jsonb("color_scheme"),
  typographySetup: jsonb("typography_setup"),
  layoutStructure: jsonb("layout_structure"),
  targetPersonality: jsonb("target_personality"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserStyleguide = typeof userStyleguides.$inferSelect;
export type InsertUserStyleguide = typeof userStyleguides.$inferInsert;
export type StyleguideTemplate = typeof styleguideTemplates.$inferSelect;
export type InsertStyleguideTemplate = typeof styleguideTemplates.$inferInsert;

// @ts-ignore - Drizzle ORM schema type compatibility
export const insertUserStyleguideSchema = createInsertSchema(userStyleguides).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// @ts-ignore - Drizzle ORM schema type compatibility
export const insertStyleguideTemplateSchema = createInsertSchema(styleguideTemplates).omit({
  createdAt: true
});