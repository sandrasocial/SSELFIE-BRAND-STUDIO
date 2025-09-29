import { Logger } from '../utils/logger.js';
export class ServiceDiscovery {
    logger;
    services;
    healthCheckInterval;
    constructor() {
        this.logger = new Logger('ServiceDiscovery');
        this.services = {};
        this.healthCheckInterval = null;
    }
    registerService(service) {
        this.services[service.name] = {
            ...service,
            lastHealthCheck: new Date().toISOString()
        };
        this.logger.info(`Service registered: ${service.name} v${service.version}`);
    }
    unregisterService(serviceName) {
        delete this.services[serviceName];
        this.logger.info(`Service unregistered: ${serviceName}`);
    }
    getService(serviceName) {
        return this.services[serviceName];
    }
    getAllServices() {
        return { ...this.services };
    }
    getHealthyServices() {
        return Object.fromEntries(Object.entries(this.services).filter(([_, service]) => service.status === 'healthy'));
    }
    findServicesByMetadata(key, value) {
        return Object.values(this.services).filter(service => service.metadata[key] === value);
    }
    startHealthCheckMonitoring(intervalMs = 30000) {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(() => {
            this.performHealthChecks();
        }, intervalMs);
        this.logger.info(`Health check monitoring started (${intervalMs}ms interval)`);
    }
    stopHealthCheckMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            this.logger.info('Health check monitoring stopped');
        }
    }
    async performHealthChecks() {
        const healthCheckPromises = Object.entries(this.services).map(async ([serviceName, service]) => {
            try {
                const isHealthy = await this.checkServiceHealth(service);
                this.services[serviceName].status = isHealthy ? 'healthy' : 'degraded';
                this.services[serviceName].lastHealthCheck = new Date().toISOString();
            }
            catch (error) {
                this.services[serviceName].status = 'unhealthy';
                this.services[serviceName].lastHealthCheck = new Date().toISOString();
                this.logger.warn(`Health check failed for ${serviceName}:`, error);
            }
        });
        await Promise.all(healthCheckPromises);
    }
    async checkServiceHealth(service) {
        const lastCheck = new Date(service.lastHealthCheck);
        const now = new Date();
        const timeDiff = now.getTime() - lastCheck.getTime();
        return timeDiff < 5 * 60 * 1000;
    }
    getServiceStatistics() {
        const services = Object.values(this.services);
        const healthy = services.filter(s => s.status === 'healthy').length;
        const degraded = services.filter(s => s.status === 'degraded').length;
        const unhealthy = services.filter(s => s.status === 'unhealthy').length;
        return {
            totalServices: services.length,
            healthyServices: healthy,
            degradedServices: degraded,
            unhealthyServices: unhealthy,
            services: services.map(s => ({
                name: s.name,
                status: s.status,
                lastHealthCheck: s.lastHealthCheck
            }))
        };
    }
}
export const serviceDiscovery = new ServiceDiscovery();
//# sourceMappingURL=service-discovery.js.map