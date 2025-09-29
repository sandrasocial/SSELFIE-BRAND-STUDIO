import { db } from '../drizzle.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export class WorkflowExecutor {
    backupPath = './backups';
    constructor() {
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath, { recursive: true });
        }
    }
    async createDatabaseBackup(tables) {
        if (!tables || tables.length === 0) {
            throw new Error('Tables array is required and cannot be empty');
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupPath, `backup_${timestamp}.sql`);
        try {
            const tablesStr = tables.join(' -t ');
            await execAsync(`pg_dump -t ${tablesStr} > ${backupFile}`);
            return backupFile;
        }
        catch (error) {
            console.error('Database backup failed:', error);
            return null;
        }
    }
    async verifySchema(schemaPath, tables) {
        try {
            if (!schemaPath || !tables || tables.length === 0) {
                throw new Error('Schema path and tables array are required');
            }
            const schemaContent = await fs.promises.readFile(schemaPath, 'utf-8');
            for (const table of tables) {
                const tableInfoQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `;
                const tableInfo = await db.execute(tableInfoQuery, [table]);
                if (!this.validateTableSchema(tableInfo, schemaContent, table)) {
                    throw new Error(`Schema mismatch for table: ${table}`);
                }
            }
            return true;
        }
        catch (error) {
            console.error('Schema verification failed:', error);
            return false;
        }
    }
    async executeFixes(operations) {
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
        }
        catch (error) {
            console.error('Fix execution failed:', error);
            return false;
        }
    }
    async verifyFixes(checks) {
        if (!checks || checks.length === 0) {
            return true;
        }
        try {
            for (const check of checks) {
                if (!check || typeof check !== 'string') {
                    throw new Error('Invalid check: must be a non-empty string');
                }
                const result = await db.execute(check);
                if (result && Array.isArray(result) && result.length > 0) {
                    console.warn(`Verification check failed: ${check}`);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            console.error('Fix verification failed:', error);
            return false;
        }
    }
    async rollback(backupFile) {
        if (!backupFile) {
            throw new Error('Backup file path is required');
        }
        try {
            if (!fs.existsSync(backupFile)) {
                throw new Error(`Backup file does not exist: ${backupFile}`);
            }
            await execAsync(`psql < ${backupFile}`);
            return true;
        }
        catch (error) {
            console.error('Rollback failed:', error);
            return false;
        }
    }
    validateTableSchema(tableInfo, schemaContent, tableName) {
        const tableDefinition = this.extractTableDefinition(schemaContent, tableName);
        return this.compareSchemas(tableInfo, tableDefinition);
    }
    extractTableDefinition(schemaContent, tableName) {
        const tableRegex = new RegExp(`create table ${tableName}[^;]+;`, 'i');
        const match = schemaContent.match(tableRegex);
        return match ? match[0] : null;
    }
    compareSchemas(actual, expected) {
        if (!actual || !expected) {
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=workflow-executor.js.map