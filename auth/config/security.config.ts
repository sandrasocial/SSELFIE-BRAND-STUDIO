export const SecurityConfig = {
  passwords: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordHistory: 5
  },
  
  rateLimiting: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDuration: 60 * 60 * 1000 // 1 hour
  },

  tokens: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    tokenSecret: process.env.TOKEN_SECRET,
    minimumEntropy: 128
  },

  sessions: {
    maxConcurrentSessions: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    extendOnActivity: true
  },

  passwordReset: {
    tokenExpiry: '1h',
    preventReuse: true,
    enforcePasswordChange: true
  },

  headers: {
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    contentSecurityPolicy: "default-src 'self'",
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff'
  }
};