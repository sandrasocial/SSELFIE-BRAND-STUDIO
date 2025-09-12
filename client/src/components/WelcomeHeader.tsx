import React from 'react';
import { useAuth } from '../hooks/use-auth';

export function WelcomeHeader() {
  const { user } = useAuth();
  // TODO: Fetch a dynamic tip from Maya
  const mayaTip = "Try a 'Golden Hour' concept for a warmer, more approachable feel.";

  // Calculate remaining generations
  const generationsRemaining = (user?.monthlyGenerationLimit ?? 0) - (user?.generationsUsedThisMonth ?? 0);

  return (
    <div style={{
      padding: 'var(--space-xl) var(--space-lg)',
      borderBottom: '1px solid var(--accent-line)',
      marginBottom: 'var(--space-xl)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xl)',
      }}>
        <div>
          <p className="body-large" style={{ margin: 0 }}>
            Welcome, {user?.firstName || 'Creator'}.
          </p>
          <p className="body-elegant" style={{ color: 'var(--body-gray)', margin: 0, fontSize: 'var(--text-sm)' }}>
            You have <strong>{generationsRemaining} photos</strong> remaining this month.
          </p>
        </div>
        <div>
          <p className="luxury-eyebrow" style={{ margin: 0, marginBottom: 'var(--space-xs)' }}>
            MAYA'S TIP OF THE DAY
          </p>
          <p className="body-elegant" style={{ margin: 0 }}>
            {mayaTip}
          </p>
        </div>
      </div>
    </div>
  );
}
