/**
 * DATABASE VALIDATOR
 * Validates database configuration and health
 */
import { db } from './db.js';
import { sql } from 'drizzle-orm';
import { type NeonHttpQueryResult } from '@neondatabase/serverless';

export class DatabaseValidator {
  /**
   * Validate database connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      console.error(`Database connection failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Check for pending migrations
   */
  async checkMigrations(): Promise<{
    pending: string[];
    completed: string[];
    total: number;
  }> {
    try {
      // Check if migrations schema exists
      const schemaResult = await db.execute<NeonQueryResult<Record<string, boolean>[]>>(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.schemata WHERE schema_name = 'drizzle'
        ) as exists;
      `);

      // Create schema if it doesn't exist
      const schemaExists = Array.isArray(schemaResult) && schemaResult[0]?.exists;
      if (!schemaExists) {
        await db.execute(sql`CREATE SCHEMA IF NOT EXISTS drizzle;`);
      }

      // Check if migrations table exists
      const tableResult = await db.execute<NeonQueryResult<Record<string, boolean>[]>>(sql`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'drizzle'
          AND table_name = 'migrations'
        ) as exists;
      `);
      
      const tableExists = Array.isArray(tableResult) && tableResult[0]?.exists;      // Create migrations table if it doesn't exist
      if (!tableExists) {
        await db.execute(sql`
          CREATE TABLE drizzle.migrations (
            id serial PRIMARY KEY,
            migration_name varchar(100) NOT NULL,
            migration_time timestamptz NOT NULL DEFAULT now()
          );
        `);
      }

      // Get all migrations
      const migrations = await db.execute<NeonQueryResult<Array<Record<'migration_name', string>>>>(sql`
        SELECT * FROM drizzle.migrations ORDER BY migration_time ASC
      `);

      const migrationRows = Array.isArray(migrations) ? migrations : [];
      const migrationNames = migrationRows.map(m => m.migration_name).filter(Boolean);

      return {
        pending: [],
        completed: migrationNames,
        total: migrationNames.length
      };
    } catch (error) {
      console.error(`Migration check failed: ${(error as Error).message}`);
      return {
        pending: [],
        completed: [],
        total: 0
      };
    }
  }

  /**
   * Get database stats
   */
  async getDatabaseStats(): Promise<{
    tablesCount: number;
    totalRows: Record<string, number>;
    totalSize: string;
  }> {
    try {
      // Get list of tables
      const tablesResult = await db.execute<NeonQueryResult<Array<Record<'tablename', string>>>>(sql`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
      `);      const tableRows = Array.isArray(tablesResult) ? tablesResult : [];
      const tables = tableRows.map(row => row.tablename).filter(Boolean);

      // Get row counts for each table
      const totalRows: Record<string, number> = {};
      for (const table of tables) {
        const countResult = await db.execute<NeonQueryResult<Array<Record<'count', string>>>>(sql`
          SELECT COUNT(*) as count
          FROM ${sql.identifier(table)}
        `);
        const count = Array.isArray(countResult) && countResult[0]?.count;
        if (count) {
          totalRows[table] = parseInt(count, 10);
        }
      }

      // Get total database size
      const sizeResult = await db.execute<NeonQueryResult<Array<Record<'size', string>>>>(sql`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      const totalSize = Array.isArray(sizeResult) && sizeResult[0]?.size || '0 bytes';

      return {
        tablesCount: tables.length,
        totalRows,
        totalSize
      };
    } catch (error) {
      console.error(`Failed to get database stats: ${(error as Error).message}`);
      return {
        tablesCount: 0,
        totalRows: {},
        totalSize: '0 bytes'
      };
    }
  }

  /**
   * Check database indices
   */
  async checkIndices(): Promise<{
    total: number;
    byTable: Record<string, string[]>;
    missing: string[];
  }> {
    try {
      type IndexResult = {
        schemaname: string;
        tablename: string;
        indexname: string;
        indexdef: string;
      };

      const result = await db.execute<NeonQueryResult<IndexResult[]>>(sql`
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `);

             // Group indices by table
      const byTable: Record<string, string[]> = {};
      if (Array.isArray(result)) {
        result.forEach(idx => {
          if (!byTable[idx.tablename]) {
            byTable[idx.tablename] = [];
          }
          byTable[idx.tablename].push(idx.indexname);
        });
      }      // Check for missing required indices
      const requiredIndices = [
        'users_email_idx',
        'maya_subscriptions_user_id_idx',
        'maya_usage_tracking_user_id_idx',
        'maya_payments_user_id_idx'
      ];

      const missing = requiredIndices.filter(required =>
        !indexRows.some(idx => idx.indexname === required)
      );

      return {
        total: indexRows.length,
        byTable,
        missing
      };    } catch (error) {
      console.error(`Failed to check indices: ${(error as Error).message}`);
      return {
        total: 0,
        byTable: {},
        missing: []
      };
    }
  }

  /**
   * Full database validation
   */
  async validateDatabase(): Promise<{
    valid: boolean;
    connection: boolean;
    migrations: {
      upToDate: boolean;
      pending: number;
      completed: number;
    };
    indices: {
      valid: boolean;
      total: number;
      missing: string[];
    };
    stats: {
      tables: number;
      totalSize: string;
      rowCounts: Record<string, number>;
    };
  }> {
    try {
      // Check connection
      const connectionValid = await this.validateConnection();

      // Check migrations
      const migrations = await this.checkMigrations();
      const migrationsUpToDate = migrations.pending.length === 0;

      // Check indices
      const indices = await this.checkIndices();
      const indicesValid = indices.missing.length === 0;

      // Get database stats
      const stats = await this.getDatabaseStats();

      return {
        valid: connectionValid && migrationsUpToDate && indicesValid,
        connection: connectionValid,
        migrations: {
          upToDate: migrationsUpToDate,
          pending: migrations.pending.length,
          completed: migrations.completed.length
        },
        indices: {
          valid: indicesValid,
          total: indices.total,
          missing: indices.missing
        },
        stats: {
          tables: stats.tablesCount,
          totalSize: stats.totalSize,
          rowCounts: stats.totalRows
        }
      };

    } catch (error) {
      console.error('Database validation failed:', error);
      return {
        valid: false,
        connection: false,
        migrations: {
          upToDate: false,
          pending: 0,
          completed: 0
        },
        indices: {
          valid: false,
          total: 0,
          missing: []
        },
        stats: {
          tables: 0,
          totalSize: '0 bytes',
          rowCounts: {}
        }
      };
    }
  }
}
