const { loginMonitoring, rateLimiter, securityAlerts } = require('./monitoring');
const scanner = require('./scanner');

const securityConfig = {
  // Security thresholds
  thresholds: {
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    passwordMinLength: 12,
    sessionTimeout: 2 * 60 * 60 * 1000 // 2 hours
  },

  // Security headers
  headers: {
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// Initialize security monitoring
const initializeSecurity = (app) => {
  // Apply rate limiting
  app.use(rateLimiter);

  // Apply security headers
  app.use((req, res, next) => {
    Object.entries(securityConfig.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    next();
  });

  // Start security scanner
  scanner.scheduleScans();

  return {
    trackLogin: loginMonitoring.trackLoginAttempt,
    triggerAlert: securityAlerts.triggerAlert
  };
};

module.exports = {
  securityConfig,
  initializeSecurity
};