export const config = {
    runtime: 'nodejs',
    maxDuration: 10
};
export default async function handler(req, res) {
    const startTime = Date.now();
    try {
        const { storage } = await import('../server/storage.js');
        const dbStart = Date.now();
        const dbHealth = await Promise.race([
            storage.getUserCount().then(count => ({
                status: 'healthy',
                count,
                latency: Date.now() - dbStart
            })),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
        ]);
        const totalTime = Date.now() - startTime;
        const response = {
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
        };
        return res.status(200).json(response);
    }
    catch (error) {
        const totalTime = Date.now() - startTime;
        const response = {
            status: 'unhealthy',
            service: 'SSELFIE Studio API',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
            performance: {
                totalLatency: totalTime
            }
        };
        return res.status(500).json(response);
    }
}
//# sourceMappingURL=health-detailed.js.map