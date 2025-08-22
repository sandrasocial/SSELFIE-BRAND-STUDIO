import React, { createContext, useContext, useState, useEffect } from 'react';

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  CREATOR: {
    name: 'Creator',
    price: 27,
    features: [
      'AI Model Training',
      'Basic Style Customization',
      'Photo Shoot Prompts',
      'Simple Website Builder',
      'Basic Analytics'
    ],
    limits: {
      monthlyPhotos: 100,
      stylePresets: 5,
      websites: 1
    }
  },
  ENTREPRENEUR: {
    name: 'Entrepreneur',
    price: 67,
    features: [
      'Advanced AI Training',
      'Premium Style Collection',
      'Advanced Shoot Direction',
      'Multi-Site Builder',
      'Advanced Analytics',
      'Priority Support'
    ],
    limits: {
      monthlyPhotos: 500,
      stylePresets: 20,
      websites: 5
    }
  }
};

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [currentTier, setCurrentTier] = useState(null);
  const [usage, setUsage] = useState({
    photos: 0,
    stylePresets: 0,
    websites: 0
  });

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // TODO: Integrate with backend API
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      setCurrentTier(data.tier);
      setUsage(data.usage);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const checkFeatureAccess = (feature) => {
    if (!currentTier) return false;
    return SUBSCRIPTION_TIERS[currentTier].features.includes(feature);
  };

  const checkUsageLimit = (type) => {
    if (!currentTier) return false;
    return usage[type] < SUBSCRIPTION_TIERS[currentTier].limits[type];
  };

  const value = {
    currentTier,
    usage,
    checkFeatureAccess,
    checkUsageLimit,
    SUBSCRIPTION_TIERS
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}