"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertStyleguideTemplateSchema = exports.insertUserStyleguideSchema = exports.styleguideTemplates = exports.userStyleguides = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// User styleguides created by SANDRA AI
exports.userStyleguides = (0, pg_core_1.pgTable)("user_styleguides", {
    id: (0, pg_core_1.integer)("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    templateId: (0, pg_core_1.varchar)("template_id").notNull(), // refined-minimal, luxe-feminine, bold-femme, executive-essence, creative-bold
    title: (0, pg_core_1.varchar)("title").notNull(),
    subtitle: (0, pg_core_1.varchar)("subtitle"),
    personalMission: (0, pg_core_1.text)("personal_mission"),
    brandVoice: (0, pg_core_1.text)("brand_voice"),
    targetAudience: (0, pg_core_1.text)("target_audience"),
    visualStyle: (0, pg_core_1.text)("visual_style"),
    colorPalette: (0, pg_core_1.jsonb)("color_palette").$type(),
    typography: (0, pg_core_1.jsonb)("typography").$type(),
    imageSelections: (0, pg_core_1.jsonb)("image_selections").$type(),
    brandPersonality: (0, pg_core_1.jsonb)("brand_personality").$type(),
    businessApplications: (0, pg_core_1.jsonb)("business_applications").$type(),
    customizations: (0, pg_core_1.jsonb)("customizations").$type(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Styleguide templates for SANDRA AI to use as starting points
exports.styleguideTemplates = (0, pg_core_1.pgTable)("styleguide_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey(), // refined-minimal, luxe-feminine, etc.
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    colorScheme: (0, pg_core_1.jsonb)("color_scheme").$type(),
    typographySetup: (0, pg_core_1.jsonb)("typography_setup").$type(),
    layoutStructure: (0, pg_core_1.jsonb)("layout_structure").$type(),
    targetPersonality: (0, pg_core_1.jsonb)("target_personality").$type(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertUserStyleguideSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userStyleguides);
exports.insertStyleguideTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.styleguideTemplates);
