/**
 * Environment Variables Audit
 * Comprehensive validation and documentation of all environment variables
 */

import { Logger } from './simple-logger.js';

const logger = new Logger('EnvAudit');

/**
 * Represents an environment variable configuration
 */
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

/**
 * Result of an environment variables audit
 */
export interface AuditResult {
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
}

/**
 * Validates and documents environment variables
 */
export class EnvironmentAuditor {
  private readonly envVariables: EnvVariable[];

  constructor() {
    this.envVariables = this.defineEnvironmentVariables();
  }

  private defineEnvironmentVariables(): EnvVariable[] {
    return [
      // Database
      {
        name: "DATABASE_URL",
        required: true,
        type: "url" as const,
        description: "PostgreSQL database connection string",
        category: "database" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('postgresql://')
      },
      {
        name: "PGUSER",
        required: true,
        type: "string" as const,
        description: "PostgreSQL username",
        category: "database" as const,
        sensitive: true
      },
      {
        name: "PGPASSWORD",
        required: true,
        type: "string" as const,
        description: "PostgreSQL password",
        category: "database" as const,
        sensitive: true
      },
      {
        name: "HOST",
        required: true,
        type: "string" as const,
        description: "Database host",
        category: "database" as const,
        sensitive: false
      },
      {
        name: "NEON_API_KEY",
        required: true,
        type: "api_key" as const,
        description: "Neon database API key",
        category: "database" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('napi_')
      },

      // Stack Auth
      {
        name: "VITE_STACK_PROJECT_ID",
        required: true,
        type: "string" as const,
        description: "Stack Auth project ID for client",
        category: "auth" as const,
        sensitive: false
      },
      {
        name: "VITE_STACK_PUBLISHABLE_CLIENT_KEY",
        required: true,
        type: "api_key" as const,
        description: "Stack Auth publishable client key",
        category: "auth" as const,
        sensitive: false,
        validation: (value: string) => value.startsWith('pck_')
      },
      {
        name: "STACK_SECRET_SERVER_KEY",
        required: true,
        type: "api_key" as const,
        description: "Stack Auth secret server key",
        category: "auth" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('ssk_')
      },

      // AI Services
      {
        name: "ANTHROPIC_API_KEY",
        required: true,
        type: "api_key" as const,
        description: "Anthropic Claude API key for Maya chat",
        category: "ai" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('sk-ant-')
      },
      {
        name: "GOOGLE_API_KEY",
        required: true,
        type: "api_key" as const,
        description: "Google Gemini API key for video generation",
        category: "ai" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('AIza')
      },
      {
        name: "REPLICATE_API_TOKEN",
        required: true,
        type: "api_key" as const,
        description: "Replicate API token for model training",
        category: "ai" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('r8_')
      },
      {
        name: "REPLICATE_USERNAME",
        required: true,
        type: "string" as const,
        description: "Replicate username",
        category: "ai" as const,
        sensitive: false
      },

      // AWS S3
      {
        name: "AWS_ACCESS_KEY_ID",
        required: true,
        type: "api_key" as const,
        description: "AWS access key for S3 storage",
        category: "storage" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('AKIA')
      },
      {
        name: "AWS_SECRET_ACCESS_KEY",
        required: true,
        type: "api_key" as const,
        description: "AWS secret key for S3 storage",
        category: "storage" as const,
        sensitive: true
      },
      {
        name: "AWS_REGION",
        required: true,
        type: "string" as const,
        description: "AWS region for S3 bucket",
        category: "storage" as const,
        sensitive: false,
        example: "us-east-1"
      },
      {
        name: "AWS_S3_BUCKET",
        required: true,
        type: "string" as const,
        description: "S3 bucket name for file storage",
        category: "storage" as const,
        sensitive: false
      },

      // Payment
      {
        name: "STRIPE_SECRET_KEY",
        required: true,
        type: "api_key" as const,
        description: "Stripe secret key for payments",
        category: "payment" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('sk_')
      },
      {
        name: "TESTING_VITE_STRIPE_PUBLIC_KEY",
        required: true,
        type: "api_key" as const,
        description: "Stripe publishable key for client",
        category: "payment" as const,
        sensitive: false,
        validation: (value: string) => value.startsWith('pk_')
      },

      // Email Services
      {
        name: "FLODESK_API_KEY",
        required: true,
        type: "api_key" as const,
        description: "Flodesk API key for email marketing",
        category: "email" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('fd_key_')
      },
      {
        name: "RESEND_API_KEY",
        required: true,
        type: "api_key" as const,
        description: "Resend API key for transactional emails",
        category: "email" as const,
        sensitive: true,
        validation: (value: string) => value.startsWith('re_')
      },

      // Social Media
      {
        name: "INSTAGRAM_BUSINESS_ACCOUNT_ID",
        required: true,
        type: "string" as const,
        description: "Instagram business account ID",
        category: "social" as const,
        sensitive: false
      },
      {
        name: "META_ACCESS_TOKEN",
        required: true,
        type: "api_key" as const,
        description: "Meta access token for Instagram API",
        category: "social" as const,
        sensitive: true
      },
      {
        name: "MANYCHAT_API_TOKEN",
        required: true,
        type: "api_key" as const,
        description: "ManyChat API token for automation",
        category: "social" as const,
        sensitive: true,
        validation: (value: string) => value.includes(':')
      },

      // Automation
      {
        name: "MAKE_API_TOKEN",
        required: true,
        type: "api_key" as const,
        description: "Make.com API token for automation",
        category: "system" as const,
        sensitive: true,
        validation: (value: string) => value.includes('-')
      },

      // System
      {
        name: "NODE_ENV",
        required: true,
        type: "string" as const,
        description: "Node.js environment (development/production)",
        category: "system" as const,
        sensitive: false,
        validation: (value: string) => ['development', 'production', 'test'].includes(value)
      },
      {
        name: "PORT",
        required: true,
        type: "number" as const,
        description: "Server port number",
        category: "system" as const,
        sensitive: false,
        validation: (value: string) => !isNaN(Number(value)) && Number(value) > 0
      },
      {
        name: "REPLIT_DEV_DOMAIN",
        required: false,
        type: "string" as const,
        description: "Replit development domain",
        category: "system" as const,
        sensitive: false
      },

      // Admin
      {
        name: "ADMIN_USER_ID",
        required: true,
        type: "string" as const,
        description: "Admin user ID for system access",
        category: "auth" as const,
        sensitive: false
      },
      {
        name: "SHANNON_USER_ID",
        required: true,
        type: "string" as const,
        description: "Shannon user ID for testing",
        category: "auth" as const,
        sensitive: false
      },

      // Google Project
      {
        name: "PROJECT_NUMBER",
        required: true,
        type: "number" as const,
        description: "Google Cloud project number",
        category: "ai" as const,
        sensitive: false,
        validation: (value: string) => !isNaN(Number(value))
      }
    ];
  }

