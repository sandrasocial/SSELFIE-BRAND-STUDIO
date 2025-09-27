import { sql } from 'drizzle-orm';
import { db } from '../../server/db.js';
import { migrationMonitor } from './migration-monitor.js';
import { backupVerifier } from './backup-verifier.js';

/**
 * Configuration for batch operations
 */
interface BatchConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

/**
 * Default batch configuration
 */
const DEFAULT_BATCH_CONFIG: BatchConfig = {
  batchSize: 1000,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};

/**
 * Helper class for batch migration operations
 */
export class MigrationHelper {
  private static instance: MigrationHelper;
  private batchConfig: BatchConfig;
  
  private constructor(config: Partial<BatchConfig> = {}) {
    this.batchConfig = {
      ...DEFAULT_BATCH_CONFIG,
      ...config
    };
  }
  
  static getInstance(config?: Partial<BatchConfig>): MigrationHelper {
    if (!MigrationHelper.instance) {
      MigrationHelper.instance = new MigrationHelper(config);
    }
    return MigrationHelper.instance;
  }

  /**
   * Configure batch processing parameters
   */
  configure(config: Partial<BatchConfig>): void {
    this.batchConfig = {
      ...this.batchConfig,
      ...config
    };
  }

  /**
   * Process data migration in batches with retries
   */
  async batchProcess<T extends Record<string, unknown>>(
    sourceTable: string,
    targetTable: string,
    transformFn?: (data: T) => Partial<T>
  ): Promise<void> {
    const { batchSize, maxRetries, retryDelay } = this.batchConfig;
    let offset = 0;
    let hasMore = true;
    
    // Start migration monitoring
    const migrationId = await migrationMonitor.startMigration(
      'data_migration',
      `${sourceTable}_to_${targetTable}`
    );

    try {
      while (hasMore) {
        // Get next batch
        const batch = await this.fetchBatch<T>(sourceTable, offset, batchSize);
        
        if (batch.length === 0) {
          hasMore = false;
          continue;
        }

        // Process batch with retries
        let success = false;
        let attempts = 0;
        
        while (!success && attempts < maxRetries) {
          try {
            const transformedBatch = transformFn 
              ? batch.map(transformFn)
              : batch;

            await this.insertBatch(targetTable, transformedBatch);
            success = true;

          } catch (error) {
            attempts++;
            
            if (attempts >= maxRetries) {
              throw error;
            }

            console.warn(`Batch insert failed, attempt ${attempts}/${maxRetries}:`, error);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }

        offset += batch.length;

        // Update progress
        await migrationMonitor.updateMigration(migrationId, 'in_progress', {
          processedRows: offset,
          currentBatch: offset / batchSize,
        });
      }

      // Verify migration
      const verification = await backupVerifier.verifyTableIntegrity(targetTable);
      
      if (verification.status === 'failed') {
        throw new Error(`Migration verification failed: ${verification.details.issues?.join(', ')}`);
      }

      await migrationMonitor.updateMigration(migrationId, 'completed', {
        totalRows: offset,
        verificationStatus: verification.status,
      });

    } catch (error) {
      await migrationMonitor.updateMigration(migrationId, 'failed', {
        error: error instanceof Error ? error.message : String(error),
        failedAt: offset,
      });
      throw error;
    }
  }

  /**
   * Fetch a batch of records
   */
  private async fetchBatch<T extends Record<string, unknown>>(
    table: string,
    offset: number,
    limit: number
  ): Promise<T[]> {
    const result = await db.execute(
      sql`SELECT * FROM ${table} ORDER BY id LIMIT ${limit} OFFSET ${offset}`
    );
    return result.rows as T[];
  }

  /**
   * Insert a batch of records
   */
  private async insertBatch<T extends Record<string, unknown>>(
    table: string,
    records: Partial<T>[]
  ): Promise<void> {
    if (records.length === 0) return;

    const record = records[0];
    if (!record) return;

    // Get column names from first record
    const columns = Object.keys(record);
    
    // Build values array
    const values = records.map(record => 
      columns.map(col => sql`${record[col] ?? null}`)
    );

    // Build and execute insert query
    await db.execute(
      sql`INSERT INTO ${table} (${sql.join(columns, ',')})
          VALUES ${sql.join(
            values.map(row => 
              sql`(${sql.join(row, ',')})`
            ),
            ','
          )}`
    );
  }

  /**
   * Rollback a migration
   */
  async rollback(targetTable: string, snapshot: string): Promise<void> {
    const migrationId = await migrationMonitor.startMigration(
      'rollback',
      `rollback_${targetTable}`
    );

    try {
      // Verify snapshot exists
      const snapshotExists = await db.execute(
        sql`SELECT EXISTS(
          SELECT 1 FROM schema_snapshot 
          WHERE table_name = ${targetTable} 
          AND id = ${snapshot}
        )`
      );

      if (!snapshotExists.rows[0]?.exists) {
        throw new Error(`Snapshot ${snapshot} not found for table ${targetTable}`);
      }

      // Drop current table
      await db.execute(sql`DROP TABLE IF EXISTS ${targetTable}`);

      // Get snapshot schema
      const snapshotSchema = await db.execute(
        sql`SELECT schema FROM schema_snapshot WHERE id = ${snapshot}`
      );

      const schema = snapshotSchema.rows[0]?.schema;
      if (!schema) {
        throw new Error('Invalid snapshot schema');
      }

      // Recreate table from snapshot
      await this.recreateTableFromSnapshot(targetTable, schema);

      await migrationMonitor.updateMigration(migrationId, 'completed', {
        snapshotId: snapshot,
      });

    } catch (error) {
      await migrationMonitor.updateMigration(migrationId, 'failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Recreate table from snapshot
   */
  private async recreateTableFromSnapshot(
    tableName: string, 
    schema: any
  ): Promise<void> {
    // Create table with columns
    const createTable = sql`CREATE TABLE ${tableName} (${
      sql.join(
        schema.columns.map((col: any) => 
          sql`${col.column_name} ${col.data_type}${
            col.is_nullable === 'NO' ? sql` NOT NULL` : sql``
          }${
            col.column_default ? sql` DEFAULT ${col.column_default}` : sql``
          }`
        ),
        ','
      )
    })`;

    await db.execute(createTable);

    // Create indexes
    for (const idx of schema.indexes) {
      await db.execute(sql`${idx.indexdef}`);
    }

    // Create foreign keys
    for (const fk of schema.foreignKeys) {
      await db.execute(sql`
        ALTER TABLE ${tableName} 
        ADD CONSTRAINT ${fk.constraint_name} 
        FOREIGN KEY (${fk.foreign_column}) 
        REFERENCES ${fk.referenced_table}(${fk.primary_column})
      `);
    }
  }
}

// Export singleton instance
export const migrationHelper = MigrationHelper.getInstance();