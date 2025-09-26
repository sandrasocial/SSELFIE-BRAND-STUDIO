import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from './schema.js';

// Training Session Management
export const mayaTrainingSessions = pgTable("maya_training_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Training progress
  status: varchar("status").default("pending"), // pending, uploading, training, completed, failed
  progress: integer("progress").default(0),
  estimatedTimeRemaining: integer("estimated_time_remaining"), // in minutes
  
  // Training metadata
  trainingId: varchar("training_id"), // External training ID
  trainingModelPath: varchar("training_model_path"), // Final model path
  triggerWord: varchar("trigger_word").unique(), // Unique trigger word
  
  // Images and data
  trainingImageUrls: jsonb("training_image_urls").default([]), // Array of S3 URLs
  imageCount: integer("image_count").default(0),
  datasetZipUrl: text("dataset_zip_url"), // S3 URL of zipped dataset
  
  // Error handling
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  isRetrying: boolean("is_retrying").default(false),
  
  // Technical details
  modelType: varchar("model_type").default("flux-dev"),
  trainingParams: jsonb("training_params"), // Training configuration
  
  // Timestamps
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_maya_training_user").on(table.userId),
  index("idx_maya_training_status").on(table.status),
  index("idx_maya_training_trigger").on(table.triggerWord),
]);

// Model Management
export const mayaModels = pgTable("maya_models", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Model identifiers
  modelId: varchar("model_id").notNull(), // External model ID
  modelVersion: varchar("model_version"), // Model version
  triggerWord: varchar("trigger_word").notNull().unique(),
  
  // Model metadata
  modelType: varchar("model_type").default("flux-dev"),
  status: varchar("status").default("active"), // active, archived
  
  // Technical details
  trainingSessionId: integer("training_session_id")
    .references(() => mayaTrainingSessions.id),
  modelConfig: jsonb("model_config"), // Model configuration
  performanceMetrics: jsonb("performance_metrics"), // Quality metrics
  
  // Usage tracking
  totalGenerations: integer("total_generations").default(0),
  lastUsedAt: timestamp("last_used_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_maya_models_user").on(table.userId),
  index("idx_maya_models_trigger").on(table.triggerWord),
]);

// Model Performance Tracking
export const mayaModelMetrics = pgTable("maya_model_metrics", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => mayaModels.id, { onDelete: "cascade" }).notNull(),
  
  // Generation metrics
  generationCount: integer("generation_count").default(0),
  averageGenerationTime: integer("average_generation_time"), // in ms
  successRate: integer("success_rate"), // percentage
  
  // Quality metrics
  userSatisfactionScore: integer("user_satisfaction_score"), // 0-100
  imageQualityScore: integer("image_quality_score"), // 0-100
  
  // Technical metrics
  errorCount: integer("error_count").default(0),
  averageTokenCount: integer("average_token_count"),
  
  // Timestamps
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_maya_metrics_model").on(table.modelId),
  index("idx_maya_metrics_period").on(table.periodStart, table.periodEnd),
]);

// Insert schemas
export const insertMayaTrainingSessionSchema = createInsertSchema(mayaTrainingSessions);
export const insertMayaModelSchema = createInsertSchema(mayaModels);
export const insertMayaModelMetricsSchema = createInsertSchema(mayaModelMetrics);

// Type exports
export type MayaTrainingSession = typeof mayaTrainingSessions.$inferSelect;
export type InsertMayaTrainingSession = typeof mayaTrainingSessions.$inferInsert;
export type MayaModel = typeof mayaModels.$inferSelect;
export type InsertMayaModel = typeof mayaModels.$inferInsert;
export type MayaModelMetrics = typeof mayaModelMetrics.$inferSelect;
export type InsertMayaModelMetrics = typeof mayaModelMetrics.$inferInsert;