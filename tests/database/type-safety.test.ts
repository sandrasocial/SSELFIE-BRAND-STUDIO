import { describe, test, expect } from 'vitest';
import { db } from '../../server/db';
import type { User } from '../../shared/types/user';
import type { MayaOnboarding } from '../../shared/types/InsertUserWebsiteOnboarding';
import type { VideoGeneration } from '../../shared/types/ai-generation';

describe('Database Type Safety Tests', () => {
  describe('Date Handling', () => {
    test('user timestamps should be proper Date objects', async () => {
      const user = await db.query.users.findFirst();
      expect(user?.createdAt).toBeInstanceOf(Date);
      expect(user?.updatedAt).toBeInstanceOf(Date);
    });

    test('maya onboarding timestamps should be proper Date objects', async () => {
      const onboarding = await db.query.mayaOnboarding.findFirst();
      expect(onboarding?.startedAt).toBeInstanceOf(Date);
      expect(onboarding?.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('Null Safety', () => {
    test('required user fields should not be null', async () => {
      const user = await db.query.users.findFirst();
      expect(user?.id).toBeDefined();
      expect(user?.email).toBeDefined();
    });

    test('optional fields should handle null correctly', async () => {
      const onboarding = await db.query.mayaOnboarding.findFirst();
      // phoneNumber is optional
      expect(() => onboarding?.phoneNumber?.toString()).not.toThrow();
    });
  });

  describe('Type Guards', () => {
    test('isUser type guard should work correctly', () => {
      const isUser = (obj: unknown): obj is User => {
        return obj !== null && 
               typeof obj === 'object' && 
               'id' in obj &&
               'email' in obj;
      };

      const validUser = {
        id: '123',
        email: 'test@example.com',
        createdAt: new Date()
      };

      expect(isUser(validUser)).toBe(true);
      expect(isUser(null)).toBe(false);
      expect(isUser({})).toBe(false);
    });
  });

  describe('Relationship Type Safety', () => {
    test('user to onboarding relationship should maintain types', async () => {
      const user = await db.query.users.findFirst({
        with: {
          onboarding: true
        }
      });

      if (user?.onboarding) {
        expect(user.onboarding).toHaveProperty('userId', user.id);
      }
    });
  });
});