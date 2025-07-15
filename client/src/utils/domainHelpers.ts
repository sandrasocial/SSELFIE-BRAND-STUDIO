/**
 * Domain compatibility utilities for SSELFIE Studio
 * Handles cross-browser domain access and HTTPS enforcement
 */

export class DomainHelpers {
  static readonly PRODUCTION_DOMAIN = 'sselfie.ai';
  static readonly PRODUCTION_URL = `https://${DomainHelpers.PRODUCTION_DOMAIN}`;
  
  /**
   * Get the current domain with proper protocol
   */
  static getCurrentDomain(): string {
    if (typeof window === 'undefined') return '';
    
    const { hostname, protocol } = window.location;
    
    // Force HTTPS for production domain
    if (hostname === DomainHelpers.PRODUCTION_DOMAIN) {
      return protocol === 'https:' ? 
        `https://${hostname}` : 
        `https://${hostname}`;
    }
    
    return `${protocol}//${hostname}`;
  }
  
  /**
   * Check if current domain needs HTTPS redirect
   */
  static needsHttpsRedirect(): boolean {
    if (typeof window === 'undefined') return false;
    
    const { hostname, protocol } = window.location;
    return hostname === DomainHelpers.PRODUCTION_DOMAIN && protocol !== 'https:';
  }
  
  /**
   * Redirect to HTTPS if needed
   */
  static enforceHttps(): void {
    if (DomainHelpers.needsHttpsRedirect()) {
      window.location.href = `https://${window.location.hostname}${window.location.pathname}${window.location.search}`;
    }
  }
  
  /**
   * Check if domain is accessible
   */
  static async checkDomainHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health-check', {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.warn('Domain health check failed:', error);
      return false;
    }
  }
  
  /**
   * Get browser-compatible login URL
   */
  static getLoginUrl(): string {
    const currentDomain = DomainHelpers.getCurrentDomain();
    return `${currentDomain}/login`;
  }
  
  /**
   * Handle domain compatibility warnings
   */
  static showDomainWarning(): void {
    if (typeof window === 'undefined') return;
    
    const { hostname, protocol } = window.location;
    
    if (hostname === DomainHelpers.PRODUCTION_DOMAIN && protocol !== 'https:') {
      console.warn('⚠️ SSELFIE Studio requires HTTPS. Redirecting...');
      DomainHelpers.enforceHttps();
    }
    
    if (hostname === `www.${DomainHelpers.PRODUCTION_DOMAIN}`) {
      console.warn('⚠️ Redirecting from www subdomain to main domain...');
      window.location.href = `https://${DomainHelpers.PRODUCTION_DOMAIN}${window.location.pathname}`;
    }
  }
}

// Auto-enforce HTTPS on production domain
if (typeof window !== 'undefined') {
  DomainHelpers.showDomainWarning();
}