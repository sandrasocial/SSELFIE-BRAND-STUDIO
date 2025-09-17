/**
 * Configuration Manager
 * Centralized configuration loading and validation
 */

import { Logger } from './logger';

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
   * Load configuration from environment variables
   */
  private loadConfiguration(): AppConfig {
    return {
      database: {
        url: process.env.DATABASE_URL || '',
        user: process.env.DATABASE_USER || '',
        password: process.env.DATABASE_PASSWORD || '',
        host: process.env.DATABASE_HOST || 'localhost',
        neonApiKey: process.env.NEON_API_KEY || '',
      },
      auth: {
        stackProjectId: process.env.STACK_PROJECT_ID || '',
        stackPublishableKey: process.env.STACK_PUBLISHABLE_KEY || '',
        stackSecretKey: process.env.STACK_SECRET_KEY || '',
        adminUserId: process.env.ADMIN_USER_ID || '',
        shannonUserId: process.env.SHANNON_USER_ID || '',
      },
      ai: {
        anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
        googleApiKey: process.env.GOOGLE_API_KEY || '',
        replicateApiToken: process.env.REPLICATE_API_TOKEN || '',
        replicateUsername: process.env.REPLICATE_USERNAME || '',
        projectNumber: process.env.PROJECT_NUMBER || '',
      },
      storage: {
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        awsRegion: process.env.AWS_REGION || 'us-east-1',
        s3Bucket: process.env.AWS_S3_BUCKET || '',
      },
      payment: {
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      },
      email: {
        flodeskApiKey: process.env.FLODESK_API_KEY || '',
        resendApiKey: process.env.RESEND_API_KEY || '',
      },
      social: {
        instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        metaAccessToken: process.env.META_ACCESS_TOKEN || '',
        manychatToken: process.env.MANYCHAT_TOKEN || '',
      },
      system: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '5000'),
        logLevel: process.env.LOG_LEVEL || 'info',
      },
    };
  }

  /**
   * Get configuration value
   */
  public getConfigValue<T = unknown>(path: string): T {
    const keys = path.split('.');
    let value: unknown = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        throw new Error(`Configuration path '${path}' not found`);
      }
    }

    return value as T;
  }

  /**
   * Get entire configuration
   */
  public getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required database configuration
    if (!this.config.database.url) {
      errors.push('DATABASE_URL is required');
    }
    if (!this.config.database.user) {
      errors.push('DATABASE_USER is required');
    }
    if (!this.config.database.password) {
      errors.push('DATABASE_PASSWORD is required');
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
      errors.push('GOOGLE_API_KEY is required');
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

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get configuration summary
   */
  public getConfigurationSummary(): {
    totalSections: number;
    totalValues: number;
    requiredValues: number;
    optionalValues: number;
    environment: string;
  } {
    const totalSections = Object.keys(this.config).length;
    let totalValues = 0;
    let requiredValues = 0;
    let optionalValues = 0;

    for (const section of Object.values(this.config)) {
      for (const value of Object.values(section)) {
        totalValues++;
        if (value && value !== '') {
          requiredValues++;
        } else {
          optionalValues++;
        }
      }
    }

    return {
      totalSections,
      totalValues,
      requiredValues,
      optionalValues,
      environment: this.config.system.nodeEnv,
    };
  }

  /**
   * Export configuration (excluding sensitive values)
   */
  public exportConfiguration(includeSensitive: boolean = false): Record<string, unknown> {
    const config = { ...(this.config as unknown as Record<string, unknown>) } as Record<string, unknown>;

    if (!includeSensitive) {
      // Redact sensitive values
      (config.database as Record<string, unknown>).password = '[REDACTED]';
      (config.auth as Record<string, unknown>).stackSecretKey = '[REDACTED]';
      (config.ai as Record<string, unknown>).anthropicApiKey = '[REDACTED]';
      (config.ai as Record<string, unknown>).googleApiKey = '[REDACTED]';
      (config.ai as Record<string, unknown>).replicateApiToken = '[REDACTED]';
      (config.storage as Record<string, unknown>).awsAccessKeyId = '[REDACTED]';
      (config.storage as Record<string, unknown>).awsSecretAccessKey = '[REDACTED]';
      (config.payment as Record<string, unknown>).stripeSecretKey = '[REDACTED]';
      (config.email as Record<string, unknown>).flodeskApiKey = '[REDACTED]';
      (config.email as Record<string, unknown>).resendApiKey = '[REDACTED]';
      (config.social as Record<string, unknown>).instagramAccessToken = '[REDACTED]';
      (config.social as Record<string, unknown>).metaAccessToken = '[REDACTED]';
      (config.social as Record<string, unknown>).manychatToken = '[REDACTED]';
    }

    return config as Record<string, unknown>;
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

  /**
   * Load configuration (alias for getConfig)
   */
  public loadConfig(): AppConfig {
    return this.getConfig();
  }

  /**
   * Get configuration value by path
   */
  public get<T = unknown>(path: string, defaultValue?: T): T {
    const keys = path.split('.');
    let value: unknown = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue as T;
      }
    }
    
    return value as T;
  }

  /**
   * Check if configuration path exists
   */
  public has(path: string): boolean {
    const keys = path.split('.');
    let value: unknown = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Set configuration value by path
   */
  public setConfigValue(path: string, value: unknown): void {
    const keys = path.split('.');
    let current: Record<string, unknown> = this.config as unknown as Record<string, unknown>;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const next = current[key];
      if (typeof next !== 'object' || next === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    this.logger.info(`Configuration value set: ${path}`);
  }

  /**
   * Import configuration from external source
   */
  public importConfiguration(config: Record<string, unknown>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Configuration imported successfully');
  }

  /**
   * Reset configuration to defaults
   */
  public resetConfiguration(): void {
    this.config = this.loadConfiguration();
    this.logger.info('Configuration reset to defaults');
  }

  /**
   * Get configuration for specific environment
   */
  public getConfigurationForEnvironment(environment: string): Record<string, unknown> {
    return {
      ...(this.config as unknown as Record<string, unknown>),
      environment,
      nodeEnv: environment
    };
  }

}

// Export singleton instance
export const configManager = new ConfigManager();