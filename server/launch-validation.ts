/**
 * LAUNCH VALIDATION SYSTEM
 * Coordinates all pre-launch validation checks
 */

import { DatabaseValidator } from './database-validator.js';
import { environmentAuditor } from './utils/env-audit.js';
import { UserJourneyValidator } from './user-journey-validator.js';
import { join } from 'path';
import { readFileSync } from 'fs';

export class LaunchValidator {
  private databaseValidator: DatabaseValidator;
  private userJourneyValidator: UserJourneyValidator;

  constructor() {
    this.databaseValidator = new DatabaseValidator();
    this.userJourneyValidator = new UserJourneyValidator();
  }

  /**
   * Validate environment variables
   */
  private async validateEnvironment(): Promise<{
    valid: boolean;
    missing: string[];
    invalid: string[];
  }> {
    const results = await environmentAuditor.auditEnvironment();
    const missing = Object.entries(results)
      .filter(([_, value]) => value === null)
      .map(([key]) => key);
    const invalid = Object.entries(results)
      .filter(([_, value]) => value === false)
      .map(([key]) => key);

    return {
      valid: missing.length === 0 && invalid.length === 0,
      missing,
      invalid
    };
  }

  /**
   * Validate package versions
   */
  private validatePackageVersions(): {
    valid: boolean;
    clientDeps: Record<string, string>;
    serverDeps: Record<string, string>;
    conflicts: string[];
  } {
    const clientDeps = JSON.parse(
      readFileSync(join(process.cwd(), 'client-deps.json'), 'utf8')
    );
    const serverDeps = JSON.parse(
      readFileSync(join(process.cwd(), 'server-deps.json'), 'utf8')
    );

    // Check for version conflicts
    const conflicts: string[] = [];
    Object.keys(clientDeps).forEach(pkg => {
      if (serverDeps[pkg] && clientDeps[pkg] !== serverDeps[pkg]) {
        conflicts.push(pkg);
      }
    });

    return {
      valid: conflicts.length === 0,
      clientDeps,
      serverDeps,
      conflicts
    };
  }

  /**
   * Validate TypeScript configuration
   */
  private validateTypeScriptConfig(): {
    valid: boolean;
    configs: string[];
    errors: string[];
  } {
    const configFiles = [
      'tsconfig.json',
      'tsconfig.server.json',
      'tsconfig.server.build.json',
      'tsconfig.server.launch.json',
      'tsconfig.optimized.json'
    ];

    const errors: string[] = [];
    configFiles.forEach(config => {
      try {
        const content = JSON.parse(
          readFileSync(join(process.cwd(), config), 'utf8')
        );
        
        // Validate required compiler options
        const required = ['strict', 'esModuleInterop', 'skipLibCheck'];
        required.forEach(opt => {
          if (!content.compilerOptions?.[opt]) {
            errors.push(`Missing ${opt} in ${config}`);
          }
        });

      } catch (error) {
        errors.push(`Failed to read/parse ${config}: ${error}`);
      }
    });

    return {
      valid: errors.length === 0,
      configs: configFiles,
      errors
    };
  }

  /**
   * Run comprehensive launch validation
   */
  async validateLaunchReadiness(): Promise<{
    ready: boolean;
    environment: {
      valid: boolean;
      missing: string[];
      invalid: string[];
    };
    database: {
      valid: boolean;
      connection: boolean;
      migrations: {
        upToDate: boolean;
        pending: number;
        completed: number;
      };
      indices: {
        valid: boolean;
        total: number;
        missing: string[];
      };
    };
    dependencies: {
      valid: boolean;
      conflicts: string[];
    };
    typescript: {
      valid: boolean;
      configs: string[];
      errors: string[];
    };
    userJourney: {
      valid: boolean;
      onboarding: {
        valid: boolean;
        stepsConfigured: number;
        issues: string[];
      };
      subscriptions: {
        valid: boolean;
        plans: string[];
        issues: string[];
      };
      dependencies: {
        valid: boolean;
        services: {
          name: string;
          status: 'ok' | 'error';
          error?: string;
        }[];
      };
    };
    recommendations: string[];
  }> {
    // Run all validations
    const [envValidation, dbValidation, depValidation, tsValidation, userJourneyValidation] = await Promise.all([
      this.validateEnvironment(),
      this.databaseValidator.validateDatabase(),
      this.validatePackageVersions(),
      this.validateTypeScriptConfig(),
      this.userJourneyValidator.validateUserJourney()
    ]);

    // Generate recommendations based on validation results
    const recommendations: string[] = [];

    if (!envValidation.valid) {
      if (envValidation.missing.length > 0) {
        recommendations.push(
          `Set missing environment variables: ${envValidation.missing.join(', ')}`
        );
      }
      if (envValidation.invalid.length > 0) {
        recommendations.push(
          `Fix invalid environment variables: ${envValidation.invalid.join(', ')}`
        );
      }
    }

    if (!dbValidation.valid) {
      if (!dbValidation.connection) {
        recommendations.push('Fix database connection issues');
      }
      if (!dbValidation.migrations.upToDate) {
        recommendations.push(
          `Run ${dbValidation.migrations.pending} pending database migrations`
        );
      }
      if (!dbValidation.indices.valid) {
        recommendations.push(
          `Create missing database indices: ${dbValidation.indices.missing.join(', ')}`
        );
      }
    }

    if (!depValidation.valid) {
      recommendations.push(
        `Resolve dependency conflicts: ${depValidation.conflicts.join(', ')}`
      );
    }

    if (!tsValidation.valid) {
      recommendations.push(
        `Fix TypeScript configuration issues: ${tsValidation.errors.join('; ')}`
      );
    }

    if (!userJourneyValidation.valid) {
      if (!userJourneyValidation.onboarding.valid) {
        recommendations.push(
          `Fix onboarding flow issues: ${userJourneyValidation.onboarding.issues.join('; ')}`
        );
      }
      if (!userJourneyValidation.subscriptions.valid) {
        recommendations.push(
          `Fix subscription plan issues: ${userJourneyValidation.subscriptions.issues.join('; ')}`
        );
      }
      if (!userJourneyValidation.dependencies.valid) {
        const failedServices = userJourneyValidation.dependencies.services
          .filter(s => s.status === 'error')
          .map(s => `${s.name} (${s.error})`)
          .join(', ');
        recommendations.push(`Fix service dependencies: ${failedServices}`);
      }
    }

    // Return comprehensive validation results
    return {
      ready: envValidation.valid && 
             dbValidation.valid && 
             depValidation.valid && 
             tsValidation.valid &&
             userJourneyValidation.valid,
      environment: envValidation,
      database: {
        valid: dbValidation.valid,
        connection: dbValidation.connection,
        migrations: dbValidation.migrations,
        indices: dbValidation.indices
      },
      dependencies: {
        valid: depValidation.valid,
        conflicts: depValidation.conflicts
      },
      typescript: tsValidation,
      userJourney: userJourneyValidation,
      recommendations
    };
  }
}