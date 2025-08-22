import { NextApiRequest, NextApiResponse } from 'next';
import { styleTransferRateLimit } from '../../../../middleware/rateLimiter';
import { validateStorageLimit } from '../../../../utils/storage';
import { authenticateUser } from '../../../../middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authenticate user
    const user = await authenticateUser(req, res);
    if (!user) return;

    // Apply rate limiting
    await styleTransferRateLimit(req, res, () => {});

    switch (req.method) {
      case 'POST':
        // Validate storage limits
        const hasStorage = await validateStorageLimit(user.id);
        if (!hasStorage) {
          return res.status(403).json({ error: 'Storage limit exceeded' });
        }

        // Create style transfer job
        const jobId = await createStyleTransferJob(req.body, user.id);
        
        return res.status(201).json({
          jobId,
          status: 'processing',
          message: 'Style transfer job created successfully'
        });

      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Style transfer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}