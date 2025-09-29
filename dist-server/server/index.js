import "./env-setup.js";
import express from 'express';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './routes.js';
import { securityHeaders, inputValidation } from './middleware/security.js';
import { rateLimits } from './middleware/rate-limiter.js';
import { cacheMiddleware, staticDataCache } from './utils/cache.js';
import { Logger } from './utils/logger.js';
import { liveSessionsManager } from './realtime/live-sessions.js';
import { LIVE_SOCKET_ENABLED } from './env.js';
const app = express();
const logger = new Logger('Server');
app.set('trust proxy', true);
app.use(securityHeaders);
app.use(inputValidation);
app.use(rateLimits.general);
app.get('/health', cacheMiddleware(staticDataCache, 30), (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'SSELFIE Studio',
        timestamp: new Date().toISOString(),
    });
});
app.get('/api/health', cacheMiddleware(staticDataCache, 30), (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        env: process.env['NODE_ENV'] || 'development'
    });
});
app.get('/', (req, res) => {
    res.status(200).send('SSELFIE Studio API');
});
async function setupApp() {
    try {
        console.log('🚀 Setting up SSELFIE Studio server...');
        const isProduction = process.env['NODE_ENV'] === 'production';
        if (isProduction) {
            app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
            console.log('📁 Production: Vercel handling static files, serving attached assets only');
        }
        else {
            const distPath = path.join(process.cwd(), 'client', 'dist');
            if (fs.existsSync(distPath)) {
                app.use(express.static(distPath));
                app.use('/assets', express.static(path.join(distPath, 'assets')));
                app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
                app.get('*', (req, res) => {
                    if (req.path.startsWith('/api/') || req.path === '/health') {
                        return;
                    }
                    res.sendFile(path.join(distPath, 'index.html'));
                });
                console.log('📁 Development: Serving static files from client/dist');
            }
        }
        const server = await registerRoutes(app);
        if (LIVE_SOCKET_ENABLED) {
            liveSessionsManager.initialize(server);
            console.log('🔄 Socket.IO real-time server initialized');
        }
        else {
            console.log('⚡ Socket.IO disabled via LIVE_SOCKET_ENABLED environment variable');
        }
        console.log('✅ Server setup completed successfully');
    }
    catch (error) {
        console.error('❌ Server setup failed:', error);
        throw error;
    }
}
if (process.env['NODE_ENV'] !== 'test') {
    setupApp();
}
export { app, setupApp };
//# sourceMappingURL=index.js.map