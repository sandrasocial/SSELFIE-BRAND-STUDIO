import { pgTable, serial, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { users } from "./schema.js";
export const userSimplifiedProfile = pgTable('user_simplified_profile', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    transformationStory: text('transformation_story'),
    currentSituation: text('current_situation'),
    futureVision: text('future_vision'),
    businessGoals: text('business_goals'),
    businessType: varchar('business_type'),
    stylePreferences: text('style_preferences'),
    photoGoals: text('photo_goals'),
    isCompleted: boolean('is_completed').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const insertUserSimplifiedProfileSchema = createInsertSchema(userSimplifiedProfile).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
export const BUSINESS_TYPES = [
    'Coach/Consultant',
    'Entrepreneur',
    'Creative Professional',
    'Corporate Executive',
    'Content Creator',
    'Real Estate Agent',
    'Healthcare Professional',
    'Legal Professional',
    'Financial Advisor',
    'Other'
];
//# sourceMappingURL=schema-maya-simplified.js.map