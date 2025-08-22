import { sign, verify } from 'jsonwebtoken';
import { z } from 'zod';

const TokenConfig = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  ALGORITHM: 'HS256'
};

export const TokenPayloadSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
  scope: z.array(z.string()),
  exp: z.number(),
  iat: z.number()
});

export class TokenManager {
  static generateAccessToken(userId: string, sessionId: string, scope: string[]): string {
    return sign(
      { userId, sessionId, scope },
      process.env.JWT_SECRET!,
      { 
        expiresIn: TokenConfig.ACCESS_TOKEN_EXPIRY,
        algorithm: TokenConfig.ALGORITHM 
      }
    );
  }

  static generateRefreshToken(userId: string, sessionId: string): string {
    return sign(
      { userId, sessionId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { 
        expiresIn: TokenConfig.REFRESH_TOKEN_EXPIRY,
        algorithm: TokenConfig.ALGORITHM 
      }
    );
  }

  static validateToken(token: string): z.infer<typeof TokenPayloadSchema> | null {
    try {
      const decoded = verify(token, process.env.JWT_SECRET!);
      return TokenPayloadSchema.parse(decoded);
    } catch (error) {
      return null;
    }
  }
}