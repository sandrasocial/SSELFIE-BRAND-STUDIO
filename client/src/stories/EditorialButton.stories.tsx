import React from 'react';
import { EditorialButton } from '../components/editorial/EditorialButton';

export default {
  title: 'Editorial/EditorialButton',
  component: EditorialButton,
};

export const Default = () => <EditorialButton>Default Button</EditorialButton>;
export const Primary = () => <EditorialButton variant="primary">Primary</EditorialButton>;
export const Secondary = () => <EditorialButton variant="secondary">Secondary</EditorialButton>;
export const Ghost = () => <EditorialButton variant="ghost">Ghost</EditorialButton>;
