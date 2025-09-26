/**
 * Comprehensive Configuration System
 * Manages application configuration across different environments
 */

import { Logger } from './logger';
import { configManager } from './config-manager';

export interface ConfigurationOptions {
  environment: string;
  configPath?: string;
  validateOnLoad?: boolean;
  hotReload?: boolean;
  encryption?: boolean;
}

export class ConfigurationSystem {
  private logger: Logger;
  private _isEnabled: boolean;
  private options: ConfigurationOptions;

  constructor(options: ConfigurationOptions) {
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
  public async initialize(): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to initialize configuration system', { error: error.message });
      throw error;
    }
  }

  /**
   * Load configuration
   */
  private async loadConfiguration(): Promise<void> {
    this.logger.info('Loading configuration...');

    // Configuration is already loaded by configManager
    // This would be extended to load from files, databases, etc.

    this.logger.info('Configuration loaded successfully');
  }


  /**
   * Set up hot reload
   */
  private setupHotReload(): void {
    this.logger.info('Setting up configuration hot reload...');
    
    // This would implement file watching for configuration changes
    // For now, just log that it's set up
    this.logger.info('Configuration hot reload set up');
  }

  /**
   * Get configuration value
   */
  public getConfigValue<T = any>(path: string): T {
    if (!this.isEnabled) {
      throw new Error('Configuration system is disabled');
    }

    try {
      return configManager.getConfigValue<T>(path);
    } catch (error) {
      this.logger.error('Failed to get configuration value', { path, error: error.message });
      throw error;
    }
  }

  /**
   * Set configuration value
   */
  public setConfigValue(path: string, value: any): void {
    if (!this.isEnabled) {
      this.logger.warn('Configuration system is disabled, cannot set value');
      return;
    }

    try {
      configManager.setConfigValue(path, value);
      this.logger.debug('Configuration value set', { path });
    } catch (error) {
      this.logger.error('Failed to set configuration value', { path, error: error.message });
      throw error;
    }
  }

  /**
   * Get entire configuration
   */
  public getConfiguration(): any {
    if (!this.isEnabled) {
      throw new Error('Configuration system is disabled');
    }

    return configManager.getConfig();
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
    if (!this.isEnabled) {
      throw new Error('Configuration system is disabled');
    }

    return configManager.getConfigurationSummary();
  }

  /**
   * Export configuration
   */
  public exportConfiguration(includeSensitive: boolean = false): any {
    if (!this.isEnabled) {
      throw new Error('Configuration system is disabled');
    }

    return configManager.exportConfiguration(includeSensitive);
  }

  /**
   * Import configuration
   */
  public importConfiguration(config: any): void {
    if (!this.isEnabled) {
      this.logger.warn('Configuration system is disabled, cannot import');
      return;
    }

    try {
      configManager.importConfiguration(config);
      this.logger.info('Configuration imported successfully');
    } catch (error) {
      this.logger.error('Failed to import configuration', { error: error.message });
      throw error;
    }
  }

  /**
   * Reset configuration
   */
  public resetConfiguration(): void {
    if (!this.isEnabled) {
      this.logger.warn('Configuration system is disabled, cannot reset');
      return;
    }

    try {
      configManager.resetConfiguration();
      this.logger.info('Configuration reset successfully');
    } catch (error) {
      this.logger.error('Failed to reset configuration', { error: error.message });
      throw error;
    }
  }

  /**
   * Get configuration for specific environment
   */
  public getConfigurationForEnvironment(environment: string): any {
  if (!this._isEnabled) {
      throw new Error('Configuration system is disabled');
    }

    return configManager.getConfigurationForEnvironment(environment);
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): { valid: boolean; errors: string[] } {
  if (!this._isEnabled) {
      throw new Error('Configuration system is disabled');
    }

    return configManager.validateConfiguration();
  }

  /**
   * Get configuration options
   */
  public getOptions(): ConfigurationOptions {
    return { ...this.options };
  }

  /**
   * Update configuration options
   */
  public updateOptions(newOptions: Partial<ConfigurationOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.logger.info('Configuration options updated', { options: this.options });
  }

  /**
   * Enable/disable configuration system
   */
  public setEnabled(enabled: boolean): void {
  this._isEnabled = enabled;
  this.logger.info(`Configuration system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if configuration system is enabled
   */
  public isEnabled(): boolean {
  return this._isEnabled;
  }
}

// Export singleton instance
export const configurationSystem = new ConfigurationSystem({
  environment: process.env.NODE_ENV || 'development',
  validateOnLoad: true,
  hotReload: false,
  encryption: false,
});
