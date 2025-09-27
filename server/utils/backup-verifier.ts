import { db } from '../../server/db.js';
import { sql } from 'drizzle-orm';
import { migrationMonitor } from './migration-monitor.js';

/**
 * Interface for table verification results
 */
interface VerificationDetails {
  rowCount: number;
  foreignKeyCount: number;
  indexCount: number;
  constraintCount: number;
  issues: string[] | null;
}

interface TableVerificationResult {
  status: 'passed' | 'failed';
  details: VerificationDetails;
}

/**
 * Utility class for backup verification procedures
 */
export class BackupVerifier {
  private static instance: BackupVerifier;
  
  private constructor() {}
  
  static getInstance(): BackupVerifier {
    if (!BackupVerifier.instance) {
      BackupVerifier.instance = new BackupVerifier();
    }
    return BackupVerifier.instance;
  }

  /**
   * Verify table integrity including row count, foreign keys, and indexes
   */
  async verifyTableIntegrity(tableName: string): Promise<TableVerificationResult> {
    const issues: string[] = [];
    const details: VerificationDetails = {
      rowCount: 0,
      foreignKeyCount: 0,
      indexCount: 0,
      constraintCount: 0,
      issues: null
    };

    try {
      // Check row count
      const countResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM ${tableName}`
      );
      details.rowCount = parseInt(countResult.rows[0]?.count as string || '0');

      // Check foreign key constraints
      const fkResult = await db.execute(
        sql`SELECT COUNT(*) as count
        FROM information_schema.table_constraints
        WHERE table_name = ${tableName}
        AND constraint_type = 'FOREIGN KEY'`
      );
      details.foreignKeyCount = parseInt(fkResult.rows[0]?.count as string || '0');

      // Verify foreign key integrity
      const fkIntegrityResult = await db.execute(
        sql`SELECT tc.constraint_name, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = ${tableName}
        AND tc.constraint_type = 'FOREIGN KEY'`
      );

      for (const fk of fkIntegrityResult.rows) {
        const fkCheck = await db.execute(
          sql`SELECT COUNT(*) as invalid_count
          FROM ${tableName} t1
          LEFT JOIN (
            SELECT DISTINCT ${fk.column_name} 
            FROM ${fk.referenced_table}
          ) t2 ON t1.${fk.column_name} = t2.${fk.column_name}
          WHERE t2.${fk.column_name} IS NULL`
        );

        const invalidCount = parseInt(fkCheck.rows[0]?.invalid_count as string || '0');
        if (invalidCount > 0) {
          issues.push(`Foreign key violation found in column ${fk.column_name}: ${invalidCount} invalid references`);
        }
      }

      // Check indexes
      const indexResult = await db.execute(
        sql`SELECT COUNT(*) as count 
        FROM pg_indexes 
        WHERE tablename = ${tableName}`
      );
      details.indexCount = parseInt(indexResult.rows[0]?.count as string || '0');

      // Verify primary key
      const pkResult = await db.execute(
        sql`SELECT COUNT(*) as count 
        FROM information_schema.table_constraints 
        WHERE table_name = ${tableName} 
        AND constraint_type = 'PRIMARY KEY'`
      );
      
      if (parseInt(pkResult.rows[0]?.count as string || '0') === 0) {
        issues.push('Table is missing a primary key');
      }

      // Check for constraint violations
      const constraintResult = await db.execute(
        sql`SELECT COUNT(*) as count 
        FROM information_schema.table_constraints 
        WHERE table_name = ${tableName}`
      );
      details.constraintCount = parseInt(constraintResult.rows[0]?.count as string || '0');

      // Log verification attempt
      await migrationMonitor.verifyMigration(
        tableName,
        tableName,
        'integrity_check'
      );

      details.issues = issues.length > 0 ? issues : null;
      
      return {
        status: issues.length > 0 ? 'failed' : 'passed',
        details
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      issues.push(`Verification failed: ${errorMsg}`);
      details.issues = issues;
      
      return {
        status: 'failed',
        details
      };
    }
  }

  /**
   * Verify index usage and health
   */
  async verifyIndexHealth(tableName: string): Promise<boolean> {
    try {
      type IndexStats = Record<string, string> & {
        schemaname: string;
        tablename: string;
        indexname: string;
        idx_scan: string;
        idx_tup_read: string;
        idx_tup_fetch: string;
      };

      // Check index bloat and usage
      const indexStats = await db.execute<IndexStats>(
        sql`SELECT 
          schemaname::text, 
          tablename::text, 
          indexname::text, 
          idx_scan::text, 
          idx_tup_read::text, 
          idx_tup_fetch::text
        FROM pg_stat_user_indexes 
        WHERE tablename = ${tableName}`
      );

      let hasIssues = false;
      for (const stat of indexStats.rows) {
        // Check if index is unused
        if (parseInt(stat.idx_scan || '0') === 0) {
          console.warn(`Unused index found: ${stat.indexname} on ${tableName}`);
          hasIssues = true;
        }

        // Check index selectivity
        const tupRead = parseInt(stat.idx_tup_read || '0');
        if (tupRead > 0) {
          const tupFetch = parseInt(stat.idx_tup_fetch || '0');
          const selectivity = tupFetch / tupRead;
          if (selectivity < 0.01) {
            console.warn(`Low selectivity index found: ${stat.indexname} on ${tableName} (${selectivity})`);
            hasIssues = true;
          }
        }
      }

      return !hasIssues;
    } catch (error) {
      console.error('Failed to verify index health:', error);
      return false;
    }
  }

  /**
   * Create a backup verification snapshot
   */
  async createVerificationSnapshot(tableName: string): Promise<void> {
    try {
      const result = await this.verifyTableIntegrity(tableName);
      
      await migrationMonitor.createSchemaSnapshot(tableName);

      if (result.status === 'failed') {
        throw new Error(`Table integrity verification failed: ${result.details.issues?.join(', ')}`);
      }

      // Additional verification steps can be added here
      const indexHealth = await this.verifyIndexHealth(tableName);
      if (!indexHealth) {
        console.warn(`Index health issues detected for ${tableName}`);
      }

    } catch (error) {
      throw new Error(`Failed to create verification snapshot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const backupVerifier = BackupVerifier.getInstance();