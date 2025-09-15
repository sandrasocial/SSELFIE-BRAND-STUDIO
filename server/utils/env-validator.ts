/**
 * Environment Variable Validator
 * Ensures all required environment variables are present and valid
 */

export interface EnvConfig {
  // Database
  DATABASE_URL: string;
  
  // Authentication
  STACK_SECRET_SERVER_KEY: string;
  VITE_STACK_PUBLISHABLE_CLIENT_KEY: string;
  
  // AI Services
  REPLICATE_API_TOKEN: string;
  REPLICATE_USERNAME: string;
  ANTHROPIC_API_KEY: string;
  GOOGLE_API_KEY?: string;
  
  // AWS
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_S3_BUCKET: string;
  
  // Email
  RESEND_API_KEY: string;
  FLODESK_API_KEY?: string;
  
  // Social Media
  INSTAGRAM_BUSINESS_ACCOUNT_ID?: string;
  META_ACCESS_TOKEN?: string;
  MANYCHAT_API_TOKEN?: string;
  MAKE_API_TOKEN?: string;
  
  // Payment
  STRIPE_SECRET_KEY: string;
  TESTING_VITE_STRIPE_PUBLIC_KEY?: string;
  
  // System
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
  REPLIT_DEV_DOMAIN?: string;
  
  // Admin
  ADMIN_USER_ID?: string;
  SHANNON_USER_ID?: string;
}

export class EnvValidator {
  private static requiredVars: (keyof EnvConfig)[] = [
    'DATABASE_URL',
    'STACK_SECRET_SERVER_KEY',
    'VITE_STACK_PUBLISHABLE_CLIENT_KEY',
    'REPLICATE_API_TOKEN',
    'REPLICATE_USERNAME',
    'ANTHROPIC_API_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET',
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'NODE_ENV'
  ];

  private static optionalVars: (keyof EnvConfig)[] = [
    'GOOGLE_API_KEY',
    'FLODESK_API_KEY',
    'INSTAGRAM_BUSINESS_ACCOUNT_ID',
    'META_ACCESS_TOKEN',
    'MANYCHAT_API_TOKEN',
    'MAKE_API_TOKEN',
    'TESTING_VITE_STRIPE_PUBLIC_KEY',
    'PORT',
    'REPLIT_DEV_DOMAIN',
    'ADMIN_USER_ID',
    'SHANNON_USER_ID'
  ];

  /**
   * Validate all environment variables
   */
  static validate(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    config: Partial<EnvConfig>;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Partial<EnvConfig> = {};

    // Check required variables
    for (const varName of this.requiredVars) {
      const value = process.env[varName];
      
      if (!value) {
        errors.push(`Missing required environment variable: ${varName}`);
      } else {
        config[varName] = value as any;
      }
    }

    // Check optional variables
    for (const varName of this.optionalVars) {
      const value = process.env[varName];
      if (value) {
        config[varName] = value as any;
      }
    }

    // Validate specific formats
    this.validateDatabaseUrl(config.DATABASE_URL, errors);
    this.validateNodeEnv(config.NODE_ENV, errors);
    this.validatePort(config.PORT, warnings);
    this.validateApiKeys(config, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config
    };
  }

  /**
   * Validate database URL format
   */
  private static validateDatabaseUrl(url: string | undefined, errors: string[]): void {
    if (!url) return;
    
    if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }
  }

  /**
   * Validate NODE_ENV value
   */
  private static validateNodeEnv(env: string | undefined, errors: string[]): void {
    if (!env) return;
    
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(env)) {
      errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    }
  }

  /**
   * Validate port number
   */
  private static validatePort(port: string | undefined, warnings: string[]): void {
    if (!port) return;
    
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      warnings.push('PORT must be a valid port number (1-65535)');
    }
  }

  /**
   * Validate API key formats
   */
  private static validateApiKeys(config: Partial<EnvConfig>, warnings: string[]): void {
    // Check for obviously invalid API keys
    const apiKeys = [
      { name: 'REPLICATE_API_TOKEN', value: config.REPLICATE_API_TOKEN },
      { name: 'ANTHROPIC_API_KEY', value: config.ANTHROPIC_API_KEY },
      { name: 'AWS_ACCESS_KEY_ID', value: config.AWS_ACCESS_KEY_ID },
      { name: 'STRIPE_SECRET_KEY', value: config.STRIPE_SECRET_KEY }
    ];

    for (const { name, value } of apiKeys) {
      if (value && value.length < 10) {
        warnings.push(`${name} appears to be too short for a valid API key`);
      }
    }
  }

  /**
   * Get environment configuration with validation
   */
  static getConfig(): EnvConfig {
    const validation = this.validate();
    
    if (!validation.isValid) {
      console.error('❌ Environment validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      throw new Error('Invalid environment configuration');
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ Environment warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    return validation.config as EnvConfig;
  }

  /**
   * Check if we're in development mode
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Check if we're in production mode
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Check if we're in test mode
   */
  static isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}

// Export convenience functions
export const validateEnv = EnvValidator.validate.bind(EnvValidator);
export const getEnvConfig = EnvValidator.getConfig.bind(EnvValidator);
export const isDevelopment = EnvValidator.isDevelopment.bind(EnvValidator);
export const isProduction = EnvValidator.isProduction.bind(EnvValidator);
export const isTest = EnvValidator.isTest.bind(EnvValidator);
