import { db, sql } from '../drizzle.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class WorkflowExecutor {
  private backupPath: string = './backups';

  constructor() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  // Database Backup Logic with proper error handling
  async createDatabaseBackup(tables: string[]): Promise<string | null> {
    if (!tables || tables.length === 0) {
      throw new Error('Tables array is required and cannot be empty');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupPath, `backup_${timestamp}.sql`);
    
    try {
      // Using pg_dump for reliable backups
      const tablesStr = tables.join(' -t ');
      await execAsync(`pg_dump -t ${tablesStr} > ${backupFile}`);
      return backupFile;
    } catch (error) {
      console.error('Database backup failed:', error);
      return null;
    }
  }

  // Schema Verification with proper type handling
  async verifySchema(schemaPath: string, tables: string[]): Promise<boolean> {
    try {
      if (!schemaPath || !tables || tables.length === 0) {
        throw new Error('Schema path and tables array are required');
      }

      // Read schema definition
      const schemaContent = await fs.promises.readFile(schemaPath, 'utf-8');
      
      // Get current database schema
      for (const table of tables) {
        const tableInfoQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `;
        
        const tableInfo = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = ${table}
          ORDER BY ordinal_position
        `;
        
        // Verify against schema definition
        if (!this.validateTableSchema(tableInfo, schemaContent, table)) {
          throw new Error(`Schema mismatch for table: ${table}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Schema verification failed:', error);
      return false;
    }
  }

  // Fix Execution with transaction safety
  async executeFixes(operations: string[]): Promise<boolean> {
    if (!operations || operations.length === 0) {
      throw new Error('Operations array is required and cannot be empty');
    }

    try {
      await db.transaction(async (tx) => {
        for (const operation of operations) {
          if (!operation || typeof operation !== 'string') {
            throw new Error('Invalid operation: must be a non-empty string');
          }
          await tx.execute(operation);
        }
      });
      return true;
    } catch (error) {
      // Transaction will automatically rollback on error
      console.error('Fix execution failed:', error);
      return false;
    }
  }

  // Verification Checks with proper null handling
  async verifyFixes(checks: string[]): Promise<boolean> {
    if (!checks || checks.length === 0) {
      return true; // No checks to run
    }

    try {
      for (const check of checks) {
        if (!check || typeof check !== 'string') {
          throw new Error('Invalid check: must be a non-empty string');
        }
        
        const result = await db.execute(check);
        // Check if result indicates an issue (this depends on the specific check)
        if (result && Array.isArray(result) && result.length > 0) {
          console.warn(`Verification check failed: ${check}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Fix verification failed:', error);
      return false;
    }
  }

  // Rollback Support with better error handling
  async rollback(backupFile: string): Promise<boolean> {
    if (!backupFile) {
      throw new Error('Backup file path is required');
    }

    try {
      if (!fs.existsSync(backupFile)) {
        throw new Error(`Backup file does not exist: ${backupFile}`);
      }
      
      await execAsync(`psql < ${backupFile}`);
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  private validateTableSchema(tableInfo: any, schemaContent: string, tableName: string): boolean {
    // Implementation of schema validation logic
    const tableDefinition = this.extractTableDefinition(schemaContent, tableName);
    return this.compareSchemas(tableInfo, tableDefinition);
  }

  private extractTableDefinition(schemaContent: string, tableName: string): any {
    // Extract table definition from schema file
    // This is a simplified version - implement full parser as needed
    const tableRegex = new RegExp(`create table ${tableName}[^;]+;`, 'i');
    const match = schemaContent.match(tableRegex);
    return match ? match[0] : null;
  }

  private compareSchemas(actual: any, expected: any): boolean {
    // Compare actual database schema with expected schema
    // For now, just check if we have both schemas
    if (!actual || !expected) {
      return false;
    }
    // Implement detailed comparison logic as needed
    return true;
  }
}