import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../prisma';

export class TokenManager {
  static async createToken(userId: string): Promise<string> {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: '24h'
    });
    
    await prisma.authTokens.create({
      data: {
        user_id: userId,
        token_hash: this.hashToken(token),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
    
    return token;
  }

  static async validateToken(token: string): Promise<boolean> {
    const storedToken = await prisma.authTokens.findFirst({
      where: {
        token_hash: this.hashToken(token),
        revoked_at: null,
        expires_at: {
          gt: new Date()
        }
      }
    });
    
    return !!storedToken;
  }

  static async revokeToken(token: string): Promise<void> {
    await prisma.authTokens.update({
      where: {
        token_hash: this.hashToken(token)
      },
      data: {
        revoked_at: new Date()
      }
    });
  }

  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}