import React from 'react';
import { useSubscription } from './SubscriptionContext';

export function withSubscriptionAccess(WrappedComponent, requiredFeature) {
  return function SubscriptionProtectedComponent(props) {
    const { checkFeatureAccess, currentTier, SUBSCRIPTION_TIERS } = useSubscription();

    if (!checkFeatureAccess(requiredFeature)) {
      return (
        <div className="subscription-restricted">
          <h3>Feature Restricted</h3>
          <p>This feature requires a higher subscription tier.</p>
          
          {!currentTier && (
            <div className="upgrade-prompt">
              <p>Subscribe to access this feature:</p>
              <button className="upgrade-button">
                View Plans
              </button>
            </div>
          )}
          
          {currentTier === 'CREATOR' && (
            <div className="upgrade-prompt">
              <p>Upgrade to Entrepreneur to access this feature:</p>
              <button className="upgrade-button">
                Upgrade Now (€67/month)
              </button>
            </div>
          )}
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}