// server/routes/cover-image-routes.ts - API for saving approved cover images
import { Express } from 'express';
import { storage } from '../storage';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { checkAdminAccess } from '../middleware/admin-middleware';

// Configure AWS S3
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: 'us-east-1'
});

export function registerCoverImageRoutes(app: Express) {
  // Save approved cover image to permanent storage
  app.post('/api/save-cover-image', async (req, res) => {
    if (!checkAdminAccess(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    try {
      const { promptId, tempImageUrl, collectionId } = req.body;

      // Download temporary image
      const imageResponse = await fetch(tempImageUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Upload to S3 with permanent path
      const s3Key = `collection-covers/${collectionId}/prompt-${promptId}-${Date.now()}.jpg`;
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: s3Key,
          Body: imageBuffer,
          ContentType: 'image/jpeg'
          // Note: Bucket must be configured with public read access at bucket level
        }
      });
      const uploadResult = await upload.done();

      // Generate permanent URL
      const permanentUrl = `https://${process.env.AWS_S3_BUCKET}.s3.us-east-1.amazonaws.com/${s3Key}`;

      // Save to database (if storage method exists)
      if ('saveCoverImage' in storage && typeof storage.saveCoverImage === 'function') {
        await (storage as any).saveCoverImage({
          promptId,
          collectionId,
          imageUrl: permanentUrl,
          createdBy: req.user?.claims?.sub,
          createdAt: new Date()
        });
      }

      res.json({
        success: true,
        permanentUrl,
        s3Key
      });

    } catch (error) {
      console.error('Save cover image error:', error);
      res.status(500).json({ error: 'Failed to save cover image' });
    }
  });

  // Get cover images for collection
  app.get('/api/collection-covers/:collectionId', async (req, res) => {
    try {
      const { collectionId } = req.params;
      const coverImages = ('getCoverImages' in storage && typeof storage.getCoverImages === 'function') 
        ? await (storage as any).getCoverImages(collectionId) 
        : [];
      res.json({ success: true, covers: coverImages });
    } catch (error) {
      console.error('Get cover images error:', error);
      res.status(500).json({ error: 'Failed to get cover images' });
    }
  });
}