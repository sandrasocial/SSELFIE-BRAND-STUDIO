import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from './auth';

export const subscriptionFeatures = {
  creator: {
    maxUploads: 100,
    maxModels: 1,
    features: ['basic_editing', 'style_generation', 'basic_analytics']
  },
  entrepreneur: {
    maxUploads: 500,
    maxModels: 3,
    features: ['advanced_editing', 'style_generation', 'advanced_analytics', 'white_label']
  }
};

export const checkSubscriptionAccess = (feature: string) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tierFeatures = subscriptionFeatures[user.subscription_tier as keyof typeof subscriptionFeatures];
    if (!tierFeatures.features.includes(feature)) {
      return res.status(403).json({ 
        error: 'Feature not available in your subscription tier',
        upgrade_needed: true
      });
    }

    next();
  };
};