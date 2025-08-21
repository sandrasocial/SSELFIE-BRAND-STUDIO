import { db } from './db';

export async function trackUploadProgress(userId: string, count: number) {
  const status = count >= 10 ? 'completed' : 'in_progress';
  
  await db.query(`
    INSERT INTO user_uploads (user_id, upload_count, upload_status, last_upload)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      upload_count = $2,
      upload_status = $3,
      last_upload = NOW(),
      completed = $4,
      updated_at = NOW()
  `, [userId, count, status, count >= 10]);
}

export async function getUploadProgress(userId: string) {
  const result = await db.query(`
    SELECT upload_count, upload_status, completed
    FROM user_uploads
    WHERE user_id = $1
  `, [userId]);
  
  return result.rows[0] || {
    upload_count: 0,
    upload_status: 'not_started',
    completed: false
  };
}

export async function checkInactiveUploads() {
  const result = await db.query(`
    SELECT u.user_id, u.upload_count, u.last_upload
    FROM user_uploads u
    WHERE u.completed = false 
    AND u.last_upload < NOW() - INTERVAL '30 days'
  `);
  
  return result.rows;
}