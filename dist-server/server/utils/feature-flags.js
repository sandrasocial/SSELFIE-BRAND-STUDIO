export class FeatureFlags {
    static flags = {
        NEW_ERROR_HANDLING: process.env.NEW_ERROR_HANDLING === 'true',
        ENHANCED_LOGGING: process.env.ENHANCED_LOGGING === 'true',
        REQUEST_MONITORING: process.env.REQUEST_MONITORING === 'true',
        UNIFIED_AI_SERVICE: process.env.UNIFIED_AI_SERVICE === 'true',
        ROUTE_CONSOLIDATION: process.env.ROUTE_CONSOLIDATION === 'true',
        DATABASE_ABSTRACTION: process.env.DATABASE_ABSTRACTION === 'true',
        COMPREHENSIVE_TESTING: process.env.COMPREHENSIVE_TESTING === 'true',
        PERFORMANCE_MONITORING: process.env.PERFORMANCE_MONITORING === 'true',
        SECURITY_HARDENING: process.env.SECURITY_HARDENING === 'true',
        DEBUG_MODE: process.env['NODE_ENV'] === 'development',
        VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === 'true',
    };
    static isEnabled(flag) {
        return this.flags[flag] || false;
    }
    static setFlag(flag, value) {
        this.flags[flag] = value;
    }
    static getAllFlags() {
        return { ...this.flags };
    }
    static isDevelopment() {
        return this.isEnabled('DEBUG_MODE');
    }
    static shouldLogVerbose() {
        return this.isEnabled('VERBOSE_LOGGING') || this.isDevelopment();
    }
}
//# sourceMappingURL=feature-flags.js.map