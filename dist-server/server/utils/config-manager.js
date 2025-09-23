/**
 * Configuration Manager
 * Centralized configuration loading and validation
 */
import { Logger } from './logger';
export class ConfigManager {
    logger;
    config;
    enabled;
    constructor() {
        this.logger = new Logger('ConfigManager');
        this.enabled = true;
        this.config = this.loadConfiguration();
    }
    /**
     * Load configuration from environment variables
     */
    loadConfiguration() {
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
    getConfigValue(path) {
        const keys = path.split('.');
        let value = this.config;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                throw new Error(`Configuration path '${path}' not found`);
            }
        }
        return value;
    }
    /**
     * Get entire configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Validate configuration
     */
    validateConfiguration() {
        const errors = [];
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
    getConfigurationSummary() {
        const totalSections = Object.keys(this.config).length;
        let totalValues = 0;
        let requiredValues = 0;
        let optionalValues = 0;
        for (const section of Object.values(this.config)) {
            for (const value of Object.values(section)) {
                totalValues++;
                if (value && value !== '') {
                    requiredValues++;
                }
                else {
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
    exportConfiguration(includeSensitive = false) {
        const config = { ...this.config };
        if (!includeSensitive) {
            // Redact sensitive values
            config.database.password = '[REDACTED]';
            config.auth.stackSecretKey = '[REDACTED]';
            config.ai.anthropicApiKey = '[REDACTED]';
            config.ai.googleApiKey = '[REDACTED]';
            config.ai.replicateApiToken = '[REDACTED]';
            config.storage.awsAccessKeyId = '[REDACTED]';
            config.storage.awsSecretAccessKey = '[REDACTED]';
            config.payment.stripeSecretKey = '[REDACTED]';
            config.email.flodeskApiKey = '[REDACTED]';
            config.email.resendApiKey = '[REDACTED]';
            config.social.instagramAccessToken = '[REDACTED]';
            config.social.metaAccessToken = '[REDACTED]';
            config.social.manychatToken = '[REDACTED]';
        }
        return config;
    }
    /**
     * Enable/disable configuration management
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.logger.info(`Configuration management ${enabled ? 'enabled' : 'disabled'}`);
    }
    /**
     * Check if configuration management is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    /**
     * Load configuration (alias for getConfig)
     */
    loadConfig() {
        return this.getConfig();
    }
    /**
     * Get configuration value by path
     */
    get(path, defaultValue) {
        const keys = path.split('.');
        let value = this.config;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return defaultValue;
            }
        }
        return value;
    }
    /**
     * Check if configuration path exists
     */
    has(path) {
        const keys = path.split('.');
        let value = this.config;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return false;
            }
        }
        return true;
    }
    /**
     * Set configuration value by path
     */
    setConfigValue(path, value) {
        const keys = path.split('.');
        let current = this.config;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const next = current[key];
            if (typeof next !== 'object' || next === null) {
                current[key] = {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
        this.logger.info(`Configuration value set: ${path}`);
    }
    /**
     * Import configuration from external source
     */
    importConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.info('Configuration imported successfully');
    }
    /**
     * Reset configuration to defaults
     */
    resetConfiguration() {
        this.config = this.loadConfiguration();
        this.logger.info('Configuration reset to defaults');
    }
    /**
     * Get configuration for specific environment
     */
    getConfigurationForEnvironment(environment) {
        return {
            ...this.config,
            environment,
            nodeEnv: environment
        };
    }
}
// Export singleton instance
export const configManager = new ConfigManager();
