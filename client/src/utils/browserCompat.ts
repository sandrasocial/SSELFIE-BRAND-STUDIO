/**
 * Browser compatibility utilities for SSELFIE Studio
 * Handles domain access and URL protocol issues
 */

export const ensureHttps = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// to domains without protocol
  return `https://${url}`;
};

export const redirectToHttps = (): void => {
  if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
};

export const detectBrowserIssues = (): string[] => {
  const issues: string[] = [];
  
  if (typeof window === 'undefined') return issues;
  
  // Check if domain needs manual protocol
  if (window.location.hostname === 'sselfie.ai' && !window.location.protocol.startsWith('https')) {
    issues.push('Domain requires https:// prefix for proper access');
  }
  
  // Check for common browser compatibility issues
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome') && !window.location.protocol.startsWith('https')) {
    issues.push('Chrome requires secure HTTPS connection');
  }
  
  if (userAgent.includes('safari') && window.location.hostname === 'sselfie.ai') {
    // Safari generally handles domain resolution better
    console.log('Safari detected - domain should work without manual protocol');
  }
  
  return issues;
};

export const getCorrectDomainUrl = (): string => {
  return 'https://sselfie.ai';
};

export const showDomainHelp = (): void => {
  if (typeof window !== 'undefined') {
    console.log(`
    SSELFIE STUDIO DOMAIN ACCESS HELP:
    
    If sselfie.ai doesn't load in your browser:
    1. Try typing: https://sselfie.ai (with https://)
    2. Clear your browser cache and cookies
    3. Try in incognito/private mode
    4. Use Chrome or Safari for best compatibility
    
    The platform is live and working at: ${getCorrectDomainUrl()}
    `);
  }
};