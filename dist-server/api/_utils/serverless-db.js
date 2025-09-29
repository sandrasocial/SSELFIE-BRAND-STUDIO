import { cleanup } from '../../server/db.js';
export function withServerlessDb(handler) {
    return async (req, res) => {
        const connectionStartTime = Date.now();
        try {
            const ctx = {
                cleanup: cleanup,
                connectionStartTime
            };
            const result = await handler(req, res, ctx);
            await cleanup();
            return result;
        }
        catch (error) {
            console.error('❌ Serverless handler error:', error);
            try {
                await cleanup();
            }
            catch (cleanupError) {
                console.error('❌ Cleanup error:', cleanupError);
            }
            throw error;
        }
    };
}
export function withNeonServerless(handler) {
    return withServerlessDb(async (req, res, ctx) => {
        const result = await handler(req, res);
        const connectionTime = Date.now() - ctx.connectionStartTime;
        if (connectionTime > 3000) {
            console.warn(`⚠️ Long-running connection: ${connectionTime}ms`);
        }
        return result;
    });
}
export function withHealthHeaders(handler) {
    return async (req, res) => {
        const startTime = Date.now();
        try {
            const result = await handler(req, res);
            const duration = Date.now() - startTime;
            res.setHeader('X-Database-Duration', `${duration}ms`);
            res.setHeader('X-Database-Driver', 'neon-serverless');
            res.setHeader('X-Connection-Type', 'http');
            return result;
        }
        catch (error) {
            res.setHeader('X-Database-Error', 'true');
            res.setHeader('X-Database-Driver', 'neon-serverless');
            throw error;
        }
    };
}
//# sourceMappingURL=serverless-db.js.map