/**
 * Service Integration Templates
 * Pre-configured setups for common external services
 * SSELFIE Studio Enhancement Project - Victoria Implementation
 */

interface ServiceTemplate {
  name: string;
  description: string;
  requiredEnvVars: string[];
  defaultConfig: Record<string, any>;
  setupInstructions: string[];
}

export const serviceTemplates: Record<string, ServiceTemplate> = {
  stripe: {
    name: "Stripe Payment Processing",
    description: "Complete payment processing integration with subscription support",
    requiredEnvVars: [
      "STRIPE_PUBLISHABLE_KEY",
      "STRIPE_SECRET_KEY", 
      "STRIPE_WEBHOOK_SECRET"
    ],
    defaultConfig: {
      currency: "eur",
      paymentMethods: ["card"],
      collectBillingAddress: true,
      automaticTax: true
    },
    setupInstructions: [
      "Create Stripe account at stripe.com",
      "Generate API keys from dashboard",
      "Configure webhook endpoints",
      "Set up product catalog",
      "Enable subscription billing"
    ]
  },

  resend: {
    name: "Resend Email Service", 
    description: "Luxury email delivery with high deliverability rates",
    requiredEnvVars: [
      "RESEND_API_KEY",
      "RESEND_FROM_EMAIL"
    ],
    defaultConfig: {
      from: "SSELFIE Studio <hello@sselfie.ai>",
      replyTo: "support@sselfie.ai",
      trackOpens: true,
      trackClicks: true
    },
    setupInstructions: [
      "Create Resend account",
      "Verify domain ownership", 
      "Generate API key",
      "Configure DNS records",
      "Set up email templates"
    ]
  },

  flodesk: {
    name: "Flodesk Email Marketing",
    description: "Beautiful email marketing automation platform",
    requiredEnvVars: [
      "FLODESK_API_KEY",
      "FLODESK_API_SECRET"
    ],
    defaultConfig: {
      listId: null,
      tagOnSignup: "sselfie-member",
      automationTrigger: "new-subscriber"
    },
    setupInstructions: [
      "Create Flodesk account",
      "Generate API credentials",
      "Create email sequences",
      "Set up automation workflows",
      "Design branded templates"
    ]
  },

  manychat: {
    name: "ManyChat Automation",
    description: "Instagram and Facebook Messenger automation",
    requiredEnvVars: [
      "MANYCHAT_API_TOKEN",
      "MANYCHAT_PAGE_ID"
    ],
    defaultConfig: {
      platform: "instagram",
      autoReply: true,
      leadGeneration: true,
      broadcastEnabled: true
    },
    setupInstructions: [
      "Connect Instagram Business account",
      "Generate ManyChat API token",
      "Set up automation flows",
      "Create lead magnets",
      "Configure broadcast sequences"
    ]
  }
};

export class ServiceIntegrationManager {
  /**
   * Validate service configuration
   */
  validateServiceConfig(serviceName: string): {
    isValid: boolean;
    missingVars: string[];
    recommendations: string[];
  } {
    const template = serviceTemplates[serviceName];
    if (!template) {
      return {
        isValid: false,
        missingVars: [],
        recommendations: [`Service "${serviceName}" not found in templates`]
      };
    }

    const missingVars = template.requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    const recommendations = missingVars.length > 0 
      ? [`Add missing environment variables: ${missingVars.join(', ')}`]
      : ['Service configuration is complete'];

    return {
      isValid: missingVars.length === 0,
      missingVars,
      recommendations
    };
  }

  /**
   * Get service setup guide
   */
  getSetupGuide(serviceName: string): ServiceTemplate | null {
    return serviceTemplates[serviceName] || null;
  }

  /**
   * Initialize service with default configuration
   */
  initializeService(serviceName: string): {
    success: boolean;
    config: Record<string, any>;
    nextSteps: string[];
  } {
    const template = serviceTemplates[serviceName];
    if (!template) {
      return {
        success: false,
        config: {},
        nextSteps: [`Service "${serviceName}" not found`]
      };
    }

    const validation = this.validateServiceConfig(serviceName);
    
    return {
      success: validation.isValid,
      config: template.defaultConfig,
      nextSteps: validation.isValid 
        ? ['Service ready for use']
        : template.setupInstructions
    };
  }

  /**
   * Get all available service templates
   */
  listAvailableServices(): string[] {
    return Object.keys(serviceTemplates);
  }
}

export const integrationManager = new ServiceIntegrationManager();