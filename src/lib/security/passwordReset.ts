import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const validatePassword = (password: string): boolean => {
  const minLength = 12;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return password.length >= minLength && hasSpecialChar && hasNumber;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const verifyResetToken = async (token: string, storedToken: string): Promise<boolean> => {
  if (!token || !storedToken) return false;
  
  const tokenExpiry = 1 * 60 * 60 * 1000; // 1 hour
  const tokenData = await getStoredToken(storedToken);
  
  return token === tokenData.token && 
         Date.now() - tokenData.created < tokenExpiry;
};