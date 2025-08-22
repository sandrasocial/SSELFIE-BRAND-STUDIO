import bcrypt from 'bcryptjs';
import { executeQuery } from './db';

export const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const checkUserAccess = async (userId: string, feature: string): Promise<boolean> => {
  const result = await executeQuery(
    'SELECT subscription_tier FROM users WHERE id = $1 AND is_active = true',
    [userId]
  );
  
  if (!result.rows[0]) {
    return false;
  }

  const { subscription_tier } = result.rows[0];
  const tierFeatures = subscriptionFeatures[subscription_tier as keyof typeof subscriptionFeatures];
  
  return tierFeatures.features.includes(feature);
};