/**
 * API Orchestration Layer
 * Simplified external service connection management
 */

import { EventEmitter } from 'events';

export interface ServiceConfig {
  id: string;
  name: string;
  type: 'payment' | 'email' | 'storage' | 'ai' | 'analytics';
  apiKey?: string;
  baseUrl?: string;
  config: Record<string, any>;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastHealthCheck?: Date;
  errorMessage?: string;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  type: ServiceConfig['type'];
  description: string;
  configFields: ServiceConfigField[];
  setupInstructions: string[];
  testEndpoint?: string;
}

export interface ServiceConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number' | 'boolean' | 'select';
  required: boolean;
  description?: string;
  options?: { value: string; label: string; }[];
  placeholder?: string;
  validation?: string;
}

class APIOrchestrationLayer extends EventEmitter {
  private services: Map<string, ServiceConfig> = new Map();
  private templates: Map<string, ServiceTemplate> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeDefaultTemplates();
    this.startHealthChecks();
  }

  private initializeDefaultTemplates() {
    // Stripe template
    this.templates.set('stripe', {
      id: 'stripe',
      name: 'Stripe Payments',
      type: 'payment',
      description: 'Accept payments and manage subscriptions',
      configFields: [
        {
          key: 'publishableKey',
          label: 'Publishable Key',
          type: 'text',
          required: true,
          description: 'Your Stripe publishable key (starts with pk_)',
          placeholder: 'pk_test_...'
        },
        {
          key: 'secretKey',
          label: 'Secret Key',
          type: 'password',
          required: true,
          description: 'Your Stripe secret key (starts with sk_)',
          placeholder: 'sk_test_...'
        },
        {
          key: 'webhookSecret',
          label: 'Webhook Secret',
          type: 'password',
          required: false,
          description: 'Webhook endpoint secret for event verification'
        }
      ],
      setupInstructions: [
        'Sign up for a Stripe account at stripe.com',
        'Navigate to API keys in your dashboard',
        'Copy your publishable and secret keys',
        'Set up webhook endpoints if needed'
      ],
      testEndpoint: '/api/services/stripe/test'
    });

    // SendGrid template
    this.templates.set('sendgrid', {
      id: 'sendgrid',
      name: 'SendGrid Email',
      type: 'email',
      description: 'Send transactional and marketing emails',
      configFields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          description: 'Your SendGrid API key',
          placeholder: 'SG.xxx'
        },
        {
          key: 'fromEmail',
          label: 'From Email',
          type: 'text',
          required: true,
          description: 'Default sender email address',
          placeholder: 'noreply@yourdomain.com'
        },
        {
          key: 'fromName',
          label: 'From Name',
          type: 'text',
          required: false,
          description: 'Default sender name',
          placeholder: 'Your Company'
        }
      ],
      setupInstructions: [
        'Create a SendGrid account',
        'Generate an API key with full access',
        'Verify your sender identity',
        'Configure domain authentication'
      ],
      testEndpoint: '/api/services/sendgrid/test'
    });

    // Anthropic Claude template
    this.templates.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic Claude',
      type: 'ai',
      description: 'AI assistance and text generation',
      configFields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          required: true,
          description: 'Your Anthropic API key',
          placeholder: 'sk-ant-...'
        },
        {
          key: 'model',
          label: 'Default Model',
          type: 'select',
          required: true,
          description: 'Choose the Claude model to use',
          options: [
            { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
            { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
          ]
        }
      ],
      setupInstructions: [
        'Sign up for Anthropic Console',
        'Generate an API key',
        'Configure usage limits',
        'Test the connection'
      ],
      testEndpoint: '/api/services/anthropic/test'
    });
  }

  // Service Management
  async addService(config: Omit<ServiceConfig, 'status' | 'lastHealthCheck'>): Promise<ServiceConfig> {
    const serviceConfig: ServiceConfig = {
      ...config,
      status: 'disconnected',
      lastHealthCheck: new Date()
    };

    this.services.set(config.id, serviceConfig);
    
    // Test connection
    await this.testService(config.id);
    
    this.emit('serviceAdded', serviceConfig);
    return serviceConfig;
  }

  async updateService(id: string, updates: Partial<ServiceConfig>): Promise<ServiceConfig | null> {
    const service = this.services.get(id);
    if (!service) return null;

    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);

    // Re-test connection if config changed
    if (updates.apiKey || updates.config) {
      await this.testService(id);
    }

    this.emit('serviceUpdated', updatedService);
    return updatedService;
  }

  removeService(id: string): boolean {
    const success = this.services.delete(id);
    if (success) {
      this.emit('serviceRemoved', id);
    }
    return success;
  }

  getService(id: string): ServiceConfig | null {
    return this.services.get(id) || null;
  }

  getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  getServicesByType(type: ServiceConfig['type']): ServiceConfig[] {
    return Array.from(this.services.values()).filter(service => service.type === type);
  }

  // Template Management
  getTemplate(id: string): ServiceTemplate | null {
    return this.templates.get(id) || null;
  }

  getAllTemplates(): ServiceTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByType(type: ServiceConfig['type']): ServiceTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.type === type);
  }

  // Service Testing
  async testService(id: string): Promise<{ success: boolean; message: string; data?: any }> {
    const service = this.services.get(id);
    if (!service) {
      return { success: false, message: 'Service not found' };
    }

    try {
      let result;
      
      switch (service.type) {
        case 'payment':
          if (service.id === 'stripe') {
            result = await this.testStripe(service);
          }
          break;
        case 'email':
          if (service.id === 'sendgrid') {
            result = await this.testSendGrid(service);
          }
          break;
        case 'ai':
          if (service.id === 'anthropic') {
            result = await this.testAnthropic(service);
          }
          break;
        default:
          result = { success: false, message: 'Unknown service type' };
      }

      // Update service status
      if (result && result.success) {
        service.status = 'connected';
        service.errorMessage = undefined;
      } else {
        service.status = 'error';
        service.errorMessage = result?.message || 'Unknown error';
      }
      service.lastHealthCheck = new Date();

      this.emit('serviceTested', { service, result });
      return result || { success: false, message: 'Test failed' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      service.status = 'error';
      service.errorMessage = errorMessage;
      service.lastHealthCheck = new Date();

      this.emit('serviceTestError', { service, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  }

  private async testStripe(service: ServiceConfig): Promise<{ success: boolean; message: string; data?: any }> {
    // Mock Stripe test - in real implementation, would test API connection
    if (!service.config.secretKey) {
      return { success: false, message: 'Secret key is required' };
    }

    if (!service.config.secretKey.startsWith('sk_')) {
      return { success: false, message: 'Invalid secret key format' };
    }

    return { 
      success: true, 
      message: 'Stripe connection successful',
      data: { mode: service.config.secretKey.includes('test') ? 'test' : 'live' }
    };
  }

  private async testSendGrid(service: ServiceConfig): Promise<{ success: boolean; message: string; data?: any }> {
    // Mock SendGrid test
    if (!service.config.apiKey) {
      return { success: false, message: 'API key is required' };
    }

    if (!service.config.apiKey.startsWith('SG.')) {
      return { success: false, message: 'Invalid API key format' };
    }

    return { 
      success: true, 
      message: 'SendGrid connection successful',
      data: { fromEmail: service.config.fromEmail }
    };
  }

  private async testAnthropic(service: ServiceConfig): Promise<{ success: boolean; message: string; data?: any }> {
    // Mock Anthropic test
    if (!service.config.apiKey) {
      return { success: false, message: 'API key is required' };
    }

    if (!service.config.apiKey.startsWith('sk-ant-')) {
      return { success: false, message: 'Invalid API key format' };
    }

    return { 
      success: true, 
      message: 'Anthropic connection successful',
      data: { model: service.config.model }
    };
  }

  // Health Checks
  private startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      for (const [id] of Array.from(this.services.keys())) {
        await this.testService(id);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Service Operations
  async executeServiceOperation(serviceId: string, operation: string, params: any = {}): Promise<any> {
    const service = this.services.get(serviceId);
    if (!service || service.status !== 'connected') {
      throw new Error(`Service ${serviceId} is not available`);
    }

    this.emit('operationStarted', { serviceId, operation, params });

    try {
      let result;
      
      switch (service.type) {
        case 'payment':
          result = await this.executePaymentOperation(service, operation, params);
          break;
        case 'email':
          result = await this.executeEmailOperation(service, operation, params);
          break;
        case 'ai':
          result = await this.executeAIOperation(service, operation, params);
          break;
        default:
          throw new Error(`Unknown service type: ${service.type}`);
      }

      this.emit('operationCompleted', { serviceId, operation, params, result });
      return result;

    } catch (error) {
      this.emit('operationFailed', { serviceId, operation, params, error });
      throw error;
    }
  }

  private async executePaymentOperation(service: ServiceConfig, operation: string, params: any): Promise<any> {
    // Implement payment operations (create payment, refund, etc.)
    throw new Error('Payment operations not yet implemented');
  }

  private async executeEmailOperation(service: ServiceConfig, operation: string, params: any): Promise<any> {
    // Implement email operations (send email, create template, etc.)
    throw new Error('Email operations not yet implemented');
  }

  private async executeAIOperation(service: ServiceConfig, operation: string, params: any): Promise<any> {
    // Implement AI operations (generate text, analyze content, etc.)
    throw new Error('AI operations not yet implemented');
  }

  // Utility methods
  getServiceHealth(): { total: number; connected: number; errors: number; } {
    const services = Array.from(this.services.values());
    return {
      total: services.length,
      connected: services.filter(s => s.status === 'connected').length,
      errors: services.filter(s => s.status === 'error').length
    };
  }

  exportConfiguration(): ServiceConfig[] {
    return Array.from(this.services.values()).map(service => ({
      ...service,
      // Remove sensitive data
      apiKey: service.apiKey ? '***' : undefined,
      config: Object.fromEntries(
        Object.entries(service.config).map(([key, value]) => [
          key,
          key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? '***' : value
        ])
      )
    }));
  }
}

// Export singleton instance
export const apiOrchestrator = new APIOrchestrationLayer();
export default apiOrchestrator;