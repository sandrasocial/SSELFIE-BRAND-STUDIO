/**
 * Environment Variables Audit
 * Comprehensive validation and documentation of all environment variables
 */

import { Logger } from './logger';

export interface EnvVariable {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'api_key';
  description: string;
  category: 'database' | 'ai' | 'storage' | 'auth' | 'payment' | 'email' | 'social' | 'system';
  sensitive: boolean;
  example?: string;
  validation?: (value: string) => boolean;
}

export class EnvironmentAuditor {
  private logger: Logger;
  private envVariables: EnvVariable[];

  constructor() {
    this.logger = new Logger('EnvironmentAuditor');
    this.envVariables = this.defineEnvironmentVariables();
  }

  /**
   * Define all environment variables with their specifications
   */
  private defineEnvironmentVariables(): EnvVariable[] {
    return [
      // Database
      {
        name: 'DATABASE_URL',
        required: true,
        type: 'url',
        description: 'PostgreSQL database connection string',
        category: 'database',
        sensitive: true,
        validation: (value) => value.startsWith('postgresql://')
      },
      {
        name: 'PGUSER',
        required: true,
        type: 'string',
        description: 'PostgreSQL username',
        category: 'database',
        sensitive: true
      },
      {
        name: 'PGPASSWORD',
        required: true,
        type: 'string',
        description: 'PostgreSQL password',
        category: 'database',
        sensitive: true
      },
      {
        name: 'HOST',
        required: true,
        type: 'string',
        description: 'Database host',
        category: 'database',
        sensitive: false
      },
      {
        name: 'NEON_API_KEY',
        required: true,
        type: 'api_key',
        description: 'Neon database API key',
        category: 'database',
        sensitive: true,
        validation: (value) => value.startsWith('napi_')
      },

      // Stack Auth
      {
        name: 'VITE_STACK_PROJECT_ID',
        required: true,
        type: 'string',
        description: 'Stack Auth project ID for client',
        category: 'auth',
        sensitive: false
      },
      {
        name: 'VITE_STACK_PUBLISHABLE_CLIENT_KEY',
        required: true,
        type: 'api_key',
        description: 'Stack Auth publishable client key',
        category: 'auth',
        sensitive: false,
        validation: (value) => value.startsWith('pck_')
      },
      {
        name: 'STACK_SECRET_SERVER_KEY',
        required: true,
        type: 'api_key',
        description: 'Stack Auth secret server key',
        category: 'auth',
        sensitive: true,
        validation: (value) => value.startsWith('ssk_')
      },

      // AI Services
      {
        name: 'ANTHROPIC_API_KEY',
        required: true,
        type: 'api_key',
        description: 'Anthropic Claude API key for Maya chat',
        category: 'ai',
        sensitive: true,
        validation: (value) => value.startsWith('sk-ant-')
      },
      {
        name: 'GOOGLE_API_KEY',
        required: true,
        type: 'api_key',
        description: 'Google Gemini API key for video generation',
        category: 'ai',
        sensitive: true,
        validation: (value) => value.startsWith('AIza')
      },
      {
        name: 'REPLICATE_API_TOKEN',
        required: true,
        type: 'api_key',
        description: 'Replicate API token for model training',
        category: 'ai',
        sensitive: true,
        validation: (value) => value.startsWith('r8_')
      },
      {
        name: 'REPLICATE_USERNAME',
        required: true,
        type: 'string',
        description: 'Replicate username',
        category: 'ai',
        sensitive: false
      },

      // AWS S3
      {
        name: 'AWS_ACCESS_KEY_ID',
        required: true,
        type: 'api_key',
        description: 'AWS access key for S3 storage',
        category: 'storage',
        sensitive: true,
        validation: (value) => value.startsWith('AKIA')
      },
      {
        name: 'AWS_SECRET_ACCESS_KEY',
        required: true,
        type: 'api_key',
        description: 'AWS secret key for S3 storage',
        category: 'storage',
        sensitive: true
      },
      {
        name: 'AWS_REGION',
        required: true,
        type: 'string',
        description: 'AWS region for S3 bucket',
        category: 'storage',
        sensitive: false,
        example: 'us-east-1'
      },
      {
        name: 'AWS_S3_BUCKET',
        required: true,
        type: 'string',
        description: 'S3 bucket name for file storage',
        category: 'storage',
        sensitive: false
      },

      // Payment
      {
        name: 'STRIPE_SECRET_KEY',
        required: true,
        type: 'api_key',
        description: 'Stripe secret key for payments',
        category: 'payment',
        sensitive: true,
        validation: (value) => value.startsWith('sk_')
      },
      {
        name: 'TESTING_VITE_STRIPE_PUBLIC_KEY',
        required: true,
        type: 'api_key',
        description: 'Stripe publishable key for client',
        category: 'payment',
        sensitive: false,
        validation: (value) => value.startsWith('pk_')
      },

      // Email Services
      {
        name: 'FLODESK_API_KEY',
        required: true,
        type: 'api_key',
        description: 'Flodesk API key for email marketing',
        category: 'email',
        sensitive: true,
        validation: (value) => value.startsWith('fd_key_')
      },
      {
        name: 'RESEND_API_KEY',
        required: true,
        type: 'api_key',
        description: 'Resend API key for transactional emails',
        category: 'email',
        sensitive: true,
        validation: (value) => value.startsWith('re_')
      },

      // Social Media
      {
        name: 'INSTAGRAM_BUSINESS_ACCOUNT_ID',
        required: true,
        type: 'string',
        description: 'Instagram business account ID',
        category: 'social',
        sensitive: false
      },
      {
        name: 'META_ACCESS_TOKEN',
        required: true,
        type: 'api_key',
        description: 'Meta access token for Instagram API',
        category: 'social',
        sensitive: true
      },
      {
        name: 'MANYCHAT_API_TOKEN',
        required: true,
        type: 'api_key',
        description: 'ManyChat API token for automation',
        category: 'social',
        sensitive: true,
        validation: (value) => value.includes(':')
      },

      // Automation
      {
        name: 'MAKE_API_TOKEN',
        required: true,
        type: 'api_key',
        description: 'Make.com API token for automation',
        category: 'system',
        sensitive: true,
        validation: (value) => value.includes('-')
      },

      // System
      {
        name: 'NODE_ENV',
        required: true,
        type: 'string',
        description: 'Node.js environment (development/production)',
        category: 'system',
        sensitive: false,
        validation: (value) => ['development', 'production', 'test'].includes(value)
      },
      {
        name: 'PORT',
        required: true,
        type: 'number',
        description: 'Server port number',
        category: 'system',
        sensitive: false,
        validation: (value) => !isNaN(Number(value)) && Number(value) > 0
      },
      {
        name: 'REPLIT_DEV_DOMAIN',
        required: false,
        type: 'string',
        description: 'Replit development domain',
        category: 'system',
        sensitive: false
      },

      // Admin
      {
        name: 'ADMIN_USER_ID',
        required: true,
        type: 'string',
        description: 'Admin user ID for system access',
        category: 'auth',
        sensitive: false
      },
      {
        name: 'SHANNON_USER_ID',
        required: true,
        type: 'string',
        description: 'Shannon user ID for testing',
        category: 'auth',
        sensitive: false
      },

      // Google Project
      {
        name: 'project_number',
        required: true,
        type: 'number',
        description: 'Google Cloud project number',
        category: 'ai',
        sensitive: false,
        validation: (value) => !isNaN(Number(value))
      }
    ];
  }

