/**
 * Service Container - Dependency Injection Foundation
 * 
 * Provides basic dependency injection capabilities for SSELFIE Studio services.
 * Sets foundation for clean architecture and easier testing.
 * 
 * Benefits:
 * - Centralized service management
 * - Easy mocking for tests
 * - Clear dependency relationships
 * - Singleton lifecycle management
 * - Foundation for service refactoring
 */

export interface ServiceContainer {
  register<T>(token: string, factory: () => T, singleton?: boolean): void;
  get<T>(token: string): T;
  has(token: string): boolean;
  clear(): void;
}

interface ServiceRegistration<T> {
  factory: () => T;
  singleton: boolean;
  instance?: T;
}

export class BasicServiceContainer implements ServiceContainer {
  private services = new Map<string, ServiceRegistration<any>>();

  /**
   * Register a service with the container
   */
  register<T>(token: string, factory: () => T, singleton: boolean = true): void {
    this.services.set(token, {
      factory,
      singleton,
      instance: undefined
    });
    console.log(`✅ SERVICE CONTAINER: Registered '${token}' (singleton: ${singleton})`);
  }

  /**
   * Get a service instance from the container
   */
  get<T>(token: string): T {
    const registration = this.services.get(token);
    
    if (!registration) {
      throw new Error(`Service '${token}' not found in container. Available services: ${Array.from(this.services.keys()).join(', ')}`);
    }

    // Return existing instance for singletons
    if (registration.singleton && registration.instance) {
      return registration.instance;
    }

    // Create new instance
    try {
      const instance = registration.factory();
      
      // Store instance if singleton
      if (registration.singleton) {
        registration.instance = instance;
      }
      
      return instance;
    } catch (error) {
      throw new Error(`Failed to create instance of service '${token}': ${(error as Error).message}`);
    }
  }

  /**
   * Check if a service is registered
   */
  has(token: string): boolean {
    return this.services.has(token);
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    console.log('🔄 SERVICE CONTAINER: All services cleared');
  }

  /**
   * Get list of registered services
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get container statistics
   */
  getStats(): { total: number; singletons: number; instances: number } {
    const registrations = Array.from(this.services.values());
    return {
      total: registrations.length,
      singletons: registrations.filter(r => r.singleton).length,
      instances: registrations.filter(r => r.instance !== undefined).length
    };
  }
}

// Global service container instance
export const serviceContainer = new BasicServiceContainer();

// Service tokens (type-safe service identifiers)
export const ServiceTokens = {
  DATABASE: 'database',
  MAYA_SERVICE: 'maya-service',
  IMAGE_STORAGE_SERVICE: 'image-storage-service',
  TRAINING_SERVICE: 'training-service',
  UPLOAD_SERVICE: 'upload-service',
  CLAUDE_SERVICE: 'claude-service'
} as const;

export type ServiceToken = typeof ServiceTokens[keyof typeof ServiceTokens];

// Auto-register core services
import { getDatabase } from './database-provider.js';

// Register database service
serviceContainer.register(ServiceTokens.DATABASE, () => getDatabase(), true);

/**
 * Usage Examples:
 * 
 * // Register a service
 * serviceContainer.register('my-service', () => new MyService(), true);
 * 
 * // Get a service
 * const database = serviceContainer.get<IStorage>(ServiceTokens.DATABASE);
 * 
 * // Service with dependencies
 * serviceContainer.register(ServiceTokens.MAYA_SERVICE, () => {
 *   const db = serviceContainer.get<IStorage>(ServiceTokens.DATABASE);
 *   return new MayaService(db);
 * }, true);
 * 
 * // In tests - mock services
 * serviceContainer.register('database', () => mockDatabase, true);
 * const service = serviceContainer.get('my-service'); // Gets mocked version
 */

/**
 * Helper function for service injection in constructors
 */
export function inject<T>(token: ServiceToken): T {
  return serviceContainer.get<T>(token);
}

/**
 * Decorator for automatic dependency injection (future enhancement)
 */
export function Injectable(token: ServiceToken) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    serviceContainer.register(token, () => new constructor(), true);
    return constructor;
  };
}

// Export types for better TypeScript support
export type { IStorage } from './database-provider.js';