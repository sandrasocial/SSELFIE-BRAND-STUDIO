export const config = {
    runtime: 'nodejs',
    maxDuration: 10
};
export default async function handler(req, res) {
    const startTime = Date.now();
    try {
        // Test database connection
        const { storage } = await import('../server/storage');
        const dbStart = Date.now();
        // Quick database health check
        const dbHealth = await Promise.race([
            storage.getUserCount().then(count => ({ status: 'healthy', count, latency: Date.now() - dbStart })),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
        ]);
        const totalTime = Date.now() - startTime;
        return res.status(200).json({
            status: 'healthy',
            service: 'SSELFIE Studio API',
            timestamp: new Date().toISOString(),
            performance: {
                totalLatency: totalTime,
                databaseLatency: dbHealth.latency,
                databaseStatus: dbHealth.status,
                userCount: dbHealth.count
            },
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            }
        });
    }
    catch (error) {
        const totalTime = Date.now() - startTime;
        return res.status(500).json({
            status: 'unhealthy',
            service: 'SSELFIE Studio API',
            timestamp: new Date().toISOString(),
            error: error.message,
            performance: {
                totalLatency: totalTime
            }
        });
    }
}
