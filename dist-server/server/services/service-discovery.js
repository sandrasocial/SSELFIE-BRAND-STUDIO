/**
 * Service Discovery Pattern
 * Dynamic service registration and discovery system
 */
import { Logger } from '../utils/logger';
export class ServiceDiscovery {
    logger;
    services;
    healthCheckInterval;
    constructor() {
        this.logger = new Logger('ServiceDiscovery');
        this.services = {};
        this.healthCheckInterval = null;
    }
    /**
     * Register a service
     */
    registerService(service) {
        this.services[service.name] = {
            ...service,
            lastHealthCheck: new Date().toISOString()
        };
        this.logger.info(`Service registered: ${service.name} v${service.version}`);
    }
    /**
     * Unregister a service
     */
    unregisterService(serviceName) {
        delete this.services[serviceName];
        this.logger.info(`Service unregistered: ${serviceName}`);
    }
    /**
     * Get a service by name
     */
    getService(serviceName) {
        return this.services[serviceName];
    }
    /**
     * Get all services
     */
    getAllServices() {
        return { ...this.services };
    }
    /**
     * Get healthy services only
     */
    getHealthyServices() {
        return Object.fromEntries(Object.entries(this.services).filter(([_, service]) => service.status === 'healthy'));
    }
    /**
     * Find services by metadata
     */
    findServicesByMetadata(key, value) {
        return Object.values(this.services).filter(service => service.metadata[key] === value);
    }
    /**
     * Start health check monitoring
     */
    startHealthCheckMonitoring(intervalMs = 30000) {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(() => {
            this.performHealthChecks();
        }, intervalMs);
        this.logger.info(`Health check monitoring started (${intervalMs}ms interval)`);
    }
    /**
     * Stop health check monitoring
     */
    stopHealthCheckMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            this.logger.info('Health check monitoring stopped');
        }
    }
    /**
     * Perform health checks on all services
     */
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
    /**
     * Check if a service is healthy
     */
    async checkServiceHealth(service) {
        // Simple health check - in production, this would make actual HTTP requests
        // For now, just check if the service has been registered recently
        const lastCheck = new Date(service.lastHealthCheck);
        const now = new Date();
        const timeDiff = now.getTime() - lastCheck.getTime();
        // Consider service healthy if it was checked within the last 5 minutes
        return timeDiff < 5 * 60 * 1000;
    }
    /**
     * Get service statistics
     */
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
// Export singleton instance
export const serviceDiscovery = new ServiceDiscovery();
