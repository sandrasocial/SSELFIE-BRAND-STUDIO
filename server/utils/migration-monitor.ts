import { db } from '../../server/db.js';
import { eq, sql } from 'drizzle-orm';
import { performance } from 'node:perf_hooks';
import crypto from 'crypto';
import {
  schemaMigrationLog,
  queryPerformanceLog,
  migrationVerification,
  schemaSnapshot,
  type InsertSchemaMigrationLog,
  type InsertQueryPerformanceLog,
  type InsertMigrationVerification,
} from '../../shared/schema-migration-monitor.js';

/**
 * Migration monitoring helper class
 */
export class MigrationMonitor {
  private static instance: MigrationMonitor;
  private activeMigration: boolean = false;
  
  private constructor() {}
  
  static getInstance(): MigrationMonitor {
    if (!MigrationMonitor.instance) {
      MigrationMonitor.instance = new MigrationMonitor();
    }
    return MigrationMonitor.instance;
  }

  /**
   * Start monitoring a migration phase
   */
  async startMigration(phase: string, operation: string): Promise<number> {
    try {
      this.activeMigration = true;
      
      const result = await db.insert(schemaMigrationLog).values({
        phase,
        operation,
        status: 'in_progress',
        metadata: {},
      }).returning({ id: schemaMigrationLog.id });

      if (!result[0]) throw new Error('Failed to create migration log');
      return result[0].id;
    } catch (error) {
      console.error('Failed to start migration monitoring:', error);
      throw error;
    }
  }

  /**
   * Update migration progress
   */
  async updateMigration(id: number, status: string, metadata: any = {}) {
    try {
      await db.update(schemaMigrationLog)
        .set({
          status,
          metadata,
          updatedAt: new Date(),
        })
        .where(eq(schemaMigrationLog.id, id));
    } catch (error) {
      console.error('Failed to update migration status:', error);
      throw error;
    }
  }

  /**
   * Track query performance
   */
  async trackQueryPerformance(query: string, context: string, startTime: number) {
    try {
      const duration = performance.now() - startTime;
      const queryHash = crypto.createHash('md5').update(query).digest('hex');

      await db.insert(queryPerformanceLog).values({
        queryHash,
        executionTime: Math.round(duration),
        queryContext: context,
        metadata: { query },
      });

      // Alert on slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected in ${context}:`, {
          duration,
          queryHash,
        });
      }
    } catch (error) {
      console.error('Failed to log query performance:', error);
    }
  }

  /**
   * Verify data consistency between original and new tables
   */
  async verifyMigration(sourceTable: string, targetTable: string, type: string = 'row_count'): Promise<boolean> {
    try {
      // Get row counts
      const source = await db.execute(
        sql`SELECT COUNT(*) as count FROM ${sourceTable}`
      );
      const target = await db.execute(
        sql`SELECT COUNT(*) as count FROM ${targetTable}`
      );

      const sourceCount = parseInt(source.rows[0]?.count as string || '0');
      const targetCount = parseInt(target.rows[0]?.count as string || '0');
      
      // Log verification result
      await db.insert(migrationVerification).values({
        sourceTable,
        targetTable,
        verificationType: type,
        sourceCount,
        targetCount,
        matchingRows: Math.min(sourceCount, targetCount),
        status: sourceCount === targetCount ? 'passed' : 'failed',
        discrepancies: sourceCount !== targetCount ? {
          difference: Math.abs(sourceCount - targetCount),
          message: 'Row count mismatch',
        } : null,
      });

      return sourceCount === targetCount;
    } catch (error) {
      console.error('Migration verification failed:', error);
      
      // Log failure
      await db.insert(migrationVerification).values({
        sourceTable,
        targetTable,
        verificationType: type,
        status: 'failed',
        discrepancies: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      });

      return false;
    }
  }

  /**
   * Create schema snapshot for rollback
   */
  async createSchemaSnapshot(tableName: string): Promise<void> {
    try {
      // Get table schema
      const schema = await db.execute(
        sql`SELECT 
          column_name, 
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = ${tableName}`
      );

      // Get index information
      const indexes = await db.execute(
        sql`SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = ${tableName}`
      );

      // Get foreign key constraints
      const fks = await db.execute(
        sql`SELECT
          conname AS constraint_name,
          confrelid::regclass AS referenced_table,
          af.attname AS foreign_column,
          a.attname AS primary_column
        FROM pg_constraint c
        JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
        JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
        WHERE contype = 'f'
        AND conrelid::regclass::text = ${tableName}`
      );

      // Get row count
      const count = await db.execute(
        sql`SELECT COUNT(*) as count FROM ${tableName}`
      );

      // Save snapshot
      await db.insert(schemaSnapshot).values({
        tableName,
        columnCount: schema.rows.length,
        rowCount: parseInt(count.rows[0]?.count as string || '0'),
        indexCount: indexes.rows.length,
        foreignKeys: fks.rows,
        schema: {
          columns: schema.rows,
          indexes: indexes.rows,
          foreignKeys: fks.rows,
        },
      });
    } catch (error) {
      console.error('Failed to create schema snapshot:', error);
      throw error;
    }
  }

  /**
   * Check if migration has critical errors
   */
  async hasCriticalErrors(): Promise<boolean> {
    if (!this.activeMigration) return false;

    try {
      const errors = await db.select()
        .from(schemaMigrationLog)
        .where(eq(schemaMigrationLog.status, 'failed'))
        .execute();

      return errors.length > 0;
    } catch (error) {
      console.error('Failed to check migration errors:', error);
      return true; // Assume critical on error
    }
  }
}

// Export singleton instance
export const migrationMonitor = MigrationMonitor.getInstance();

/**
 * Higher-order function to wrap queries with performance monitoring
 */
export function withPerformanceTracking<T>(
  queryFn: () => Promise<T>,
  context: string
): Promise<T> {
  const startTime = performance.now();
  
  return queryFn().then(result => {
    migrationMonitor.trackQueryPerformance(
      queryFn.toString(),
      context,
      startTime
    );
    return result;
  });
}

/**
 * Migration safety wrapper
 */
export async function withMigrationSafety<T>(
  phase: string,
  operation: string,
  task: () => Promise<T>
): Promise<T> {
  const migrationId = await migrationMonitor.startMigration(phase, operation);
  
  try {
    const result = await task();
    
    await migrationMonitor.updateMigration(migrationId, 'completed', {
      success: true,
      completedAt: new Date(),
    });
    
    return result;
  } catch (error) {
      await migrationMonitor.updateMigration(migrationId, 'failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      failedAt: new Date(),
    });    throw error;
  }
}