  /**
   * Audit all environment variables
   */
  async auditEnvironment(): Promise<{
    valid: boolean;
    missing: string[];
    invalid: string[];
    warnings: string[];
    summary: {
      total: number;
      required: number;
      present: number;
      missing: number;
      invalid: number;
    };
  }> {
    this.logger.info('Starting environment variables audit...');
    
    const missing: string[] = [];
    const invalid: string[] = [];
    const warnings: string[] = [];
    let present = 0;

    for (const envVar of this.envVariables) {
      const value = process.env[envVar.name];
      
      if (!value) {
        if (envVar.required) {
          missing.push(envVar.name);
          this.logger.error(`Missing required environment variable: ${envVar.name}`);
        } else {
          this.logger.warn(`Optional environment variable not set: ${envVar.name}`);
        }
      } else {
        present++;
        
        // Validate format if validation function exists
        if (envVar.validation && !envVar.validation(value)) {
          invalid.push(envVar.name);
          this.logger.error(`Invalid format for environment variable: ${envVar.name}`);
        }

        // Check for sensitive data exposure
        if (envVar.sensitive && this.isExposedInLogs(envVar.name)) {
          warnings.push(`${envVar.name} may be exposed in logs`);
        }
      }
    }

    const valid = missing.length === 0 && invalid.length === 0;
    
    const summary = {
      total: this.envVariables.length,
      required: this.envVariables.filter(v => v.required).length,
      present,
      missing: missing.length,
      invalid: invalid.length
    };

    this.logger.info('Environment audit completed', { summary });

    return {
      valid,
      missing,
      invalid,
      warnings,
      summary
    };
  }

  /**
   * Generate environment documentation
   */
  generateDocumentation(): string {
    const categories = this.envVariables.reduce((acc, envVar) => {
      if (!acc[envVar.category]) {
        acc[envVar.category] = [];
      }
      acc[envVar.category].push(envVar);
      return acc;
    }, {} as Record<string, EnvVariable[]>);

    let doc = '# Environment Variables Documentation\n\n';
    doc += 'This document describes all environment variables used in the SSELFIE Brand Studio application.\n\n';

    for (const [category, variables] of Object.entries(categories)) {
      doc += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Variables\n\n`;
      
      for (const envVar of variables) {
        doc += `### ${envVar.name}\n`;
        doc += `- **Required**: ${envVar.required ? 'Yes' : 'No'}\n`;
        doc += `- **Type**: ${envVar.type}\n`;
        doc += `- **Sensitive**: ${envVar.sensitive ? 'Yes' : 'No'}\n`;
        doc += `- **Description**: ${envVar.description}\n`;
        if (envVar.example) {
          doc += `- **Example**: ${envVar.example}\n`;
        }
        doc += '\n';
      }
    }

    return doc;
  }

  /**
   * Check if sensitive data might be exposed in logs
   */
  private isExposedInLogs(envVarName: string): boolean {
    // This is a simplified check - in production, you'd want more sophisticated detection
    const sensitivePatterns = [
      /console\.log.*process\.env\./,
      /logger\.(info|debug).*process\.env\./,
      /JSON\.stringify.*process\.env/
    ];

    // For now, just return false - in a real implementation, you'd scan the codebase
    return false;
  }

  /**
   * Get environment variables by category
   */
  getVariablesByCategory(category: string): EnvVariable[] {
    return this.envVariables.filter(v => v.category === category);
  }

  /**
   * Get all required environment variables
   */
  getRequiredVariables(): EnvVariable[] {
    return this.envVariables.filter(v => v.required);
  }

  /**
   * Get all sensitive environment variables
   */
  getSensitiveVariables(): EnvVariable[] {
    return this.envVariables.filter(v => v.sensitive);
  }
}

// Create global instance
export const environmentAuditor = new EnvironmentAuditor();
