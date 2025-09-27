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

// Migration monitoring tables
export const schemaMigrationLog = pgTable("schema_migration_log", {
  id: serial("id").primaryKey(),
  phase: varchar("phase", { length: 50 }).notNull(), // preparation, migration, verification, rollback
  operation: varchar("operation", { length: 255 }).notNull(), // specific operation being performed
  status: varchar("status", { length: 50 }).notNull(), // pending, in_progress, completed, failed, rolled_back
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Additional context about the operation
  rowsAffected: integer("rows_affected"),
  duration: integer("duration"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  phaseIdx: index("idx_migration_phase").on(table.phase),
  statusIdx: index("idx_migration_status").on(table.status),
  createdIdx: index("idx_migration_created").on(table.createdAt),
}));

// Performance monitoring
export const queryPerformanceLog = pgTable("query_performance_log", {
  id: serial("id").primaryKey(),
  queryHash: varchar("query_hash", { length: 64 }).notNull(), // Hash of the query for grouping
  executionTime: integer("execution_time").notNull(), // milliseconds
  rowsAffected: integer("rows_affected"),
  queryContext: varchar("query_context", { length: 255 }), // e.g., "gallery_migration"
  tableName: varchar("table_name", { length: 255 }), // affected table
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Query parameters or other context
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  hashIdx: index("idx_perf_query_hash").on(table.queryHash),
  contextIdx: index("idx_perf_context").on(table.queryContext),
  timeIdx: index("idx_perf_time").on(table.executionTime),
}));

// Verification tracking
export const migrationVerification = pgTable("migration_verification", {
  id: serial("id").primaryKey(),
  sourceTable: varchar("source_table", { length: 255 }).notNull(),
  targetTable: varchar("target_table", { length: 255 }).notNull(),
  verificationType: varchar("verification_type", { length: 50 }).notNull(), // row_count, data_integrity, fk_check
  sourceCount: integer("source_count"),
  targetCount: integer("target_count"),
  matchingRows: integer("matching_rows"),
  discrepancies: jsonb("discrepancies"), // Details of any mismatches
  status: varchar("status", { length: 50 }).notNull(), // pending, in_progress, passed, failed
  lastVerifiedAt: timestamp("last_verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sourceIdx: index("idx_verify_source").on(table.sourceTable),
  targetIdx: index("idx_verify_target").on(table.targetTable),
  statusIdx: index("idx_verify_status").on(table.status),
}));

// Schema validation snapshots
export const schemaSnapshot = pgTable("schema_snapshot", {
  id: serial("id").primaryKey(),
  tableName: varchar("table_name", { length: 255 }).notNull(),
  columnCount: integer("column_count").notNull(),
  rowCount: integer("row_count").notNull(),
  indexCount: integer("index_count").notNull(),
  foreignKeys: jsonb("foreign_keys"), // Array of FK relationships
  schema: jsonb("schema").notNull(), // Full table schema
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tableIdx: index("idx_snapshot_table").on(table.tableName),
  createdIdx: index("idx_snapshot_created").on(table.createdAt),
}));

// Insert schemas
export const insertMigrationLogSchema = createInsertSchema(schemaMigrationLog);
export const insertPerformanceLogSchema = createInsertSchema(queryPerformanceLog);
export const insertVerificationSchema = createInsertSchema(migrationVerification);
export const insertSnapshotSchema = createInsertSchema(schemaSnapshot);

// Type exports
export type SchemaMigrationLog = typeof schemaMigrationLog.$inferSelect;
export type InsertSchemaMigrationLog = typeof schemaMigrationLog.$inferInsert;
export type QueryPerformanceLog = typeof queryPerformanceLog.$inferSelect;
export type InsertQueryPerformanceLog = typeof queryPerformanceLog.$inferInsert;
export type MigrationVerification = typeof migrationVerification.$inferSelect;
export type InsertMigrationVerification = typeof migrationVerification.$inferInsert;
export type SchemaSnapshot = typeof schemaSnapshot.$inferSelect;
export type InsertSchemaSnapshot = typeof schemaSnapshot.$inferInsert;