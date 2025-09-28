import { z } from 'zod';

// Notification type definitions
export const NotificationTypeSchema = z.enum([
  'model_ready',           // AI model training complete
  'payment_success',       // Payment processed
  'training_progress',     // Training status updates
  'generation_complete',   // Image generation complete
  'error',                // Error notifications
  'welcome',              // Onboarding notifications
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

// Notification priority levels
export const NotificationPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
]);

export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

// Notification delivery channels
export const NotificationChannelSchema = z.enum([
  'in_app',
  'email',
  'push'
]);

export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

// Main notification schema
export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  channels: z.array(NotificationChannelSchema),
  title: z.string(),
  message: z.string(),
  actionUrl: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.number(),
  expiresAt: z.number().optional(),
  read: z.boolean().default(false),
  dismissed: z.boolean().default(false),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Notification template schema
export const NotificationTemplateSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  channels: z.array(NotificationChannelSchema),
  titleTemplate: z.string(),
  messageTemplate: z.string(),
  actionUrlTemplate: z.string().optional(),
});

export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;