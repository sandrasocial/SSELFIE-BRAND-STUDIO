import { Request, Response, NextFunction } from 'express';

interface EmailValidationConfig {
  minLength: number;
  maxLength: number;
  requiredDomains?: string[];
  blockedDomains?: string[];
}

const defaultConfig: EmailValidationConfig = {
  minLength: 5,
  maxLength: 254, // Maximum length per RFC 5321
  blockedDomains: ['tempmail.com', 'disposable.com']
};

export class EmailValidator {
  private config: EmailValidationConfig;

  constructor(config: Partial<EmailValidationConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private isValidFormat(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  private isAllowedDomain(email: string): boolean {
    const domain = email.split('@')[1];
    
    if (this.config.blockedDomains?.includes(domain)) {
      return false;
    }

    if (this.config.requiredDomains?.length) {
      return this.config.requiredDomains.includes(domain);
    }

    return true;
  }

  private isValidLength(email: string): boolean {
    return email.length >= this.config.minLength && email.length <= this.config.maxLength;
  }

  public validate(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    if (!this.isValidFormat(email)) {
      errors.push('Invalid email format');
    }

    if (!this.isValidLength(email)) {
      errors.push(`Email length must be between ${this.config.minLength} and ${this.config.maxLength} characters`);
    }

    if (!this.isAllowedDomain(email)) {
      errors.push('Email domain not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Express middleware
export const emailValidationMiddleware = (config?: Partial<EmailValidationConfig>) => {
  const validator = new EmailValidator(config);

  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const validation = validator.validate(email);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    next();
  };
};