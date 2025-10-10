/**
 * Database Provider Singleton
 * 
 * Centralizes database access to avoid multiple storage.js imports.
 * Replaces the pattern of importing storage.js 20+ times across services.
 * 
 * Benefits:
 * - Single database connection instance
 * - Improved performance (no multiple imports)
 * - Consistent error handling
 * - Easier to test and mock
 * - Foundation for dependency injection
 */

import { DatabaseStorage, type IStorage } from '../server/storage.js';

export class DatabaseProvider {
  private static instance: IStorage | null = null;
  private static isInitialized = false;

  /**
   * Get the singleton database instance
   */
  static getInstance(): IStorage {
    if (!this.instance) {
      this.instance = new DatabaseStorage();
      this.isInitialized = true;
      console.log('✅ DATABASE PROVIDER: Singleton instance created');
    }
    return this.instance;
  }

  /**
   * Reset the singleton (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    this.isInitialized = false;
    console.log('🔄 DATABASE PROVIDER: Singleton reset');
  }

  /**
   * Check if the provider is initialized
   */
  static get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get database instance with error handling
   */
  static async getSafeInstance(): Promise<IStorage> {
    try {
      return this.getInstance();
    } catch (error) {
      console.error('❌ DATABASE PROVIDER: Failed to get instance:', error);
      throw new Error('Database provider initialization failed');
    }
  }
}

// Export convenience methods for common usage patterns
export const getDatabase = () => DatabaseProvider.getInstance();
export const getSafeDatabase = () => DatabaseProvider.getSafeInstance();

// Type exports for better TypeScript support
export type { IStorage } from '../server/storage.js';

/**
 * Usage Examples:
 * 
 * // Basic usage (replaces import { storage } from './storage.js')
 * import { getDatabase } from '../shared/database-provider.js';
 * const db = getDatabase();
 * 
 * // Safe usage with error handling
 * import { getSafeDatabase } from '../shared/database-provider.js';
 * const db = await getSafeDatabase();
 * 
 * // Service injection pattern
 * import { DatabaseProvider } from '../shared/database-provider.js';
 * const db = DatabaseProvider.getInstance();
 */