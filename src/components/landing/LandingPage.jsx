import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.backgroundGradient};
  overflow-x: hidden;
`;

const Hero = styled.section`
  padding: ${theme.spacing.xl} 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.xl};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 80%;
    height: 200%;
    background: linear-gradient(135deg, ${theme.colors.primaryLight}20 0%, ${theme.colors.primary}10 100%);
    transform: rotate(-15deg);
    z-index: 0;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    animation: float 15s ease-in-out infinite;
  }
  
  @keyframes float {
    0% { transform: rotate(-15deg) translateY(0px); }
    50% { transform: rotate(-10deg) translateY(-20px); }
    100% { transform: rotate(-15deg) translateY(0px); }
  }
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    text-align: center;
    
    &:after {
      display: none;
    }
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
  border-radius: 16px;
  box-shadow: ${theme.shadows.medium};
  background: white;
  text-align: center;
  transition: ${theme.transitions.default};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.premium ? theme.colors.premiumGradient : theme.colors.primary};
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.large};
  }
  
  h3 {
    color: ${theme.colors.primary};
    font-size: 1.8rem;
    margin-bottom: ${theme.spacing.md};
  }
  
  .price {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${theme.colors.text};
    margin: ${theme.spacing.lg} 0;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: ${theme.spacing.lg} 0;
    
    li {
      padding: ${theme.spacing.sm} 0;
      color: ${theme.colors.textLight};
      
      &:before {
        content: '✨';
        margin-right: ${theme.spacing.sm};
        color: ${theme.colors.primary};
      }
    }
  }
`;

const CTAButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${props => props.premium ? theme.colors.premiumGradient : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
    transform: translateX(-100%);
    transition: 0.6s;
    z-index: -1;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 14px rgba(255,105,180,0.3);
    
    &:before {
      transform: translateX(100%);
    }
  }
  
  &:active {
    transform: translateY(-1px);
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
          
          <PricingCard premium>
            <h3>Entrepreneur</h3>
            <p className="price">€67/month</p>
            <ul>
              <li>Everything in Creator</li>
              <li>Advanced AI Training</li>
              <li>Custom Brand Strategy</li>
              <li>Priority Support</li>
              <li>Advanced Analytics</li>
            </ul>
            <CTAButton premium>Upgrade Now</CTAButton>
          </PricingCard>
        </PricingGrid>
      </PricingSection>
    </LandingContainer>
  );
};

export default LandingPage;