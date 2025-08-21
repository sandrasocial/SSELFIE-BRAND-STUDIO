import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ message: 'Upload failed' });
      }

      const file = files.file as formidable.File;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype || '')) {
        fs.unlinkSync(file.filepath);
        return res.status(400).json({ message: 'Invalid file type' });
      }

      // Generate URL
      const filename = path.basename(file.filepath);
      const url = `/uploads/${filename}`;

      // Store in database
      try {
        // Add your database storage logic here
        // await db.insert({ userId: session.user.id, imageUrl: url });
        
        return res.status(200).json({ 
          url,
          message: 'Upload successful'
        });
      } catch (error) {
        console.error('Database error:', error);
        fs.unlinkSync(file.filepath);
        return res.status(500).json({ message: 'Failed to save upload' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}