import React from 'react';
import { WelcomeHeader } from '../components/WelcomeHeader';
import LuxuryChatInterface from '../components/LuxuryChatInterface';

export function StudioPage() {
  return (
    <div>
      <WelcomeHeader />
      <div style={{ padding: '0 16px' }}>
        <LuxuryChatInterface />
      </div>
    </div>
  );
}
