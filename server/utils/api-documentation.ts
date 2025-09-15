/**
 * API Documentation System
 * Generates and maintains comprehensive API documentation
 */

import { Logger } from './logger';
import { Request, Response, NextFunction } from 'express';

export interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: any;
  }>;
  requestBody?: {
    type: string;
    description: string;
    schema: any;
    example?: any;
  };
  responses: Array<{
    statusCode: number;
    description: string;
    schema: any;
    example?: any;
  }>;
  authentication?: {
    type: string;
    required: boolean;
    description: string;
  };
  rateLimit?: {
    requests: number;
    window: string;
    description: string;
  };
  tags: string[];
  deprecated: boolean;
  version: string;
  lastUpdated: string;
}

export interface APIDocumentation {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  contact: {
    name: string;
    email: string;
    url: string;
  };
  license: {
    name: string;
    url: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  endpoints: APIEndpoint[];
  schemas: Record<string, any>;
  examples: Record<string, any>;
  changelog: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
  lastGenerated: string;
}

export class APIDocumentationSystem {
  private logger: Logger;
  private endpoints: Map<string, APIEndpoint>;
  private schemas: Map<string, any>;
  private examples: Map<string, any>;
  private _isEnabled: boolean;

  constructor() {
  this.logger = new Logger('APIDocumentationSystem');
  this.endpoints = new Map();
  this.schemas = new Map();
  this.examples = new Map();
  this._isEnabled = true;
  }

  /**
   * Register an API endpoint
   */
  public registerEndpoint(endpoint: APIEndpoint): void {
  if (!this._isEnabled) {
      return;
    }

    const key = `${endpoint.method.toUpperCase()}:${endpoint.path}`;
    this.endpoints.set(key, endpoint);
    this.logger.debug('API endpoint registered', { key, endpoint: endpoint.path });
  }

  /**
   * Register a schema
   */
  public registerSchema(name: string, schema: any): void {
  if (!this._isEnabled) {
      return;
    }

    this.schemas.set(name, schema);
    this.logger.debug('Schema registered', { name });
  }

  /**
   * Register an example
   */
  public registerExample(name: string, example: any): void {
  if (!this._isEnabled) {
      return;
    }

    this.examples.set(name, example);
    this.logger.debug('Example registered', { name });
  }

  /**
   * Generate comprehensive API documentation
   */
  public generateDocumentation(): APIDocumentation {
    const timestamp = new Date().toISOString();

    return {
      title: 'SSELFIE Brand Studio API',
      version: process.env.npm_package_version || '1.0.0',
      description: 'Comprehensive API for SSELFIE Brand Studio - AI-powered brand photography and content creation platform',
      baseUrl: process.env.API_BASE_URL || 'https://api.sselfie.com',
      contact: {
        name: 'SSELFIE Support',
        email: 'support@sselfie.com',
        url: 'https://sselfie.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      servers: [
        {
          url: 'https://api.sselfie.com',
          description: 'Production server',
        },
        {
          url: 'https://staging-api.sselfie.com',
          description: 'Staging server',
        },
        {
          url: 'http://localhost:5000',
          description: 'Development server',
        },
      ],
      endpoints: Array.from(this.endpoints.values()),
      schemas: Object.fromEntries(this.schemas),
      examples: Object.fromEntries(this.examples),
      changelog: this.getChangelog(),
      lastGenerated: timestamp,
    };
  }

  /**
   * Get endpoint documentation
   */
  public getEndpointDocumentation(method: string, path: string): APIEndpoint | null {
    const key = `${method.toUpperCase()}:${path}`;
    return this.endpoints.get(key) || null;
  }

  /**
   * Get all endpoints by tag
   */
  public getEndpointsByTag(tag: string): APIEndpoint[] {
    return Array.from(this.endpoints.values()).filter(endpoint => 
      endpoint.tags.includes(tag)
    );
  }

