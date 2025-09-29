/**
 * Environment Variable Validation
 * This file ensures all required environment variables are present and properly typed
 */
export function validateEnv() {
    const requiredVars = [
        // Database
        'NEON_DB_URL',
        // Authentication
        'STACK_AUTH_PROJECT_ID',
        'STACK_AUTH_SECRET_KEY',
        // Frontend Public
        'VITE_STACK_PROJECT_ID',
        'VITE_STACK_PUBLISHABLE_CLIENT_KEY',
        // AWS S3
        'AWS_S3_BUCKET_NAME',
        'AWS_S3_REGION',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        // Stripe
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET',
        // Email
        'SENDGRID_API_KEY',
        'SENDGRID_FROM_EMAIL',
        // VEO 3
        'VEO_3_API_KEY',
        'VEO_3_API_ENDPOINT',
        'VEO_3_API_VERSION',
        // Security
        'JWT_SECRET',
        'COOKIE_SECRET',
        'ENCRYPTION_KEY',
        // CDN
        'CDN_URL',
        'CDN_API_KEY',
        'CDN_ZONE_ID'
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    return process.env;
}
export const env = validateEnv();
