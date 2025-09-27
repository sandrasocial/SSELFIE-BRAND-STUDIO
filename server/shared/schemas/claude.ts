import { pgTable, text, serial, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const claudeConversations = pgTable('claude_conversations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  contextData: jsonb('context_data'),
  title: text('title').notNull(),
  contextType: text('context_type').notNull(),
  status: text('status').notNull().default('active'),
  summary: text('summary'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const claudeMessages = pgTable('claude_messages', {
  id: serial('id').primaryKey(),
  conversationId: serial('conversation_id').references(() => claudeConversations.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});