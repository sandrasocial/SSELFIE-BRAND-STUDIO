import React from 'react';
import { useSubscription } from './SubscriptionContext';

export function SubscriptionStatus() {
  const { currentTier, usage, SUBSCRIPTION_TIERS } = useSubscription();

  if (!currentTier) {
    return (
      <div className="subscription-status subscription-status--inactive">
        <h3>No Active Subscription</h3>
        <button className="upgrade-button">
          Upgrade Now
        </button>
      </div>
    );
  }

  const tierInfo = SUBSCRIPTION_TIERS[currentTier];
  const usagePercentages = {
    photos: (usage.photos / tierInfo.limits.monthlyPhotos) * 100,
    stylePresets: (usage.stylePresets / tierInfo.limits.stylePresets) * 100,
    websites: (usage.websites / tierInfo.limits.websites) * 100
  };

  return (
    <div className="subscription-status subscription-status--active">
      <div className="tier-info">
        <h3>{tierInfo.name} Plan</h3>
        <p className="price">€{tierInfo.price}/month</p>
      </div>

      <div className="usage-metrics">
        <div className="usage-item">
          <label>Photos</label>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${usagePercentages.photos}%` }}
            />
          </div>
          <span>{usage.photos}/{tierInfo.limits.monthlyPhotos}</span>
        </div>

        <div className="usage-item">
          <label>Style Presets</label>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${usagePercentages.stylePresets}%` }}
            />
          </div>
          <span>{usage.stylePresets}/{tierInfo.limits.stylePresets}</span>
        </div>

        <div className="usage-item">
          <label>Websites</label>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${usagePercentages.websites}%` }}
            />
          </div>
          <span>{usage.websites}/{tierInfo.limits.websites}</span>
        </div>
      </div>

      {currentTier === 'CREATOR' && (
        <div className="upgrade-section">
          <button className="upgrade-button">
            Upgrade to Entrepreneur
          </button>
          <p className="upgrade-benefits">
            Get 5x more photos, 4x more style presets, and multiple websites
          </p>
        </div>
      )}
    </div>
  );
}