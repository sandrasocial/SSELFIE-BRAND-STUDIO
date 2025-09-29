/**
 * Configuration Loader
 * Centralized configuration loading with validation
 */

import { configManager, type ConfigPath } from './config-manager.js';
import { validateEnvironment } from './env-validator.js';
import { Logger } from './logger.js';

const logger = new Logger('ConfigLoader');

/**
 * Load and validate application configuration
 */
export async function loadApplicationConfig() {
  try {
    logger.info('Loading application configuration...');
    
    // First validate environment variables
    const envValid = await validateEnvironment();
    if (!envValid) {
      throw new Error('Environment validation failed');
    }
    
    // Load configuration
    const config = configManager.loadConfig();
    
    logger.info('Configuration loaded successfully', {
      nodeEnv: config.system.nodeEnv,
      port: config.system.port
    });
    
    return config;
  } catch (error) {
    logger.error('Failed to load configuration:', error);
    throw error;
  }
}

/**
 * Get configuration value with fallback
 */
export function getConfigValue<T>(path: ConfigPath, defaultValue?: T): T {
  return configManager.get(path, defaultValue);
}

/**
 * Check if configuration value exists
 */
export function hasConfigValue(path: ConfigPath): boolean {
  return configManager.has(path);
}

// Export config manager for advanced usage
export { configManager };
