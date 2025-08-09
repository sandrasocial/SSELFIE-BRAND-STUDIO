import { exec } from 'child_process';
import { upload } from '../utils/s3';
import { format } from 'date-fns';

const performBackup = async () => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm');
  const filename = `backup-${timestamp}.sql`;
  
  try {
    // Create database dump
    await new Promise((resolve, reject) => {
      exec(
        `pg_dump ${process.env.DATABASE_URL} > ${filename}`,
        (error, stdout, stderr) => {
          if (error) reject(error);
          resolve(stdout);
        }
      );
    });

    // Upload to S3
    await upload({
      Bucket: process.env.BACKUP_BUCKET_NAME,
      Key: `database-backups/${filename}`,
      Body: filename,
    });

    console.log(`Backup completed successfully: ${filename}`);
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
};

// If running directly
if (require.main === module) {
  performBackup()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default performBackup;