export interface StripeConfig {
  publicKey: string;
  isTestMode: boolean;
}

export interface EnvConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config?: {
    stripe: StripeConfig;
  };
}

/**
 * Validates Stripe configuration
 */
function validateStripeConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config?: StripeConfig;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  const testingKey = import.meta.env.TESTING_VITE_STRIPE_PUBLIC_KEY;

  if (!publicKey && !testingKey) {
    errors.push('No Stripe public key found. Set VITE_STRIPE_PUBLIC_KEY or TESTING_VITE_STRIPE_PUBLIC_KEY');
    return { isValid: false, errors, warnings };
  }

  const keyToUse = publicKey || testingKey;
  const isTestMode = keyToUse?.startsWith('pk_test_') || false;

  if (!keyToUse) {
    errors.push('Stripe public key is empty');
    return { isValid: false, errors, warnings };
  }

  if (!keyToUse.startsWith('pk_')) {
    errors.push('Invalid Stripe public key format. Must start with "pk_"');
    return { isValid: false, errors, warnings };
  }

  if (keyToUse.length < 20) {
    errors.push('Stripe public key appears to be too short');
    return { isValid: false, errors, warnings };
  }

  if (isTestMode) {
    warnings.push('Using Stripe test mode. Real payments will not be processed.');
  }

  if (testingKey && !publicKey) {
    warnings.push('Using testing Stripe key. Make sure to set production key for live environment.');
  }

  const config: StripeConfig = {
    publicKey: keyToUse,
    isTestMode
  };

  return {
    isValid: true,
    errors,
    warnings,
    config
  };
}

/**
 * Validates all environment configuration
 */
export function validateEnvironmentConfig(): EnvConfigValidation {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate Stripe
  const stripeValidation = validateStripeConfig();
  allErrors.push(...stripeValidation.errors);
  allWarnings.push(...stripeValidation.warnings);

  const isValid = allErrors.length === 0;

  const result: EnvConfigValidation = {
    isValid,
    errors: allErrors,
    warnings: allWarnings
  };

  if (isValid && stripeValidation.config) {
    result.config = {
      stripe: stripeValidation.config
    };
  }

  return result;
}

/**
 * Get Stripe configuration with validation
 */
export function getStripeConfig(): StripeConfig | null {
  const validation = validateEnvironmentConfig();
  
  if (!validation.isValid || !validation.config) {
    console.error('Stripe configuration validation failed:', validation.errors);
    return null;
  }

  // Log warnings in development
  if (import.meta.env.DEV && validation.warnings.length > 0) {
    console.warn('Stripe configuration warnings:', validation.warnings);
  }

  return validation.config.stripe;
}

/**
 * Runtime configuration checker
 */
export class ConfigurationError extends Error {
  constructor(message: string, public readonly errors: string[]) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function assertValidConfiguration(): void {
  const validation = validateEnvironmentConfig();
  
  if (!validation.isValid) {
    throw new ConfigurationError(
      'Environment configuration is invalid',
      validation.errors
    );
  }
}

/**
 * Development helper to log configuration status
 */
export function logConfigurationStatus(): void {
  if (!import.meta.env.DEV) return;

  const validation = validateEnvironmentConfig();
  
  console.group('🔧 Environment Configuration Status');
  
  if (validation.isValid) {
    console.log('✅ Configuration is valid');
    if (validation.config?.stripe) {
      console.log(`🔑 Stripe: ${validation.config.stripe.isTestMode ? 'Test Mode' : 'Live Mode'}`);
    }
  } else {
    console.error('❌ Configuration is invalid');
    validation.errors.forEach(error => console.error(`  • ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:');
    validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }
  
  console.groupEnd();
}