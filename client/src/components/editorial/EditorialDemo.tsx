import React from 'react';
import { EditorialCard, EditorialHeading, EditorialText, EditorialButton } from './index';

// Simple demo component to test the editorial system
export function EditorialDemo() {
  return (
    <div className="p-6 space-y-6">
      <EditorialCard variant="glass">
        <EditorialHeading level={2} className="mb-4">
          EDITORIAL LUXURY DEMO
        </EditorialHeading>
        <EditorialText className="mb-6">
          Experience the sophisticated design system that transforms your mobile app 
          into a premium luxury interface.
        </EditorialText>
        <div className="flex gap-4">
          <EditorialButton variant="primary">
            PRIMARY ACTION
          </EditorialButton>
          <EditorialButton variant="secondary">
            SECONDARY
          </EditorialButton>
        </div>
      </EditorialCard>
    </div>
  );
}