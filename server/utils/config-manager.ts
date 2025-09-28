/**
 * Configuration Manager
 * Centralized configuration loading and validation with improved type safety
 */

import { Logger } from './logger.js';

export interface AppConfig {
  database: {
    url: string;
    user: string;
    password: string;
    host: string;
    neonApiKey: string;
  };
  auth: {
    stackProjectId: string;
    stackPublishableKey: string;
    stackSecretKey: string;
    adminUserId: string;
    shannonUserId: string;
  };
  ai: {
    anthropicApiKey: string;
    googleApiKey: string;
    replicateApiToken: string;
    replicateUsername: string;
    projectNumber: string;
  };
  storage: {
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    awsRegion: string;
    s3Bucket: string;
  };
  payment: {
    stripeSecretKey: string;
    stripePublishableKey: string;
  };
  email: {
    flodeskApiKey: string;
    resendApiKey: string;
  };
  social: {
    instagramAccessToken: string;
    metaAccessToken: string;
    manychatToken: string;
  };
  system: {
    nodeEnv: string;
    port: number;
    logLevel: string;
  };
}

// Type guards for configuration validation
export function isValidEnvironment(env: string): env is 'development' | 'production' | 'test' {
  return ['development', 'production', 'test'].includes(env);
}

export function isValidLogLevel(level: string): level is 'error' | 'warn' | 'info' | 'debug' {
  return ['error', 'warn', 'info', 'debug'].includes(level);
}

export function isValidPort(port: unknown): port is number {
  return typeof port === 'number' && port > 0 && port <= 65535 && Number.isInteger(port);
}

// Safe environment variable access with type checking
export function getEnvString(key: string, defaultValue: string = ''): string {
  const value = process.env[key];
  return typeof value === 'string' ? value : defaultValue;
}

export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (typeof value === 'string' && value !== '') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return defaultValue;
}

export function requireEnvString(key: string, context?: string): string {
  const value = process.env[key];
  if (typeof value !== 'string' || value === '') {
    const errorMsg = `Required environment variable ${key} is missing or empty`;
    throw new Error(context ? `${errorMsg} (${context})` : errorMsg);
  }
  return value;
}

// Configuration path type safety
type ConfigPath = 
  | 'database.url' | 'database.user' | 'database.password' | 'database.host' | 'database.neonApiKey'
  | 'auth.stackProjectId' | 'auth.stackPublishableKey' | 'auth.stackSecretKey' | 'auth.adminUserId' | 'auth.shannonUserId'
  | 'ai.anthropicApiKey' | 'ai.googleApiKey' | 'ai.replicateApiToken' | 'ai.replicateUsername' | 'ai.projectNumber'
  | 'storage.awsAccessKeyId' | 'storage.awsSecretAccessKey' | 'storage.awsRegion' | 'storage.s3Bucket'
  | 'payment.stripeSecretKey' | 'payment.stripePublishableKey'
  | 'email.flodeskApiKey' | 'email.resendApiKey'
  | 'social.instagramAccessToken' | 'social.metaAccessToken' | 'social.manychatToken'
  | 'system.nodeEnv' | 'system.port' | 'system.logLevel';

export class ConfigManager {
  private logger: Logger;
  private config: AppConfig;
  private enabled: boolean;

  constructor() {
    this.logger = new Logger('ConfigManager');
    this.enabled = true;
    this.config = this.loadConfiguration();
  }

