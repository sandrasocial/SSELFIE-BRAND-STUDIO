import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = createClient();
    
    // Process upload
    const files = await processUpload(req);
    
    // Save to database
    await Promise.all(
      files.map(file => 
        db.query(
          `INSERT INTO selfie_uploads (
            user_id, 
            filename,
            original_url,
            processing_status,
            validation_status,
            upload_progress
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            req.user.id,
            file.name,
            file.url,
            'pending',
            'pending',
            JSON.stringify({ step: 'uploaded', progress: 0 })
          ]
        )
      )
    );

    res.status(200).json({ 
      message: 'Upload successful',
      files: files.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}