  /**
   * Get all endpoints by method
   */
  public getEndpointsByMethod(method: string): APIEndpoint[] {
    return Array.from(this.endpoints.values()).filter(endpoint => 
      endpoint.method.toUpperCase() === method.toUpperCase()
    );
  }

  /**
   * Get all endpoints by version
   */
  public getEndpointsByVersion(version: string): APIEndpoint[] {
    return Array.from(this.endpoints.values()).filter(endpoint => 
      endpoint.version === version
    );
  }

  /**
   * Get deprecated endpoints
   */
  public getDeprecatedEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values()).filter(endpoint => 
      endpoint.deprecated
    );
  }

  /**
   * Generate OpenAPI specification
   */
  public generateOpenAPISpec(): any {
    const doc = this.generateDocumentation();
    
    return {
      openapi: '3.0.0',
      info: {
        title: doc.title,
        version: doc.version,
        description: doc.description,
        contact: doc.contact,
        license: doc.license,
      },
      servers: doc.servers,
      paths: this.generatePaths(),
      components: {
        schemas: doc.schemas,
        examples: doc.examples,
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
      tags: this.generateTags(),
      externalDocs: {
        description: 'Find out more about SSELFIE',
        url: 'https://sselfie.com',
      },
    };
  }

  /**
   * Generate paths for OpenAPI spec
   */
  private generatePaths(): any {
    const paths: any = {};

    for (const endpoint of this.endpoints.values()) {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }

      const operation: any = {
        summary: endpoint.description,
        description: endpoint.description,
        operationId: `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        tags: endpoint.tags,
        parameters: endpoint.parameters.map(param => ({
          name: param.name,
          in: this.getParameterLocation(param.name, endpoint.path),
          required: param.required,
          description: param.description,
          schema: { type: param.type },
          example: param.example,
        })),
        responses: {},
        deprecated: endpoint.deprecated,
      };

      if (endpoint.requestBody) {
        operation.requestBody = {
          description: endpoint.requestBody.description,
          required: true,
          content: {
            'application/json': {
              schema: endpoint.requestBody.schema,
              example: endpoint.requestBody.example,
            },
          },
        };
      }

      if (endpoint.authentication) {
        operation.security = [{
          [endpoint.authentication.type]: []
        }];
      }

      if (endpoint.rateLimit) {
        operation['x-rate-limit'] = endpoint.rateLimit;
      }

      for (const response of endpoint.responses) {
        operation.responses[response.statusCode.toString()] = {
          description: response.description,
          content: {
            'application/json': {
              schema: response.schema,
              example: response.example,
            },
          },
        };
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = operation;
    }

    return paths;
  }

  /**
   * Generate tags for OpenAPI spec
   */
  private generateTags(): any[] {
    const tagSet = new Set<string>();
    
    for (const endpoint of this.endpoints.values()) {
      for (const tag of endpoint.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).map(tag => ({
      name: tag,
      description: this.getTagDescription(tag),
    }));
  }

  /**
   * Get tag description
   */
  private getTagDescription(tag: string): string {
    const descriptions: Record<string, string> = {
      'auth': 'Authentication and user management endpoints',
      'ai': 'AI-powered content generation endpoints',
      'images': 'Image processing and generation endpoints',
      'videos': 'Video creation and processing endpoints',
      'brands': 'Brand management and customization endpoints',
      'admin': 'Administrative and management endpoints',
      'health': 'Health check and monitoring endpoints',
      'utility': 'Utility and helper endpoints',
    };

    return descriptions[tag] || `Endpoints related to ${tag}`;
  }

  /**
   * Get parameter location
   */
  private getParameterLocation(name: string, path: string): string {
    if (path.includes(`{${name}}`)) {
      return 'path';
    }
    return 'query';
  }

  /**
   * Get changelog
   */
  private getChangelog(): Array<{
    version: string;
    date: string;
    changes: string[];
  }> {
    return [
      {
        version: '1.0.0',
        date: '2024-12-15',
        changes: [
          'Initial API release',
          'AI image generation endpoints',
          'Video creation endpoints',
          'Brand management endpoints',
          'User authentication system',
        ],
      },
    ];
  }

  /**
   * Generate API documentation HTML
   */
  public generateHTMLDocumentation(): string {
    const doc = this.generateDocumentation();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.title} Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .endpoint { margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px; }
        .endpoint-header { display: flex; align-items: center; margin-bottom: 15px; }
        .method { padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px; }
        .method.get { background: #61affe; color: white; }
        .method.post { background: #49cc90; color: white; }
        .method.put { background: #fca130; color: white; }
        .method.delete { background: #f93e3e; color: white; }
        .path { font-family: monospace; font-size: 1.1em; }
        .description { margin: 10px 0; color: #666; }
        .parameters { margin: 15px 0; }
        .parameter { margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; }
        .parameter-name { font-weight: bold; font-family: monospace; }
        .parameter-type { color: #666; font-size: 0.9em; }
        .parameter-required { color: #e74c3c; font-size: 0.8em; }
        .responses { margin: 15px 0; }
        .response { margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; }
        .response-code { font-weight: bold; color: #2c3e50; }
        .response-description { color: #666; margin-left: 10px; }
        .tag { display: inline-block; background: #e9ecef; color: #495057; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; margin: 2px; }
        .deprecated { opacity: 0.6; border-left: 4px solid #f93e3e; }
        .deprecated::before { content: "⚠️ DEPRECATED"; color: #f93e3e; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${doc.title}</h1>
            <p>Version ${doc.version} • ${doc.description}</p>
        </div>
        <div class="content">
            <h2>API Endpoints</h2>
            ${doc.endpoints.map(endpoint => `
                <div class="endpoint ${endpoint.deprecated ? 'deprecated' : ''}">
                    <div class="endpoint-header">
                        <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method.toUpperCase()}</span>
                        <span class="path">${endpoint.path}</span>
                    </div>
                    <div class="description">${endpoint.description}</div>
                    ${endpoint.tags.length > 0 ? `<div>${endpoint.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                    ${endpoint.parameters.length > 0 ? `
                        <div class="parameters">
                            <h4>Parameters</h4>
                            ${endpoint.parameters.map(param => `
                                <div class="parameter">
                                    <span class="parameter-name">${param.name}</span>
                                    <span class="parameter-type">${param.type}</span>
                                    ${param.required ? '<span class="parameter-required">required</span>' : ''}
                                    <div>${param.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${endpoint.responses.length > 0 ? `
                        <div class="responses">
                            <h4>Responses</h4>
                            ${endpoint.responses.map(response => `
                                <div class="response">
                                    <span class="response-code">${response.statusCode}</span>
                                    <span class="response-description">${response.description}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate API documentation JSON
   */
  public generateJSONDocumentation(): string {
    return JSON.stringify(this.generateDocumentation(), null, 2);
  }

  /**
   * Generate API documentation YAML
   */
  public generateYAMLDocumentation(): string {
    // This would convert the documentation to YAML format
    // For now, return a placeholder
    return '# API Documentation YAML\n# This would contain the full YAML documentation';
  }

  /**
   * Get endpoint count
   */
  public getEndpointCount(): number {
    return this.endpoints.size;
  }

  /**
   * Get schema count
   */
  public getSchemaCount(): number {
    return this.schemas.size;
  }

  /**
   * Get example count
   */
  public getExampleCount(): number {
    return this.examples.size;
  }

  /**
   * Clear all documentation
   */
  public clearDocumentation(): void {
    this.endpoints.clear();
    this.schemas.clear();
    this.examples.clear();
    this.logger.info('API documentation cleared');
  }

  /**
   * Enable/disable documentation system
   */
  public setEnabled(enabled: boolean): void {
  this._isEnabled = enabled;
  this.logger.info(`API documentation system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if documentation system is enabled
   */
  public isEnabled(): boolean {
  return this._isEnabled;
  }
}

// Export singleton instance
export const apiDocumentationSystem = new APIDocumentationSystem();
