import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis(process.env.REDIS_URL);

export class TokenManager {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '24h';
  
  static async generateTokens(userId: string, email: string, role: string) {
    const jti = uuidv4();
    
    const accessToken = jwt.sign(
      { userId, email, role, jti },
      process.env.JWT_SECRET!,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, jti },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    // Store token metadata
    await redis.setex(
      `token:${jti}`,
      86400, // 24 hours
      JSON.stringify({ userId, isValid: true })
    );

    return { accessToken, refreshToken };
  }

  static async revokeToken(jti: string) {
    await redis.del(`token:${jti}`);
  }

  static async isTokenValid(jti: string) {
    const tokenData = await redis.get(`token:${jti}`);
    return tokenData ? JSON.parse(tokenData).isValid : false;
  }
}