import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CSRFConfig {
  cookieName: string;
  headerName: string;
  cookieOptions?: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: boolean | 'lax' | 'strict' | 'none';
  };
}

const defaultConfig: CSRFConfig = {
  cookieName: 'XSRF-TOKEN',
  headerName: 'X-XSRF-TOKEN',
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
};

export class CSRFProtection {
  private config: CSRFConfig;

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private setTokenCookie(res: Response, token: string): void {
    res.cookie(this.config.cookieName, token, this.config.cookieOptions);
  }

  public generateTokenMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = this.generateToken();
    this.setTokenCookie(res, token);
    next();
  };

  public validateTokenMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies[this.config.cookieName];
    const headerToken = req.headers[this.config.headerName.toLowerCase()];

    if (!token || !headerToken || token !== headerToken) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token validation failed'
      });
    }

    next();
  };
}

// Express middleware setup
export const csrfProtection = (config?: Partial<CSRFConfig>) => {
  const protection = new CSRFProtection(config);
  return {
    generate: protection.generateTokenMiddleware,
    validate: protection.validateTokenMiddleware
  };
};