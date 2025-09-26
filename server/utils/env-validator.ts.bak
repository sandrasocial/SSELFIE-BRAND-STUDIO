/**
 * Environment Validator
 * Simple validation script for application startup
 */

import { environmentAuditor } from './env-audit';
import { Logger } from './logger';

const logger = new Logger('EnvValidator');

/**
 * Validate environment variables at startup
 */
export async function validateEnvironment(): Promise<boolean> {
  try {
    logger.info('Validating environment variables...');
    
    const auditResult = await environmentAuditor.auditEnvironment();
    
    if (!auditResult.valid) {
      logger.error('Environment validation failed:', {
        missing: auditResult.missing,
        invalid: auditResult.invalid,
        warnings: auditResult.warnings
      });
      return false;
    }
    
    logger.info('Environment validation passed', {
      total: auditResult.summary.total,
      present: auditResult.summary.present,
      required: auditResult.summary.required
    });
    
    return true;
  } catch (error) {
    logger.error('Environment validation error:', error);
    return false;
  }
}

/**
 * Validate environment variables and exit if invalid
 */
export async function validateEnvironmentOrExit(): Promise<void> {
  const isValid = await validateEnvironment();
  
  if (!isValid) {
    logger.error('Environment validation failed. Application cannot start.');
    process.exit(1);
  }
}

// Export for use in other modules
export { environmentAuditor };