  /**
   * Audit all environment variables
   */
  async auditEnvironment(): Promise<AuditResult> {
    logger.info('Starting environment variables audit...');
    const missing: string[] = [];
    const invalid: string[] = [];
    const warnings: string[] = [];
    let present = 0;

    for (const envVar of this.envVariables) {
      const value = process.env[envVar.name];
      
      if (!value) {
        if (envVar.required) {
          missing.push(envVar.name);
          logger.error(`Missing required environment variable: ${envVar.name}`);
        } else {
          logger.warn(`Optional environment variable not set: ${envVar.name}`);
        }
      } else {
        present++;
        
        // Validate format if validation function exists
        if (envVar.validation && !envVar.validation(value)) {
          invalid.push(envVar.name);
          logger.error(`Invalid format for environment variable: ${envVar.name}`);
        }

        // Check for sensitive data exposure
        if (envVar.sensitive && this.checkForExposure(envVar.name)) {
          warnings.push(`${envVar.name} may be exposed in logs`);
          logger.warn(`Sensitive variable ${envVar.name} may be exposed in logs`);
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

    logger.info('Environment audit completed', { summary });
    
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
    const categories: Record<string, EnvVariable[]> = {};
    
    // Group variables by category
    for (const envVar of this.envVariables) {
      if (!categories[envVar.category]) {
        categories[envVar.category] = [];
      }
      categories[envVar.category].push(envVar);
    }

    let doc = "# Environment Variables Documentation\n\n";
    doc += "This document describes all environment variables used in the SSELFIE Brand Studio application.\n\n";

    // Sort categories for consistent output
    const sortedCategories = Object.entries(categories).sort(([a], [b]) => a.localeCompare(b));

    for (const [category, variables] of sortedCategories) {
      doc += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Variables\n\n`;
      
      // Sort variables by name for consistent output
      variables.sort((a, b) => a.name.localeCompare(b.name));

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
  private checkForExposure(envVarName: string): boolean {
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