import { pgTable, serial, integer, timestamp, text, json } from 'drizzle-orm/pg-core';

export const claudeConversations = pgTable('claude_conversations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  contextType: text('context_type').notNull(),
  contextData: json('context_data').notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  status: text('status').notNull().default('active')
});

export const claudeMessages = pgTable('claude_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => claudeConversations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  metadata: json('metadata'),
  status: text('status').notNull().default('pending'),
  version: integer('version').notNull().default(1),
  promptTokens: integer('prompt_tokens').notNull().default(0),
  completionTokens: integer('completion_tokens').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  finishReason: text('finish_reason')
});