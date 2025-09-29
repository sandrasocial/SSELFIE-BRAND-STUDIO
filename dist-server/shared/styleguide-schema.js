import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const userStyleguides = pgTable("user_styleguides", {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: varchar("user_id").notNull(),
    templateId: varchar("template_id").notNull(),
    title: varchar("title").notNull(),
    subtitle: varchar("subtitle"),
    personalMission: text("personal_mission"),
    brandVoice: text("brand_voice"),
    targetAudience: text("target_audience"),
    visualStyle: text("visual_style"),
    colorPalette: jsonb("color_palette").$type(),
    typography: jsonb("typography").$type(),
    imageSelections: jsonb("image_selections").$type(),
    brandPersonality: jsonb("brand_personality").$type(),
    businessApplications: jsonb("business_applications").$type(),
    customizations: jsonb("customizations").$type(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const styleguideTemplates = pgTable("styleguide_templates", {
    id: varchar("id").primaryKey(),
    name: varchar("name").notNull(),
    description: text("description"),
    colorScheme: jsonb("color_scheme").$type(),
    typographySetup: jsonb("typography_setup").$type(),
    layoutStructure: jsonb("layout_structure").$type(),
    targetPersonality: jsonb("target_personality").$type(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const insertUserStyleguideSchema = createInsertSchema(userStyleguides);
export const insertStyleguideTemplateSchema = createInsertSchema(styleguideTemplates);
//# sourceMappingURL=styleguide-schema.js.map