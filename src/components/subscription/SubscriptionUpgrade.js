import React, { useState } from 'react';
import { useSubscription } from './SubscriptionContext';

export function SubscriptionUpgrade() {
  const { currentTier, SUBSCRIPTION_TIERS } = useSubscription();
  const [processing, setProcessing] = useState(false);

  const handleSubscriptionChange = async (newTier) => {
    setProcessing(true);
    try {
      // TODO: Integrate with payment processing and backend API
      const response = await fetch('/api/subscription/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newTier }),
      });

      if (!response.ok) {
        throw new Error('Subscription change failed');
      }

      // Refresh page or update state after successful change
      window.location.reload();
    } catch (error) {
      console.error('Error changing subscription:', error);
      alert('Failed to change subscription. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="subscription-upgrade">
      <h2>Choose Your Plan</h2>
      
      <div className="plan-comparison">
        <div className={`plan ${currentTier === 'CREATOR' ? 'current' : ''}`}>
          <h3>Creator</h3>
          <div className="price">€27/month</div>
          <ul className="features">
            {SUBSCRIPTION_TIERS.CREATOR.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <div className="limits">
            <p>{SUBSCRIPTION_TIERS.CREATOR.limits.monthlyPhotos} Photos/month</p>
            <p>{SUBSCRIPTION_TIERS.CREATOR.limits.stylePresets} Style Presets</p>
            <p>{SUBSCRIPTION_TIERS.CREATOR.limits.websites} Website</p>
          </div>
          <button
            className="subscription-button"
            onClick={() => handleSubscriptionChange('CREATOR')}
            disabled={processing || currentTier === 'CREATOR'}
          >
            {currentTier === 'CREATOR' ? 'Current Plan' : 'Switch to Creator'}
          </button>
        </div>

        <div className={`plan ${currentTier === 'ENTREPRENEUR' ? 'current' : ''}`}>
          <h3>Entrepreneur</h3>
          <div className="price">€67/month</div>
          <ul className="features">
            {SUBSCRIPTION_TIERS.ENTREPRENEUR.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <div className="limits">
            <p>{SUBSCRIPTION_TIERS.ENTREPRENEUR.limits.monthlyPhotos} Photos/month</p>
            <p>{SUBSCRIPTION_TIERS.ENTREPRENEUR.limits.stylePresets} Style Presets</p>
            <p>{SUBSCRIPTION_TIERS.ENTREPRENEUR.limits.websites} Websites</p>
          </div>
          <button
            className="subscription-button"
            onClick={() => handleSubscriptionChange('ENTREPRENEUR')}
            disabled={processing || currentTier === 'ENTREPRENEUR'}
          >
            {currentTier === 'ENTREPRENEUR' ? 'Current Plan' : 'Switch to Entrepreneur'}
          </button>
        </div>
      </div>

      {processing && (
        <div className="processing-overlay">
          Processing your request...
        </div>
      )}
    </div>
  );
}