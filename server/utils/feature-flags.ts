/**
 * Feature Flag System
 * Safe way to enable/disable features without breaking existing functionality
 */

export class FeatureFlags {
  private static flags: Record<string, boolean> = {
    // Phase 1: Safety and Error Handling
    NEW_ERROR_HANDLING: process.env.NEW_ERROR_HANDLING === 'true',
    ENHANCED_LOGGING: process.env.ENHANCED_LOGGING === 'true',
    REQUEST_MONITORING: process.env.REQUEST_MONITORING === 'true',
    
    // Phase 2: Architecture Improvements
    UNIFIED_AI_SERVICE: process.env.UNIFIED_AI_SERVICE === 'true',
    ROUTE_CONSOLIDATION: process.env.ROUTE_CONSOLIDATION === 'true',
    DATABASE_ABSTRACTION: process.env.DATABASE_ABSTRACTION === 'true',
    
    // Phase 3: Modernization
    COMPREHENSIVE_TESTING: process.env.COMPREHENSIVE_TESTING === 'true',
    PERFORMANCE_MONITORING: process.env.PERFORMANCE_MONITORING === 'true',
    SECURITY_HARDENING: process.env.SECURITY_HARDENING === 'true',
    
    // Development flags
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === 'true',
  };

  /**
   * Check if a feature flag is enabled
   */
  static isEnabled(flag: string): boolean {
    return this.flags[flag] || false;
  }

  /**
   * Set a feature flag value (for testing)
   */
  static setFlag(flag: string, value: boolean): void {
    this.flags[flag] = value;
  }

  /**
   * Get all feature flags (for debugging)
   */
  static getAllFlags(): Record<string, boolean> {
    return { ...this.flags };
  }

  /**
   * Check if we're in development mode
   */
  static isDevelopment(): boolean {
    return this.isEnabled('DEBUG_MODE');
  }

  /**
   * Check if enhanced logging is enabled
   */
  static shouldLogVerbose(): boolean {
    return this.isEnabled('VERBOSE_LOGGING') || this.isDevelopment();
  }
}

// Usage examples:
// if (FeatureFlags.isEnabled('NEW_ERROR_HANDLING')) {
//   // Use new error handling
// } else {
//   // Use old error handling
// }
