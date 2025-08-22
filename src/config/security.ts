export const securityConfig = {
    csrf: {
        enabled: true,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxAttempts: 5,
        blockDuration: 60 * 60 * 1000 // 1 hour
    },
    audit: {
        enabled: true,
        logLevel: 'info',
        logPath: 'logs/security.log'
    }
};