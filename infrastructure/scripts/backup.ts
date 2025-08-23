import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import { logger } from '../server/config/monitoring';

const execAsync = promisify(exec);

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const RETENTION_DAYS = 7;

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${BACKUP_DIR}/backup-${timestamp}.sql`;

  try {
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Create database backup
    await execAsync(
      `PGPASSWORD="${process.env.DB_PASSWORD}" pg_dump -U ${DB_USER} -d ${DB_NAME} -F c -b -v -f "${backupPath}"`
    );

    logger.info(`Backup created successfully at ${backupPath}`);

    // Clean up old backups
    const files = fs.readdirSync(BACKUP_DIR);
    const now = new Date();

    files.forEach(file => {
      const filePath = `${BACKUP_DIR}/${file}`;
      const stats = fs.statSync(filePath);
      const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysOld > RETENTION_DAYS) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted old backup: ${filePath}`);
      }
    });

  } catch (error) {
    logger.error('Backup failed:', error);
    throw new Error(`Backup failed: ${error.message}`);
  }
}

// Verify backup can be restored
async function verifyBackup(backupPath: string) {
  try {
    const testDbName = `${DB_NAME}_verify_${Date.now()}`;
    
    // Create test database
    await execAsync(`createdb -U ${DB_USER} ${testDbName}`);
    
    // Restore backup to test database
    await execAsync(
      `PGPASSWORD="${process.env.DB_PASSWORD}" pg_restore -U ${DB_USER} -d ${testDbName} -v "${backupPath}"`
    );
    
    // Clean up test database
    await execAsync(`dropdb -U ${DB_USER} ${testDbName}`);
    
    logger.info(`Backup verified successfully: ${backupPath}`);
    return true;
  } catch (error) {
    logger.error('Backup verification failed:', error);
    return false;
  }
}

// Export for use in cron jobs
export { createBackup, verifyBackup };