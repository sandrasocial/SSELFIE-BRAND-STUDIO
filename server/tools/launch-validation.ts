/**
 * LAUNCH VALIDATION PROTOCOL
 * Comprehensive system validation for launch readiness
 */

import { ArchitectureValidator } from '../architecture-validator.js';
import { DatabaseValidator } from '../database-validator.js';
import { EnvironmentAuditor } from '../utils/env-audit.js';
import { storage } from '../storage.js';
import { db } from '../db.js';

interface ValidationResult {
  success: boolean;
  category: string;
  details: string[];
  errors: string[];
  warnings: string[];
}

export class LaunchValidationProtocol {
  private results: ValidationResult[] = [];

  /**
   * Run all validation checks
   */
  async validateAll(): Promise<ValidationResult[]> {
    await this.validateEnvironment();
    await this.validateDatabase();
    await this.validateArchitecture();
    await this.validateAPI();
    await this.validateStorage();
    await this.validateSecurity();
    
    return this.results;
  }

  /**
   * Validate environment configuration
   */
  private async validateEnvironment(): Promise<void> {
    const result: ValidationResult = {
      success: true,
      category: 'Environment',
      details: [],
      errors: [],
      warnings: []
    };

    try {
      const envAuditor = new EnvironmentAuditor();
      await envAuditor.auditEnvironment();
      result.details.push('All required environment variables present');
      
      // Validate sensitive values are proper secrets/tokens
      const sensitiveKeys = ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'RESEND_API_KEY'];
      for (const key of sensitiveKeys) {
        if (!process.env[key]) {
          result.errors.push(`Missing ${key}`);
          continue;
        }
        if (process.env[key]?.toLowerCase().includes('test')) {
          result.warnings.push(`${key} appears to be a test key`);
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
    }

    this.results.push(result);
  }

  /**
   * Validate database configuration and migrations
   */
  private async validateDatabase(): Promise<void> {
    const result: ValidationResult = {
      success: true,
      category: 'Database',
      details: [],
      errors: [],
      warnings: []
    };

    try {
      // Check database connectivity
      const dbValidator = new DatabaseValidator();
      const isConnected = await dbValidator.validateConnection();
      if (!isConnected) {
        result.errors.push('Database connection failed');
      } else {
        result.details.push('Database connection successful');
      }

      // Validate migrations are up to date
      const migrations = await dbValidator.checkMigrations();
      if (migrations.pending.length > 0) {
        result.errors.push(`Migrations not up to date. ${migrations.pending.length} pending migrations`);
      } else {
        result.details.push('All migrations up to date');
      }

      // Check database indices
      const indices = await dbValidator.checkIndices();
      result.details.push(`Found ${indices.total} indices`);

      // Validate required indices exist
      const requiredIndices = [
        'users_email_idx',
        'maya_subscriptions_user_id_idx',
        'maya_usage_tracking_user_id_idx'
      ];
      
      for (const idx of requiredIndices) {
        if (indices.missing.includes(idx)) {
          result.errors.push(`Missing required index: ${idx}`);
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
    }

    this.results.push(result);
  }

  /**
   * Validate system architecture
   */
  private async validateArchitecture(): Promise<void> {
    const result: ValidationResult = {
      success: true,
      category: 'Architecture',
      details: [],
      errors: [],
      warnings: []
    };

    try {
      // Validate sample request
      const sampleRequest = {
        version: 'user123/model:v1',
        input: {
          prompt: 'Test prompt'
        }
      };

      ArchitectureValidator.validateGenerationRequest(sampleRequest, 'test-user-id');
      result.details.push('Architecture validation passed');

      // Validate user model structure
      try {
        await ArchitectureValidator.validateGenerationRequest({
          version: 'user123/model:v1',
          input: {
            prompt: 'Test prompt'
          }
        }, 'test-user-id');
        result.details.push('User model validation correctly validates requests');
      } catch (error) {
        if (error instanceof Error && error.message === 'User model not found - training required') {
          result.details.push('User model validation correctly prevents untrained users');
        } else {
          throw error;
        }
      }

      // Generation validation removed since no validator exists

    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
    }

    this.results.push(result);
  }

  /**
   * Validate API endpoints
   */
  private async validateAPI(): Promise<void> {
    const result: ValidationResult = {
      success: true,
      category: 'API',
      details: [],
      errors: [],
      warnings: []
    };

    try {
      // Test API endpoints
      const endpoints = [
        '/api/health',
        '/api/health-detailed',
        '/api/ping'
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`http://localhost:${process.env.PORT || 3000}${endpoint}`);
        if (!response.ok) {
          result.errors.push(`${endpoint} returned ${response.status}`);
        } else {
          result.details.push(`${endpoint} responded successfully`);
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
    }

    this.results.push(result);
  }

  /**
   * Validate storage configuration
   */
  private async validateStorage(): Promise<void> {
    const result: ValidationResult = {
      success: true,
      category: 'Storage',
      details: [],
      errors: [],
      warnings: []
    };

    try {
      // Validate storage configuration
      const requiredStorageEnv = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        'AWS_S3_BUCKET'
      ];
      
      const missingStorageEnv = requiredStorageEnv.filter(key => !process.env[key]);
      if (missingStorageEnv.length > 0) {
        result.errors.push(`Missing storage configuration: ${missingStorageEnv.join(', ')}`);
      } else {
        result.details.push('Storage configuration verified');
      }

    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
    }

    this.results.push(result);
  }

  /**
   * Validate security configuration
   */
  private async validateSecurity(): Promise<void> {
    const result: ValidationResult = {
      success: true,
      category: 'Security',
      details: [],
      errors: [],
      warnings: []
    };

    try {
      // Check TLS/SSL configuration
      if (!process.env.NODE_ENV?.includes('prod')) {
        result.warnings.push('Not using production environment');
      }

      // Validate CORS settings
      const allowedHosts = process.env.ALLOWED_EMBED_HOSTS?.split(',') || [];
      if (!allowedHosts.length) {
        result.warnings.push('No CORS hosts configured');
      } else {
        result.details.push(`CORS configured for ${allowedHosts.length} hosts`);
      }

      // Check authentication configuration
      if (!process.env.STACK_SECRET_SERVER_KEY) {
        result.errors.push('Missing Stack Auth server key');
      } else {
        result.details.push('Stack Auth configured');
      }

    } catch (error) {
      result.success = false;
      result.errors.push((error as Error).message);
    }

    this.results.push(result);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new LaunchValidationProtocol();
  validator.validateAll().then(results => {
    console.log('🚀 LAUNCH VALIDATION RESULTS:');
    console.log('----------------------------');
    
    let allPassed = true;
    for (const result of results) {
      console.log(`\n📋 ${result.category}:`);
      console.log(`Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (result.details.length) {
        console.log('Details:');
        result.details.forEach(d => console.log(`  ✓ ${d}`));
      }
      
      if (result.warnings.length) {
        console.log('Warnings:');
        result.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
      }
      
      if (result.errors.length) {
        console.log('Errors:');
        result.errors.forEach(e => console.log(`  ❌ ${e}`));
        allPassed = false;
      }
    }
    
    console.log('\n----------------------------');
    console.log(`Overall Status: ${allPassed ? '✅ READY FOR LAUNCH' : '❌ LAUNCH BLOCKED'}`);
    
    if (!allPassed) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}