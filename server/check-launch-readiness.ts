/**
 * Launch readiness check script
 */
import { LaunchValidator } from './launch-validation.js';
import { Logger } from './utils/simple-logger.js';

const logger = new Logger('launch-check');

async function checkLaunchReadiness() {
  logger.info('Starting comprehensive launch readiness check...');
  
  const validator = new LaunchValidator();
  
  try {
    const results = await validator.validateLaunchReadiness();

    if (results.ready) {
      logger.info('✅ All systems validated successfully! Ready for launch.');
      
      // Log validation summary
      logger.info('Validation Summary:', {
        environment: {
          valid: results.environment.valid,
          missingCount: results.environment.missing.length,
          invalidCount: results.environment.invalid.length
        },
        database: {
          valid: results.database.valid,
          connection: results.database.connection,
          migrations: results.database.migrations,
          indices: {
            valid: results.database.indices.valid,
            missing: results.database.indices.missing
          }
        },
        dependencies: {
          valid: results.dependencies.valid,
          conflicts: results.dependencies.conflicts.length
        },
        typescript: {
          valid: results.typescript.valid,
          errors: results.typescript.errors.length
        },
        userJourney: {
          valid: results.userJourney.valid,
          onboarding: {
            valid: results.userJourney.onboarding.valid,
            configured: results.userJourney.onboarding.stepsConfigured
          },
          subscriptions: {
            valid: results.userJourney.subscriptions.valid,
            plans: results.userJourney.subscriptions.plans
          },
          services: results.userJourney.dependencies.services.map(s => ({
            name: s.name,
            status: s.status
          }))
        }
      });

    } else {
      logger.error('❌ Launch validation failed. Required actions:');
      results.recommendations.forEach((rec, i) => {
        logger.error(`${i + 1}. ${rec}`);
      });
      process.exit(1);
    }

  } catch (error) {
    logger.error('Failed to complete launch validation:', { 
      error: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  }
}

// Run validation check
checkLaunchReadiness().catch(error => {
  logger.error('Unexpected error during launch check:', { 
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});