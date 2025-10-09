// Enhanced Training System Type Definitions
// Provides comprehensive typing for image processing, training flow, and error handling
// Default configurations following the requirements
export const DEFAULT_IMAGE_PROCESSING_OPTIONS = {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
    format: 'jpeg'
};
export const DEFAULT_VALIDATION_RULES = {
    minImages: 10,
    maxImages: 20,
    minFileSize: 50 * 1024, // 50KB
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};
export const DEFAULT_RETRY_STRATEGIES = {
    upload: {
        maxAttempts: 3,
        backoffMs: 1000,
        backoffMultiplier: 2
    },
    training: {
        maxAttempts: 5,
        backoffMs: 5000,
        backoffMultiplier: 1.5
    },
    validation: {
        maxAttempts: 2,
        backoffMs: 500,
        backoffMultiplier: 2
    }
};
export const DEFAULT_ADAPTIVE_POLLING = {
    initialInterval: 5000,
    maxInterval: 30000,
    progressThresholds: {
        0: 5000, // 0-25%: 5s
        25: 10000, // 25-50%: 10s
        50: 15000, // 50-75%: 15s
        75: 30000 // 75-100%: 30s
    }
};
