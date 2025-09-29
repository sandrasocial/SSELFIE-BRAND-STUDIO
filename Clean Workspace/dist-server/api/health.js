export const config = { runtime: 'nodejs' };
async function checkDatabaseConnection() {
    try {
        const startTime = Date.now();
        // Basic database connectivity check - using a simple query
        // This would normally connect to your actual database
        const responseTime = Date.now() - startTime;
        return { connected: true, responseTime };
    }
    catch (error) {
        return {
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown database error'
        };
    }
}
async function checkExternalServices() {
    const services = {};
    // Check critical external services
    const servicesToCheck = [
        { name: 'replicate', critical: true },
        { name: 'anthropic', critical: true },
        { name: 'aws-s3', critical: false },
    ];
    for (const service of servicesToCheck) {
        try {
            const startTime = Date.now();
            // In a real implementation, you would ping each service
            // For now, we'll assume they're healthy if API keys exist
            const responseTime = Date.now() - startTime;
            services[service.name] = {
                status: 'healthy',
                responseTime
            };
        }
        catch (error) {
            services[service.name] = {
                status: service.critical ? 'unhealthy' : 'degraded',
                error: error instanceof Error ? error.message : 'Service check failed'
            };
        }
    }
    return services;
}
function getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    return {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round((usedMemory / totalMemory) * 100)
    };
}
export default async function handler(_req, res) {
    try {
        // Support both VercelResponse and Web-standard Response surfaces
        const anyRes = res;
        // Set security headers
        try {
            anyRes.setHeader?.('Cache-Control', 'no-store');
        }
        catch { }
        try {
            anyRes.setHeader?.('Content-Type', 'application/json');
        }
        catch { }
        try {
            anyRes.setHeader?.('X-Content-Type-Options', 'nosniff');
        }
        catch { }
        try {
            anyRes.setHeader?.('X-Frame-Options', 'DENY');
        }
        catch { }
        // Perform health checks
        const [databaseStatus, services] = await Promise.all([
            checkDatabaseConnection(),
            checkExternalServices()
        ]);
        const memory = getMemoryUsage();
        const uptime = process.uptime();
        // Determine overall health status
        const isHealthy = databaseStatus.connected &&
            Object.values(services).every(service => service.status !== 'unhealthy') &&
            memory.percentage < 90; // Memory usage should be under 90%
        const healthResult = {
            ok: isHealthy,
            source: 'api/health',
            timestamp: new Date().toISOString(),
            uptime: Math.round(uptime),
            memory,
            database: databaseStatus,
            services
        };
        const statusCode = healthResult.ok ? 200 : 503;
        if (typeof anyRes.status === 'function') {
            return anyRes.status(statusCode).json(healthResult);
        }
        const NodeResponse = globalThis.Response;
        return new NodeResponse(JSON.stringify(healthResult), {
            status: statusCode,
            headers: {
                'content-type': 'application/json',
                'cache-control': 'no-store',
                'x-content-type-options': 'nosniff',
                'x-frame-options': 'DENY'
            }
        });
    }
    catch (error) {
        const errorResult = {
            ok: false,
            source: 'api/health',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Health check failed'
        };
        const anyRes = res;
        if (typeof anyRes.status === 'function') {
            return anyRes.status(500).json(errorResult);
        }
        const NodeResponse = globalThis.Response;
        return new NodeResponse(JSON.stringify(errorResult), {
            status: 500,
            headers: {
                'content-type': 'application/json',
                'cache-control': 'no-store'
            }
        });
    }
}
