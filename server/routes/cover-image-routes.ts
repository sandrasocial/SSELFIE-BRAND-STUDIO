// server/routes/cover-image-routes.ts - API for saving approved cover images
import { Express } from 'express';
import { storage } from '../storage';
import AWS from 'aws-sdk';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

export function registerCoverImageRoutes(app: Express) {
  // Save approved cover image to permanent storage
  app.post('/api/save-cover-image', async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    try {
      const { promptId, tempImageUrl, collectionId } = req.body;

      // Download temporary image
      const imageResponse = await fetch(tempImageUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Upload to S3 with permanent path
      const s3Key = `collection-covers/${collectionId}/prompt-${promptId}-${Date.now()}.jpg`;
      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      }).promise();

      // Save to database
      await storage.saveCoverImage({
        promptId,
        collectionId,
        imageUrl: uploadResult.Location,
        createdBy: req.user.id,
        createdAt: new Date()
      });

      res.json({
        success: true,
        permanentUrl: uploadResult.Location,
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
      const coverImages = await storage.getCoverImages(collectionId);
      res.json({ success: true, covers: coverImages });
    } catch (error) {
      console.error('Get cover images error:', error);
      res.status(500).json({ error: 'Failed to get cover images' });
    }
  });
}