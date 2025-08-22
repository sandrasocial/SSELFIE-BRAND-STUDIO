import { authenticator } from 'otplib';
import { z } from 'zod';

export const MFASchema = z.object({
  userId: z.string().uuid(),
  secret: z.string(),
  verified: z.boolean(),
  backupCodes: z.array(z.string()),
  lastUsed: z.date().optional()
});

export class MFAHandler {
  static generateSecret(userId: string): string {
    return authenticator.generateSecret();
  }

  static validateToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  static generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );
  }
}