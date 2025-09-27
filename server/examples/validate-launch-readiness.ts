/**
 * Example usage of the launch validation system
 */
import { LaunchValidator } from '../launch-validation.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('launch-validation');

async function validateLaunchReadiness(): Promise<void> {
  logger.info('Starting launch readiness validation...');
  
  const validator = new LaunchValidator();
  
  try {
    const results = await validator.validateLaunchReadiness();

    logger.info('Launch validation completed:', {
      ready: results.ready,
      summary: {
        environment: {
          valid: results.environment.valid,
          missingCount: results.environment.missing.length,
          invalidCount: results.environment.invalid.length
        },
        database: {
          valid: results.database.valid,
          connection: results.database.connection,
          migrations: {
            upToDate: results.database.migrations.upToDate,
            pending: results.database.migrations.pending
          },
          indices: {
            valid: results.database.indices.valid,
            missing: results.database.indices.missing.length
          }
        },
        dependencies: {
          valid: results.dependencies.valid,
          conflicts: results.dependencies.conflicts.length
        },
        typescript: {
          valid: results.typescript.valid,
          errors: results.typescript.errors.length
        }
      }
    });

    if (!results.ready) {
      logger.error('Launch validation failed. Required actions:', results.recommendations);
      process.exit(1);
    }

    logger.info('✅ All validation checks passed! System is ready for launch.');

  } catch (error) {
    logger.error('Launch validation failed with error:', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
}

// Run validation
validateLaunchReadiness().catch(error => {
  logger.error('Failed to run launch validation:', { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});