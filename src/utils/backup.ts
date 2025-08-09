import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class DatabaseBackup {
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, filename);

    try {
      await execAsync(
        `pg_dump \${process.env.DATABASE_URL} > ${filePath}`
      );
      return filePath;
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async restoreBackup(backupPath: string): Promise<void> {
    try {
      await execAsync(
        `psql \${process.env.DATABASE_URL} < ${backupPath}`
      );
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }
}