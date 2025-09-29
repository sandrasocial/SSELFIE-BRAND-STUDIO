import { environmentAuditor } from './env-audit.js';
import { Logger } from './logger.js';
const logger = new Logger('EnvValidator');
export async function validateEnvironment() {
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
    }
    catch (error) {
        logger.error('Environment validation error:', error);
        return false;
    }
}
export async function validateEnvironmentOrExit() {
    const isValid = await validateEnvironment();
    if (!isValid) {
        logger.error('Environment validation failed. Application cannot start.');
        process.exit(1);
    }
}
export { environmentAuditor };
//# sourceMappingURL=env-validator.js.map