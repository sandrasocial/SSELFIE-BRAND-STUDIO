import winston from 'winston';
import newrelic from 'newrelic';
// Configure Winston logger
export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});
// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}
// Configure performance monitoring
export const monitoring = {
    trackError: (error) => {
        logger.error(error.message, { stack: error.stack });
        newrelic.noticeError(error);
    },
    trackMetric: (name, value) => {
        newrelic.recordMetric(name, value);
        logger.info(`Metric recorded: ${name}`, { value });
    },
    trackEvent: (name, attributes) => {
        newrelic.recordCustomEvent(name, attributes);
        logger.info(`Event recorded: ${name}`, attributes);
    }
};
