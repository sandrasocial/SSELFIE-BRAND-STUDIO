import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const PricingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  font-family: "Times New Roman", serif;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const PricingTier = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const TierHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const TierName = styled.h3`
  font-size: 1.8rem;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
`;

const Price = styled.div`
  font-size: 3.5rem;
  margin: 1rem 0;
  font-weight: 300;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
`;

const Feature = styled.li`
  padding: 0.8rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  
  &:before {
    content: "✓";
    color: #ffffff;
  }
`;

const PricingComparison: React.FC = () => {
  const tiers = [
    {
      name: "Creator",
      price: "€27",
      features: [
        "AI-Powered Personal Brand Training",
        "Basic Style Consultation",
        "Essential Photo Shoot Guides",
        "Simple Website Builder",
        "Basic Brand Management Tools"
      ]
    },
    {
      name: "Entrepreneur",
      price: "€67",
      features: [
        "Advanced AI Brand Development",
        "Premium Style Direction",
        "Professional Photo Shoot System",
        "Advanced Website Builder",
        "Full Brand Management Suite",
        "Priority Support",
        "Analytics Dashboard",
        "Custom Brand Guidelines"
      ]
    }
  ];

  return (
    <PricingContainer>
      <PricingGrid>
        {tiers.map((tier) => (
          <PricingTier
            key={tier.name}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TierHeader>
              <TierName>{tier.name}</TierName>
              <Price>{tier.price}<span style={{ fontSize: "1rem" }}>/month</span></Price>
            </TierHeader>
            <FeatureList>
              {tier.features.map((feature) => (
                <Feature key={feature}>{feature}</Feature>
              ))}
            </FeatureList>
          </PricingTier>
        ))}
      </PricingGrid>
    </PricingContainer>
  );
};

export default PricingComparison;