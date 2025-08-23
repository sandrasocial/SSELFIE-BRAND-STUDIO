const Redis = require('redis');
const { promisify } = require('util');

// Redis client setup
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL
});

const TIER_LIMITS = {
  'creator': {
    requestsPerMinute: 60,
    chatAccess: ['basic'],
    maxTokens: 1000
  },
  'entrepreneur': {
    requestsPerMinute: 120,
    chatAccess: ['basic', 'advanced', 'expert'],
    maxTokens: 2000
  }
};

// Subscription validation middleware
const validateSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userTier = await getUserSubscriptionTier(userId);
    
    if (!userTier) {
      return res.status(403).json({ error: 'Invalid subscription' });
    }
    
    req.userTier = userTier;
    req.tierLimits = TIER_LIMITS[userTier];
    next();
  } catch (error) {
    console.error('Subscription validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Rate limiting middleware using Redis
const rateLimiter = async (req, res, next) => {
  const userId = req.user.id;
  const key = `rate_limit:${userId}`;
  
  try {
    const requests = await redisClient.incr(key);
    
    if (requests === 1) {
      await redisClient.expire(key, 60); // Reset after 1 minute
    }
    
    const tierLimit = TIER_LIMITS[req.userTier].requestsPerMinute;
    
    if (requests > tierLimit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        resetIn: await redisClient.ttl(key)
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Chat access control middleware
const chatAccessControl = async (req, res, next) => {
  const requestedChatType = req.body.chatType || 'basic';
  
  if (!req.tierLimits.chatAccess.includes(requestedChatType)) {
    return res.status(403).json({
      error: 'Chat access denied',
      message: `Your subscription tier does not have access to ${requestedChatType} chat`
    });
  }
  
  next();
};

module.exports = {
  validateSubscription,
  rateLimiter,
  chatAccessControl
};