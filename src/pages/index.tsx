import React from 'react';
import { Box } from '@mui/material';
import { HeroSection } from '../components/landing/HeroSection';
import { ValueProps } from '../components/landing/ValueProps';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PricingSection } from '../components/landing/PricingSection';
import { AboutSection } from '../components/landing/AboutSection';

export default function HomePage() {
  return (
    <Box>
      <HeroSection />
      <ValueProps />
      <HowItWorks />
      <PricingSection />
      <AboutSection />
    </Box>
  );
};