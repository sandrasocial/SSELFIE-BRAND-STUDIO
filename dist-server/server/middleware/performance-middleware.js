import compression from 'compression';
export const compressionMiddleware = compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024
});
export const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
            res.setHeader('Cache-Control', `public, max-age=${duration}`);
        }
        next();
    };
};
export const apiOptimizationMiddleware = (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();
    res.send = function (data) {
        const responseTime = Date.now() - startTime;
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        res.setHeader('X-Powered-By', 'SSELFIE-Studio');
        if (responseTime > 1000) {
            console.warn(`Slow API response: ${req.method} ${req.url} took ${responseTime}ms`);
        }
        return originalSend.call(this, data);
    };
    next();
};
export const requestSizeLimiter = (limit = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('content-length') || '0', 10);
        const maxSize = parseInt(limit.replace(/[^\d]/g, '')) * (limit.includes('mb') ? 1024 * 1024 : 1024);
        if (contentLength > maxSize) {
            return res.status(413).json({
                error: 'Request entity too large',
                maxSize: limit,
                receivedSize: `${Math.round(contentLength / 1024)}KB`
            });
        }
        next();
    };
};
export const memoryMonitor = (req, res, next) => {
    const memUsage = process.memoryUsage();
    const memoryMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
    };
    if (memoryMB.heapUsed > 512) {
        console.warn(`High memory usage detected: ${memoryMB.heapUsed}MB heap used`);
    }
    if (process.env['NODE_ENV'] === 'development') {
        res.setHeader('X-Memory-Usage', JSON.stringify(memoryMB));
    }
    next();
};
//# sourceMappingURL=performance-middleware.js.map