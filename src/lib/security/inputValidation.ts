import { sanitizeHtml } from 'sanitize-html';

export const validateInput = (input: string): string => {
  return sanitizeHtml(input, {
    allowedTags: [ 'b', 'i', 'em', 'strong' ],
    allowedAttributes: {}
  });
};

export const validateFileUpload = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const validateRedirect = (url: string): boolean => {
  const allowedDomains = ['.sselfie.com'];
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.endsWith(domain));
  } catch {
    return false;
  }
};