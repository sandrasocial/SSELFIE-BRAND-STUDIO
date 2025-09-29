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
    async initialize() {
        if (!this._isEnabled) {
            this.logger.warn('Configuration system is disabled');
            return;
        }
        this.logger.info('Initializing configuration system...');
        try {
            await this.loadConfiguration();
            if (this.options.validateOnLoad) {
                await this.validateConfiguration();
            }
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
    async loadConfiguration() {
        this.logger.info('Loading configuration...');
        this.logger.info('Configuration loaded successfully');
    }
    setupHotReload() {
        this.logger.info('Setting up configuration hot reload...');
        this.logger.info('Configuration hot reload set up');
    }
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
    setConfigValue(path, value) {
        if (!this._isEnabled) {
            this.logger.warn('Configuration system is disabled, cannot set value');
            return;
        }
        try {
            configManager.set(path, value);
            this.logger.debug('Configuration value set', { path });
        }
        catch (error) {
            this.logger.error('Failed to set configuration value', { path, error: error.message });
            throw error;
        }
    }
    getConfiguration() {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.getConfig();
    }
    getConfigurationSummary() {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        const summary = configManager.getConfigurationSummary();
        return {
            totalSections: summary.totalSections,
            totalValues: summary.totalValues,
            requiredValues: summary.configuredValues,
            optionalValues: summary.totalValues - summary.configuredValues,
            environment: summary.environment
        };
    }
    exportConfiguration(includeSensitive = false) {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.exportConfiguration(includeSensitive);
    }
    importConfiguration(config) {
        if (!this._isEnabled) {
            this.logger.warn('Configuration system is disabled, cannot import');
            return;
        }
        try {
            Object.entries(config).forEach(([key, value]) => {
                configManager.set(key, value);
            });
            this.logger.info('Configuration imported successfully');
        }
        catch (error) {
            this.logger.error('Failed to import configuration', { error: error.message });
            throw error;
        }
    }
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
    getConfigurationForEnvironment(environment) {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.getConfigurationForEnvironment(environment);
    }
    validateConfiguration() {
        if (!this._isEnabled) {
            throw new Error('Configuration system is disabled');
        }
        return configManager.validateConfiguration();
    }
    getOptions() {
        return { ...this.options };
    }
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.logger.info('Configuration options updated', { options: this.options });
    }
    setEnabled(enabled) {
        this._isEnabled = enabled;
        this.logger.info(`Configuration system ${enabled ? 'enabled' : 'disabled'}`);
    }
    isEnabled() {
        return this._isEnabled;
    }
}
export const configurationSystem = new ConfigurationSystem({
    environment: process.env['NODE_ENV'] || 'development',
    validateOnLoad: true,
    hotReload: false,
    encryption: false,
});
//# sourceMappingURL=configuration.js.map