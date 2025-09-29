/**
 * Configuration Manager
 * Centralized configuration loading and validation with improved type safety
 */
import { Logger } from './logger.js';
// Type guards for configuration validation
export function isValidEnvironment(env) {
    return ['development', 'production', 'test'].includes(env);
}
export function isValidLogLevel(level) {
    return ['error', 'warn', 'info', 'debug'].includes(level);
}
export function isValidPort(port) {
    return typeof port === 'number' && port > 0 && port <= 65535 && Number.isInteger(port);
}
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
     * Load configuration from environment variables with validation
     */
    loadConfiguration() {
        const port = parseInt(process.env['PORT'] || '5000');
        const nodeEnv = process.env['NODE_ENV'] || 'development';
        const logLevel = process.env['LOG_LEVEL'] || 'info';
        // Validate critical values
        if (!isValidPort(port)) {
            throw new Error(`Invalid port number: ${port}`);
        }
        if (!isValidEnvironment(nodeEnv)) {
            this.logger.warn(`Invalid NODE_ENV '${nodeEnv}', defaulting to 'development'`);
        }
        if (!isValidLogLevel(logLevel)) {
            this.logger.warn(`Invalid LOG_LEVEL '${logLevel}', defaulting to 'info'`);
        }
        return {
            database: {
                url: process.env['DATABASE_URL'] || '',
                user: process.env['DATABASE_USER'] || '',
                password: process.env['DATABASE_PASSWORD'] || '',
                host: process.env['DATABASE_HOST'] || 'localhost',
                neonApiKey: process.env['NEON_API_KEY'] || '',
            },
            auth: {
                stackProjectId: process.env['STACK_PROJECT_ID'] || '',
                stackPublishableKey: process.env['STACK_PUBLISHABLE_KEY'] || '',
                stackSecretKey: process.env['STACK_SECRET_KEY'] || '',
                adminUserId: process.env['ADMIN_USER_ID'] || '',
                shannonUserId: process.env['SHANNON_USER_ID'] || '',
            },
            ai: {
                anthropicApiKey: process.env['ANTHROPIC_API_KEY'] || '',
                googleApiKey: process.env['GOOGLE_API_KEY'] || '',
                replicateApiToken: process.env['REPLICATE_API_TOKEN'] || '',
                replicateUsername: process.env['REPLICATE_USERNAME'] || '',
                projectNumber: process.env['PROJECT_NUMBER'] || '',
            },
            storage: {
                awsAccessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
                awsSecretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || '',
                awsRegion: process.env['AWS_REGION'] || 'us-east-1',
                s3Bucket: process.env['AWS_S3_BUCKET'] || '',
            },
            payment: {
                stripeSecretKey: process.env['STRIPE_SECRET_KEY'] || '',
                stripePublishableKey: process.env['STRIPE_PUBLISHABLE_KEY'] || '',
            },
            email: {
                flodeskApiKey: process.env['FLODESK_API_KEY'] || '',
                resendApiKey: process.env['RESEND_API_KEY'] || '',
            },
            social: {
                instagramAccessToken: process.env['INSTAGRAM_ACCESS_TOKEN'] || '',
                metaAccessToken: process.env['META_ACCESS_TOKEN'] || '',
                manychatToken: process.env['MANYCHAT_TOKEN'] || '',
            },
            system: {
                nodeEnv: isValidEnvironment(nodeEnv) ? nodeEnv : 'development',
                port,
                logLevel: isValidLogLevel(logLevel) ? logLevel : 'info',
            },
        };
    }
    getConfigValue(path) {
        try {
            const keys = path.split('.');
            let value = this.config;
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                }
                else {
                    this.logger.warn(`Configuration path '${path}' not found`);
                    return null;
                }
            }
            return value;
        }
        catch (error) {
            this.logger.error(`Error accessing configuration path '${path}':`, error);
            return null;
        }
    }
    get(path, defaultValue) {
        const value = this.getConfigValue(path);
        return value !== null ? value : (defaultValue ?? null);
    }
    getRequired(path) {
        const value = this.getConfigValue(path);
        if (value === null || value === undefined || value === '') {
            throw new Error(`Required configuration path '${path}' is missing or empty`);
        }
        return value;
    }
    /**
     * Get entire configuration
     */
    getConfig() {
        return Object.freeze({ ...this.config });
    }
    /**
     * Validate configuration with detailed error reporting
     */
    validateConfiguration() {
        const errors = [];
        const warnings = [];
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
    has(path) {
        try {
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
            return value !== null && value !== undefined && value !== '';
        }
        catch {
            return false;
        }
    }
    /**
     * Get configuration summary with detailed statistics
     */
    getConfigurationSummary() {
        const totalSections = Object.keys(this.config).length;
        let totalValues = 0;
        let configuredValues = 0;
        let missingValues = 0;
        for (const section of Object.values(this.config)) {
            for (const value of Object.values(section)) {
                totalValues++;
                if (value && value !== '') {
                    configuredValues++;
                }
                else {
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
    exportConfiguration(includeSensitive = false) {
        const config = JSON.parse(JSON.stringify(this.config));
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
}
// Export singleton instance
export const configManager = new ConfigManager();
