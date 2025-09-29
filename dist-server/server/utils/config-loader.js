import { configManager } from './config-manager.js';
import { validateEnvironment } from './env-validator.js';
import { Logger } from './logger.js';
const logger = new Logger('ConfigLoader');
export async function loadApplicationConfig() {
    try {
        logger.info('Loading application configuration...');
        const envValid = await validateEnvironment();
        if (!envValid) {
            throw new Error('Environment validation failed');
        }
        const config = configManager.loadConfig();
        logger.info('Configuration loaded successfully', {
            nodeEnv: config.system.nodeEnv,
            port: config.system.port
        });
        return config;
    }
    catch (error) {
        logger.error('Failed to load configuration:', error);
        throw error;
    }
}
export function getConfigValue(path, defaultValue) {
    return configManager.get(path, defaultValue);
}
export function hasConfigValue(path) {
    return configManager.has(path);
}
export { configManager };
//# sourceMappingURL=config-loader.js.map