  /**
   * Load configuration from environment variables with validation
   */
  private loadConfiguration(): AppConfig {
    try {
      const port = getEnvNumber('PORT', 5000);
      const nodeEnv = getEnvString('NODE_ENV', 'development');
      const logLevel = getEnvString('LOG_LEVEL', 'info');

      // Validate critical values
      if (!isValidPort(port)) {
        this.logger.error(`Invalid port number: ${port}, using default 5000`);
      }
      
      if (!isValidEnvironment(nodeEnv)) {
        this.logger.warn(`Invalid NODE_ENV '${nodeEnv}', defaulting to 'development'`);
      }
      
      if (!isValidLogLevel(logLevel)) {
        this.logger.warn(`Invalid LOG_LEVEL '${logLevel}', defaulting to 'info'`);
      }

      const config: AppConfig = {
        database: {
          url: getEnvString('DATABASE_URL'),
          user: getEnvString('DATABASE_USER'),
          password: getEnvString('DATABASE_PASSWORD'),
          host: getEnvString('DATABASE_HOST', 'localhost'),
          neonApiKey: getEnvString('NEON_API_KEY'),
        },
        auth: {
          stackProjectId: getEnvString('STACK_PROJECT_ID'),
          stackPublishableKey: getEnvString('STACK_PUBLISHABLE_KEY'),
          stackSecretKey: getEnvString('STACK_SECRET_KEY'),
          adminUserId: getEnvString('ADMIN_USER_ID'),
          shannonUserId: getEnvString('SHANNON_USER_ID'),
        },
        ai: {
          anthropicApiKey: getEnvString('ANTHROPIC_API_KEY'),
          googleApiKey: getEnvString('GOOGLE_API_KEY'),
          replicateApiToken: getEnvString('REPLICATE_API_TOKEN'),
          replicateUsername: getEnvString('REPLICATE_USERNAME'),
          projectNumber: getEnvString('PROJECT_NUMBER'),
        },
        storage: {
          awsAccessKeyId: getEnvString('AWS_ACCESS_KEY_ID'),
          awsSecretAccessKey: getEnvString('AWS_SECRET_ACCESS_KEY'),
          awsRegion: getEnvString('AWS_REGION', 'us-east-1'),
          s3Bucket: getEnvString('AWS_S3_BUCKET'),
        },
        payment: {
          stripeSecretKey: getEnvString('STRIPE_SECRET_KEY'),
          stripePublishableKey: getEnvString('STRIPE_PUBLISHABLE_KEY'),
        },
        email: {
          flodeskApiKey: getEnvString('FLODESK_API_KEY'),
          resendApiKey: getEnvString('RESEND_API_KEY'),
        },
        social: {
          instagramAccessToken: getEnvString('INSTAGRAM_ACCESS_TOKEN'),
          metaAccessToken: getEnvString('META_ACCESS_TOKEN'),
          manychatToken: getEnvString('MANYCHAT_TOKEN'),
        },
        system: {
          nodeEnv: isValidEnvironment(nodeEnv) ? nodeEnv : 'development',
          port: isValidPort(port) ? port : 5000,
          logLevel: isValidLogLevel(logLevel) ? logLevel : 'info',
        },
      };

      return config;
    } catch (error) {
      this.logger.error('Failed to load configuration:', error);
      throw new Error(`Configuration loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get configuration value with type safety and better error handling
   */
  public getConfigValue<T = unknown>(path: ConfigPath): T | null;
  public getConfigValue<T = unknown>(path: string): T | null {
    if (!this.enabled) {
      this.logger.warn(`Configuration manager is disabled, cannot get '${path}'`);
      return null;
    }

    try {
      if (!path || typeof path !== 'string') {
        this.logger.error('Invalid configuration path provided');
        return null;
      }

      const keys = path.split('.');
      let value: unknown = this.config;

      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = (value as Record<string, unknown>)[key];
        } else {
          this.logger.warn(`Configuration path '${path}' not found`);
          return null;
        }
      }

      return value as T;
    } catch (error) {
      this.logger.error(`Error accessing configuration path '${path}':`, error);
      return null;
    }
  }

  /**
   * Get configuration value with default fallback and better error handling
   */
  public get<T = unknown>(path: ConfigPath, defaultValue: T): T;
  public get<T = unknown>(path: string, defaultValue?: T): T | null {
    try {
      const value = this.getConfigValue<T>(path as ConfigPath);
      return value !== null ? value : (defaultValue ?? null);
    } catch (error) {
      this.logger.error(`Error getting configuration '${path}':`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Safely get required configuration value with improved error handling
   */
  public getRequired<T = unknown>(path: ConfigPath): T;
  public getRequired<T = unknown>(path: string): T {
    if (!this.enabled) {
      throw new Error(`Configuration manager is disabled, cannot get required '${path}'`);
    }

    try {
      const value = this.getConfigValue<T>(path as ConfigPath);
      
      if (value === null || value === undefined || value === '') {
        throw new Error(`Required configuration path '${path}' is missing or empty`);
      }
      
      return value;
    } catch (error) {
      const errorMsg = `Failed to get required configuration '${path}'`;
      this.logger.error(errorMsg, error);
      throw new Error(`${errorMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get entire configuration
   */
  public getConfig(): Readonly<AppConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Validate configuration with detailed error reporting
   */
  public validateConfiguration(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required database configuration
    if (!this.config.database.url) {
      errors.push('DATABASE_URL is required');
    }
    if (!this.config.database.user && this.config.system.nodeEnv === 'production') {
      errors.push('DATABASE_USER is required in production');
    }
    if (!this.config.database.password && this.config.system.nodeEnv === 'production') {
      errors.push('DATABASE_PASSWORD is required in production');
    }

    // Check required auth configuration
    if (!this.config.auth.stackProjectId) {
      errors.push('STACK_PROJECT_ID is required');
    }
    if (!this.config.auth.stackPublishableKey) {
      errors.push('STACK_PUBLISHABLE_KEY is required');
    }
    if (!this.config.auth.stackSecretKey) {
      errors.push('STACK_SECRET_KEY is required');
    }

    // Check required AI configuration
    if (!this.config.ai.anthropicApiKey) {
      errors.push('ANTHROPIC_API_KEY is required');
    }
    if (!this.config.ai.googleApiKey) {
      warnings.push('GOOGLE_API_KEY is missing - some AI features may not work');
    }
    if (!this.config.ai.replicateApiToken) {
      errors.push('REPLICATE_API_TOKEN is required');
    }

    // Check required storage configuration
    if (!this.config.storage.awsAccessKeyId) {
      errors.push('AWS_ACCESS_KEY_ID is required');
    }
    if (!this.config.storage.awsSecretAccessKey) {
      errors.push('AWS_SECRET_ACCESS_KEY is required');
    }
    if (!this.config.storage.s3Bucket) {
      errors.push('AWS_S3_BUCKET is required');
    }

    // Check required payment configuration
    if (!this.config.payment.stripeSecretKey) {
      errors.push('STRIPE_SECRET_KEY is required');
    }
    if (!this.config.payment.stripePublishableKey) {
      errors.push('STRIPE_PUBLISHABLE_KEY is required');
    }

    // Check optional but recommended configuration
    if (!this.config.email.resendApiKey) {
      warnings.push('RESEND_API_KEY is missing - email functionality may not work');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if configuration path exists
   */
  public has(path: ConfigPath): boolean;
  public has(path: string): boolean {
    try {
      const keys = path.split('.');
      let value: unknown = this.config;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = (value as Record<string, unknown>)[key];
        } else {
          return false;
        }
      }
      
      return value !== null && value !== undefined && value !== '';
    } catch {
      return false;
    }
  }

  /**
   * Get configuration summary with detailed statistics
   */
  public getConfigurationSummary(): {
    totalSections: number;
    totalValues: number;
    configuredValues: number;
    missingValues: number;
    environment: string;
    validation: { valid: boolean; errorCount: number; warningCount: number };
  } {
    const totalSections = Object.keys(this.config).length;
    let totalValues = 0;
    let configuredValues = 0;
    let missingValues = 0;

    for (const section of Object.values(this.config)) {
      for (const value of Object.values(section)) {
        totalValues++;
        if (value && value !== '') {
          configuredValues++;
        } else {
          missingValues++;
        }
      }
    }

    const validation = this.validateConfiguration();

    return {
      totalSections,
      totalValues,
      configuredValues,
      missingValues,
      environment: this.config.system.nodeEnv,
      validation: {
        valid: validation.valid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
      },
    };
  }

  /**
   * Export configuration (excluding sensitive values)
   */
  public exportConfiguration(includeSensitive: boolean = false): Record<string, unknown> {
    const config = JSON.parse(JSON.stringify(this.config)) as Record<string, Record<string, unknown>>;

    if (!includeSensitive) {
      // Redact sensitive values
      const sensitiveKeys = {
        database: ['password', 'neonApiKey'],
        auth: ['stackSecretKey'],
        ai: ['anthropicApiKey', 'googleApiKey', 'replicateApiToken'],
        storage: ['awsAccessKeyId', 'awsSecretAccessKey'],
        payment: ['stripeSecretKey'],
        email: ['flodeskApiKey', 'resendApiKey'],
        social: ['instagramAccessToken', 'metaAccessToken', 'manychatToken'],
      };

      for (const [section, keys] of Object.entries(sensitiveKeys)) {
        if (config[section]) {
          for (const key of keys) {
            if (config[section][key]) {
              config[section][key] = '[REDACTED]';
            }
          }
        }
      }
    }

    return config;
  }

  /**
   * Enable/disable configuration management
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.logger.info(`Configuration management ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if configuration management is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const configManager = new ConfigManager();