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
  colorPalette: jsonb("color_palette").$type<{
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  }>(),
  typography: jsonb("typography").$type<{
    headline: string;
    subheading: string;
    body: string;
    accent: string;
  }>(),
  imageSelections: jsonb("image_selections").$type<{
    heroImage: string;
    portraitImages: string[];
    lifestyleImages: string[];
    flatlayImages: string[];
  }>(),
  brandPersonality: jsonb("brand_personality").$type<{
    traits: string[];
    keywords: string[];
    vibe: string;
  }>(),
  businessApplications: jsonb("business_applications").$type<{
    primaryService: string;
    priceRange: string;
    clientExperience: string;
  }>(),
  customizations: jsonb("customizations").$type<{
    sections: string[];
    layout: string;
    additionalElements: string[];
  }>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Styleguide templates for SANDRA AI to use as starting points
export const styleguideTemplates = pgTable("styleguide_templates", {
  id: varchar("id").primaryKey(), // refined-minimal, luxe-feminine, etc.
  name: varchar("name").notNull(),
  description: text("description"),
  colorScheme: jsonb("color_scheme").$type<{
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  }>(),
  typographySetup: jsonb("typography_setup").$type<{
    headline: string;
    subheading: string;
    body: string;
    accent: string;
  }>(),
  layoutStructure: jsonb("layout_structure").$type<{
    heroStyle: string;
    sectionLayout: string;
    imagePlacement: string;
  }>(),
  targetPersonality: jsonb("target_personality").$type<{
    traits: string[];
    industries: string[];
    vibe: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserStyleguide = typeof userStyleguides.$inferSelect;
export type InsertUserStyleguide = typeof userStyleguides.$inferInsert;
export type StyleguideTemplate = typeof styleguideTemplates.$inferSelect;
export type InsertStyleguideTemplate = typeof styleguideTemplates.$inferInsert;

export const insertUserStyleguideSchema = createInsertSchema(userStyleguides);
export const insertStyleguideTemplateSchema = createInsertSchema(styleguideTemplates);