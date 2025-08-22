const rateLimiter = {
  // General API rate limits
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour for login/signup
    message: 'Too many authentication attempts, please try again later'
  },
  
  // Content creation endpoints
  content: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute for content operations
    message: 'Please wait before creating more content'
  },

  // Suspicious activity detection
  security: {
    // Track failed login attempts
    failedLoginThreshold: 3,
    failedLoginWindow: 30 * 60 * 1000, // 30 minutes
    
    // Track rapid-fire requests
    burstThreshold: 20,
    burstWindow: 10 * 1000, // 10 seconds
    
    // IP-based blocking
    blockDuration: 24 * 60 * 60 * 1000, // 24 hours
    
    // Notification thresholds
    alertAdminAfterAttempts: 10
  }
}