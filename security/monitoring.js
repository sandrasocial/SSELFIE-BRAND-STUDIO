const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { createLogger, format, transports } = winston;

// Configure security logger
const securityLogger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/security.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Login attempt monitoring
const loginMonitoring = {
  trackLoginAttempt: (username, success, ip) => {
    securityLogger.info('Login attempt', {
      username,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  }
};

// Rate limiting configuration
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    securityLogger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).send('Too many requests');
  }
});

// Security alert system
const securityAlerts = {
  triggerAlert: (type, details) => {
    securityLogger.warn('Security Alert', {
      type,
      details,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement notification service integration
    // This will be connected to our notification system
  }
};

module.exports = {
  loginMonitoring,
  rateLimiter,
  securityAlerts,
  securityLogger
};