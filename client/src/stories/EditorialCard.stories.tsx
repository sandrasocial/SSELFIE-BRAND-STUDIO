import React from 'react';
import { EditorialCard } from '../components/editorial/EditorialCard.js';

export default {
  title: 'Editorial/EditorialCard',
  component: EditorialCard,
};

export const Default = () => <EditorialCard>Default Card</EditorialCard>;
export const Elevated = () => <EditorialCard variant="elevated">Elevated Card</EditorialCard>;
export const Glass = () => <EditorialCard variant="glass">Glass Card</EditorialCard>;
