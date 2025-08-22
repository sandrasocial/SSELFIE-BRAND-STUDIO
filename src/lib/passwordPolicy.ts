export const validatePassword = (password: string): { valid: boolean; message: string } => {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 12 characters long' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain uppercase letters' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain lowercase letters' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain numbers' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain special characters' };
  }

  return { valid: true, message: 'Password meets requirements' };
};