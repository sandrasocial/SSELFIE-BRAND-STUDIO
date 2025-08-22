import zxcvbn from 'zxcvbn';

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Length check
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  // Complexity check using zxcvbn
  const result = zxcvbn(password);
  if (result.score < 3) {
    errors.push('Password is too weak. Include a mix of letters, numbers, and symbols');
  }

  // Character variety check
  if (!/[A-Z]/.test(password)) errors.push('Include at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Include at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Include at least one number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Include at least one special character');

  return {
    isValid: errors.length === 0,
    errors
  };
};