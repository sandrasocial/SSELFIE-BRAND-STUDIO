import type { User } from '../../shared/types/user';
import type { ChatMessage } from '../../shared/types/ChatMessage';

/**
 * Type guard utilities for database entities
 */

export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const hasValidTimestamps = (obj: unknown): boolean => {
  return obj !== null &&
         typeof obj === 'object' &&
         'createdAt' in obj &&
         'updatedAt' in obj &&
         isValidDate((obj as any).createdAt) &&
         isValidDate((obj as any).updatedAt);
};

export const isNullableString = (value: unknown): value is string | null => {
  return typeof value === 'string' || value === null;
};

export const validateRequiredFields = <T extends Record<string, unknown>>(
  obj: unknown,
  requiredFields: (keyof T)[]
): obj is T => {
  if (!obj || typeof obj !== 'object') return false;
  
  return requiredFields.every(field => 
    field in obj && obj[field as string] !== undefined
  );
};

/**
 * Type-safe test data generators
 */

export const createMockUser = (overrides?: Partial<User>): User => {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
};

export const createMockChatMessage = (overrides?: Partial<ChatMessage>): ChatMessage => {
  return {
    id: 'test-message-id',
    userId: 'test-user-id',
    content: 'Test message',
    createdAt: new Date(),
    ...overrides
  };
};