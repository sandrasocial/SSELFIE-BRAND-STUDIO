// Maya API Validation Schemas
import { z } from 'zod';

export const userPreferencesSchema = z.object({
  stylePreferences: z.array(z.string()).optional(),
  brandGuidelines: z.string().optional(),
  contentTone: z.string().optional(),
  targetAudience: z.string().optional(),
});

export const conceptCardSchema = z.object({
  title: z.string().min(1).max(100),
  prompt: z.string().min(1).max(2000),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const mayaErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.record(z.unknown()).optional(),
});

export const mayaPromptRequestSchema = z.object({
  input: z.string().min(1).max(5000).trim(),
  context: z.object({
    userPreferences: userPreferencesSchema.optional(),
    previousResponses: z.array(z.unknown()).optional(),
    chatHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1),
    })).optional(),
  }).optional(),
});

export const mayaChatRequestSchema = z.object({
  message: z.string().min(1).max(5000).trim(),
  chatId: z.number().int().positive().optional(),
  chatHistory: z.array(z.object({
    user: z.string().optional(),
    maya: z.string().optional(),
    response: z.string().optional(),
  })).optional(),
  context: z.record(z.unknown()).optional(),
});

export const mayaGenerateRequestSchema = z.object({
  prompt: z.string().min(1).max(2000).trim(),
  style: z.string().max(100).optional(),
  count: z.number().int().min(1).max(4).default(2),
  conceptName: z.string().max(100).optional(),
  seed: z.string().max(50).optional(),
});

export const mayaCreateChatRequestSchema = z.object({
  title: z.string().max(200).optional(),
  initialMessage: z.string().min(1).max(5000).trim().optional(),
});

export const mayaVideoPromptRequestSchema = z.object({
  imageUrl: z.string().url(),
});

// Validation functions
export function validateMayaPromptRequest(data: unknown) {
  return mayaPromptRequestSchema.safeParse(data);
}

export function validateMayaChatRequest(data: unknown) {
  return mayaChatRequestSchema.safeParse(data);
}

export function validateMayaGenerateRequest(data: unknown) {
  return mayaGenerateRequestSchema.safeParse(data);
}

export function validateMayaCreateChatRequest(data: unknown) {
  return mayaCreateChatRequestSchema.safeParse(data);
}

export function validateMayaVideoPromptRequest(data: unknown) {
  return mayaVideoPromptRequestSchema.safeParse(data);
}