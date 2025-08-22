import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.background} 0%, #FFF5F9 100%);
`;

const Hero = styled.section`
  padding: ${theme.spacing.xl} 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  max-width: 600px;
`;

const PricingSection = styled.section`
  padding: ${theme.spacing.xl} 5%;
  background: white;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const PricingCard = styled.div`
  padding: ${theme.spacing.xl};
  border-radius: 8px;
  box-shadow: ${theme.shadows.medium};
  background: white;
  text-align: center;
`;

const CTAButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: ${theme.transitions.default};
  
  &:hover {
    background: ${theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const LandingPage = () => {
  return (
    <LandingContainer>
      <Hero>
        <HeroContent>
          <h1>Transform Your Personal Brand with SSELFIE Studio</h1>
          <p>Your all-in-one platform for creating, managing, and growing your personal brand presence online.</p>
          <CTAButton>Start Your Journey</CTAButton>
        </HeroContent>
        <div className="hero-image">
          {/* Placeholder for hero image */}
        </div>
      </Hero>

      <PricingSection>
        <h2>Choose Your Path to Success</h2>
        <PricingGrid>
          <PricingCard>
            <h3>Creator</h3>
            <p className="price">€27/month</p>
            <ul>
              <li>AI-Powered Content Creation</li>
              <li>Personal Brand Styling</li>
              <li>Smart Photo Management</li>
              <li>Basic Analytics</li>
            </ul>
            <CTAButton>Get Started</CTAButton>
          </PricingCard>
          
          <PricingCard>
            <h3>Entrepreneur</h3>
            <p className="price">€67/month</p>
            <ul>
              <li>Everything in Creator</li>
              <li>Advanced AI Training</li>
              <li>Custom Brand Strategy</li>
              <li>Priority Support</li>
              <li>Advanced Analytics</li>
            </ul>
            <CTAButton>Upgrade Now</CTAButton>
          </PricingCard>
        </PricingGrid>
      </PricingSection>
    </LandingContainer>
  );
};

export default LandingPage;