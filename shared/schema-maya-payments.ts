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
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from './schema.js';

// Maya Subscriptions
export const mayaSubscriptions = pgTable("maya_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Subscription details
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  plan: varchar("plan").notNull(), // 'luxury'
  status: varchar("status").notNull(), // active, cancelled, expired
  
  // Billing
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  
  // Features
  generationsPerMonth: integer("generations_per_month").default(100),
  generationsUsed: integer("generations_used").default(0),
  generationsRemaining: integer("generations_remaining"),
  storyStudioEnabled: boolean("story_studio_enabled").default(true),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  cancelledAt: timestamp("cancelled_at"),
}, (table) => [
  index("idx_maya_subscriptions_user").on(table.userId),
  index("idx_maya_subscriptions_status").on(table.status),
]);

// Maya Payments
export const mayaPayments = pgTable("maya_payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Payment details
  stripeSessionId: varchar("stripe_session_id").unique(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency").default("eur"),
  
  // Status
  status: varchar("status").default("pending"), // pending, succeeded, failed
  paymentMethod: varchar("payment_method"), // card, sepa, etc.
  errorMessage: text("error_message"),
  
  // Metadata
  customerEmail: varchar("customer_email"),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional payment data
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  succeededAt: timestamp("succeeded_at"),
}, (table) => [
  index("idx_maya_payments_user").on(table.userId),
  index("idx_maya_payments_status").on(table.status),
  index("idx_maya_payments_session").on(table.stripeSessionId),
]);

// Usage Tracking
export const mayaUsageTracking = pgTable("maya_usage_tracking", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Usage details
  actionType: varchar("action_type").notNull(), // generation, story-studio, etc.
  resourceType: varchar("resource_type").notNull(), // image, video, etc.
  
  // Cost tracking
  cost: decimal("cost", { precision: 10, scale: 4 }), // Actual cost in EUR
  quotaUsed: integer("quota_used").default(1), // Generations used
  
  // Technical details
  modelId: varchar("model_id"), // Associated model
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  
  // Metadata
  requestId: varchar("request_id"),
  metadata: jsonb("metadata"), // Additional usage data
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_maya_usage_user").on(table.userId),
  index("idx_maya_usage_action").on(table.actionType),
  index("idx_maya_usage_date").on(table.createdAt),
]);

// Usage Budgets & Limits
export const mayaUsageBudgets = pgTable("maya_usage_budgets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Budget settings
  budgetType: varchar("budget_type").notNull(), // monthly, custom
  generationLimit: integer("generation_limit").notNull(),
  resetDate: timestamp("reset_date"),
  
  // Usage tracking
  currentUsage: integer("current_usage").default(0),
  isLimitReached: boolean("is_limit_reached").default(false),
  alertThreshold: integer("alert_threshold").default(80), // Percentage
  
  // Status
  isActive: boolean("is_active").default(true),
  isOverridden: boolean("is_overridden").default(false),
  overrideReason: text("override_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_maya_budgets_user").on(table.userId),
  index("idx_maya_budgets_active").on(table.isActive),
]);

// Insert schemas
export const insertMayaSubscriptionSchema = createInsertSchema(mayaSubscriptions);
export const insertMayaPaymentSchema = createInsertSchema(mayaPayments);
export const insertMayaUsageTrackingSchema = createInsertSchema(mayaUsageTracking);
export const insertMayaUsageBudgetSchema = createInsertSchema(mayaUsageBudgets);

// Type exports
export type MayaSubscription = typeof mayaSubscriptions.$inferSelect;
export type InsertMayaSubscription = typeof mayaSubscriptions.$inferInsert;
export type MayaPayment = typeof mayaPayments.$inferSelect;
export type InsertMayaPayment = typeof mayaPayments.$inferInsert;
export type MayaUsageTracking = typeof mayaUsageTracking.$inferSelect;
export type InsertMayaUsageTracking = typeof mayaUsageTracking.$inferInsert;
export type MayaUsageBudget = typeof mayaUsageBudgets.$inferSelect;
export type InsertMayaUsageBudget = typeof mayaUsageBudgets.$inferInsert;