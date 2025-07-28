// SSELFIE Studio Agent Bridge - Database Schema
// Agent task storage and execution tracking tables

import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

export const agentTasks = pgTable('agent_tasks', {
  taskId: uuid('task_id').primaryKey().defaultRandom(),
  agentName: text('agent_name').notNull(),
  instruction: text('instruction').notNull(),
  conversationContext: jsonb('conversation_context').$type<string[]>(),
  priority: text('priority').$type<'high' | 'medium' | 'low'>().default('medium'),
  completionCriteria: jsonb('completion_criteria').$type<string[]>(),
  qualityGates: jsonb('quality_gates').$type<string[]>(),
  estimatedDuration: integer('estimated_duration').notNull(), // in minutes
  status: text('status').default('received'),
  progress: integer('progress').default(0),
  implementations: jsonb('implementations'),
  rollbackPlan: jsonb('rollback_plan').$type<string[]>(),
  validationResults: jsonb('validation_results'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

export type AgentTaskDB = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;