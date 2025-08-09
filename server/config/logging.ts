import winston from 'winston';
import newrelic from 'newrelic';

// Configure Winston logger
// Consolidated logging configuration
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Performance monitoring wrapper
export const trackPerformance = (name: string, fn: Function) => {
  return async (...args: any[]) => {
    const startTime = Date.now();
    try {
      const result = await fn(...args);
      newrelic.recordMetric(`Custom/${name}/duration`, Date.now() - startTime);
      return result;
    } catch (error) {
      newrelic.noticeError(error);
      throw error;
    }
  };
};