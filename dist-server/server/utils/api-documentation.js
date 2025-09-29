import { Logger } from './logger.js';
export class APIDocumentationSystem {
    logger;
    endpoints;
    schemas;
    examples;
    _isEnabled;
    constructor() {
        this.logger = new Logger('APIDocumentationSystem');
        this.endpoints = new Map();
        this.schemas = new Map();
        this.examples = new Map();
        this._isEnabled = true;
    }
    registerEndpoint(endpoint) {
        if (!this._isEnabled) {
            return;
        }
        const key = `${endpoint.method.toUpperCase()}:${endpoint.path}`;
        this.endpoints.set(key, endpoint);
        this.logger.debug('API endpoint registered', { key, endpoint: endpoint.path });
    }
    registerSchema(name, schema) {
        if (!this._isEnabled) {
            return;
        }
        this.schemas.set(name, schema);
        this.logger.debug('Schema registered', { name });
    }
    registerExample(name, example) {
        if (!this._isEnabled) {
            return;
        }
        this.examples.set(name, example);
        this.logger.debug('Example registered', { name });
    }
    generateDocumentation() {
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
    getEndpointDocumentation(method, path) {
        const key = `${method.toUpperCase()}:${path}`;
        return this.endpoints.get(key) || null;
    }
    getEndpointsByTag(tag) {
        return Array.from(this.endpoints.values()).filter(endpoint => endpoint.tags.includes(tag));
    }
    getEndpointsByMethod(method) {
        return Array.from(this.endpoints.values()).filter(endpoint => endpoint.method.toUpperCase() === method.toUpperCase());
    }
    getEndpointsByVersion(version) {
        return Array.from(this.endpoints.values()).filter(endpoint => endpoint.version === version);
    }
    getDeprecatedEndpoints() {
        return Array.from(this.endpoints.values()).filter(endpoint => endpoint.deprecated);
    }
    generateOpenAPISpec() {
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
    generatePaths() {
        const paths = {};
        for (const endpoint of this.endpoints.values()) {
            if (!paths[endpoint.path]) {
                paths[endpoint.path] = {};
            }
            const operation = {
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
    generateTags() {
        const tagSet = new Set();
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
    getTagDescription(tag) {
        const descriptions = {
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
    getParameterLocation(name, path) {
        if (path.includes(`{${name}}`)) {
            return 'path';
        }
        return 'query';
    }
    getChangelog() {
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
    generateHTMLDocumentation() {
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
    generateJSONDocumentation() {
        return JSON.stringify(this.generateDocumentation(), null, 2);
    }
    generateYAMLDocumentation() {
        return '# API Documentation YAML\n# This would contain the full YAML documentation';
    }
    getEndpointCount() {
        return this.endpoints.size;
    }
    getSchemaCount() {
        return this.schemas.size;
    }
    getExampleCount() {
        return this.examples.size;
    }
    clearDocumentation() {
        this.endpoints.clear();
        this.schemas.clear();
        this.examples.clear();
        this.logger.info('API documentation cleared');
    }
    setEnabled(enabled) {
        this._isEnabled = enabled;
        this.logger.info(`API documentation system ${enabled ? 'enabled' : 'disabled'}`);
    }
    isEnabled() {
        return this._isEnabled;
    }
}
export const apiDocumentationSystem = new APIDocumentationSystem();
//# sourceMappingURL=api-documentation.js.map