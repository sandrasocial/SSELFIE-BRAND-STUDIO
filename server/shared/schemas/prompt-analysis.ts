import { pgTable, text, uuid, decimal, boolean, timestamp } from 'drizzle-orm/pg-core';

export const promptAnalysis = pgTable('prompt_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  originalPrompt: text('original_prompt').notNull(),
  generatedPrompt: text('generated_prompt'),
  conceptTitle: text('concept_title'),
  category: text('category'),
  wasGenerated: boolean('was_generated').notNull().default(false),
  wasFavorited: boolean('was_favorited').notNull().default(false),
  wasSaved: boolean('was_saved').notNull().default(false),
  wasApplied: boolean('was_applied').notNull().default(false),
  wasShared: boolean('was_shared').notNull().default(false),
  wasCustomized: boolean('was_customized').notNull().default(false),
  successScore: decimal('success_score', { precision: 3, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});