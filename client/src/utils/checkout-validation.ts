export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface EmailValidationResult extends ValidationResult {
  suggestions?: string[];
}

/**
 * Validates email format with comprehensive checks
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: 'Email address is required'
    };
  }

  email = email.trim().toLowerCase();

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Check for common typos in domains
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'icloud.com', 'aol.com', 'protonmail.com'
  ];
  
  const domain = email.split('@')[1];
  const suggestions: string[] = [];

  // Common typo corrections
  const typoCorrections: Record<string, string> = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  if (typoCorrections[domain]) {
    const correctedEmail = email.replace(domain, typoCorrections[domain]);
    suggestions.push(correctedEmail);
  }

  // Length checks
  if (email.length > 320) {
    return {
      isValid: false,
      error: 'Email address is too long'
    };
  }

  const localPart = email.split('@')[0];
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email address format is invalid'
    };
  }

  return {
    isValid: true,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

/**
 * Validates payment amount
 */
export function validatePaymentAmount(amount: number): ValidationResult {
  if (!amount || amount <= 0) {
    return {
      isValid: false,
      error: 'Payment amount must be greater than zero'
    };
  }

  if (amount < 0.50) {
    return {
      isValid: false,
      error: 'Minimum payment amount is €0.50'
    };
  }

  if (amount > 9999.99) {
    return {
      isValid: false,
      error: 'Maximum payment amount is €9,999.99'
    };
  }

  return { isValid: true };
}

/**
 * Pre-submission validation for checkout form
 */
export interface CheckoutFormData {
  email: string;
  amount: number;
  plan: string;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  suggestions?: Record<string, string[]>;
}

export function validateCheckoutForm(data: CheckoutFormData): CheckoutValidationResult {
  const errors: Record<string, string> = {};
  const suggestions: Record<string, string[]> = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  } else if (emailValidation.suggestions) {
    suggestions.email = emailValidation.suggestions;
  }

  // Validate amount
  const amountValidation = validatePaymentAmount(data.amount);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.error!;
  }

  // Validate plan
  if (!data.plan || !data.plan.trim()) {
    errors.plan = 'Plan selection is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    suggestions: Object.keys(suggestions).length > 0 ? suggestions : undefined
  };
}

/**
 * Real-time email validation for UX
 */
export function validateEmailRealtime(email: string): {
  isValid: boolean;
  status: 'valid' | 'invalid' | 'empty' | 'incomplete';
  message?: string;
} {
  if (!email) {
    return { isValid: false, status: 'empty' };
  }

  email = email.trim();

  if (email.length < 3) {
    return { isValid: false, status: 'incomplete' };
  }

  if (!email.includes('@')) {
    return { 
      isValid: false, 
      status: 'incomplete', 
      message: 'Include an @ symbol' 
    };
  }

  const validation = validateEmail(email);
  return {
    isValid: validation.isValid,
    status: validation.isValid ? 'valid' : 'invalid',
    message: validation.error
  };
}