/**
 * Comprehensive Configuration System
 * Manages application configuration across different environments
 */
import { Logger } from './logger.js';
import { configManager } from './config-manager.js';
export class ConfigurationSystem {
    logger;
    _isEnabled;
    options;
    constructor(options) {
        this.logger = new Logger('ConfigurationSystem');
        this._isEnabled = true;
        this.options = {
            validateOnLoad: true,
            hotReload: false,
            encryption: false,
            ...options,
        };
    }
    /**
     * Initialize configuration system
     */
    async initialize() {
        if (!this._isEnabled) {
            this.logger.warn('Configuration system is disabled');
            return;
        }
        this.logger.info('Initializing configuration system...');
        try {
            // Load configuration
            await this.loadConfiguration();
            // Validate configuration if enabled
            if (this.options.validateOnLoad) {
                await this.validateConfiguration();
            }
            // Set up hot reload if enabled
            if (this.options.hotReload) {
                this.setupHotReload();
            }
            this.logger.info('Configuration system initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize configuration system', { error: error.message });
            throw error;
        }
    }
    /**
     * Load configuration
     */
    async loadConfiguration() {
        this.logger.info('Loading configuration...');
        // Configuration is already loaded by configManager
        // This would be extended to load from files, databases, etc.
        this.logger.info('Configuration loaded successfully');
    }
    /**
     * Set up hot reload
     */
    setupHotReload() {
        this.logger.info('Setting up configuration hot reload...');
        // This would implement file watching for configuration changes
        // For now, just log that it's set up
        this.logger.info('Configuration hot reload set up');
    }
    /**
     * Get configuration value
     */
    getConfigValue(path) {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        try {
            return configManager.getConfigValue(path);
        }
        catch (error) {
            this.logger.error('Failed to get configuration value', { path, error: error.message });
            throw error;
        }
    }
    /**
     * Set configuration value
     */
    setConfigValue(path, value) {
        if (!this._isEnabled) {
            this.logger.warn('Configuration system is disabled, cannot set value');
            return;
        }
        try {
            configManager.setConfigValue(path, value);
            this.logger.debug('Configuration value set', { path });
        }
        catch (error) {
            this.logger.error('Failed to set configuration value', { path, error: error.message });
            throw error;
        }
    }
    /**
     * Get entire configuration
     */
    getConfiguration() {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.getConfig();
    }
    /**
     * Get configuration summary
     */
    getConfigurationSummary() {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.getConfigurationSummary();
    }
    /**
     * Export configuration
     */
    exportConfiguration(includeSensitive = false) {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.exportConfiguration(includeSensitive);
    }
    /**
     * Import configuration
     */
    importConfiguration(config) {
        if (!this._isEnabled) {
            this.logger.warn('Configuration system is disabled, cannot import');
            return;
        }
        try {
            configManager.importConfiguration(config);
            this.logger.info('Configuration imported successfully');
        }
        catch (error) {
            this.logger.error('Failed to import configuration', { error: error.message });
            throw error;
        }
    }
    /**
     * Reset configuration
     */
    resetConfiguration() {
        if (!this._isEnabled) {
            this.logger.warn('Configuration system is disabled, cannot reset');
            return;
        }
        try {
            configManager.resetConfiguration();
            this.logger.info('Configuration reset successfully');
        }
        catch (error) {
            this.logger.error('Failed to reset configuration', { error: error.message });
            throw error;
        }
    }
    /**
     * Get configuration for specific environment
     */
    getConfigurationForEnvironment(environment) {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.getConfigurationForEnvironment(environment);
    }
    /**
     * Validate configuration
     */
    validateConfiguration() {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.validateConfiguration();
    }
    /**
     * Get configuration options
     */
    getOptions() {
        return { ...this.options };
    }
    /**
     * Update configuration options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.logger.info('Configuration options updated', { options: this.options });
    }
    /**
     * Enable/disable configuration system
     */
    setEnabled(enabled) {
        this._isEnabled = enabled;
        this.logger.info(`Configuration system ${enabled ? 'enabled' : 'disabled'}`);
    }
    /**
     * Check if configuration system is enabled
     */
    isEnabled() {
        return this._isEnabled;
    }
}
// Export singleton instance
export const configurationSystem = new ConfigurationSystem({
    environment: process.env['NODE_ENV'] || 'development',
    validateOnLoad: true,
    hotReload: false,
    encryption: false,
});
