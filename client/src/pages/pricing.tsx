import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import PricingComparison from '../components/pricing/PricingComparison';
import SavingsCalculator from '../components/pricing/SavingsCalculator';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
  color: #ffffff;
  font-family: "Times New Roman", serif;
`;

const Hero = styled.div`
  text-align: center;
  padding: 8rem 2rem 4rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 300;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  line-height: 1.6;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto;
`;

const Section = styled.section`
  padding: 4rem 2rem;
`;

const PricingPage: React.FC = () => {
  return (
    <PageContainer>
      <Hero>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Transform Your Brand Journey
        </Title>
        <Subtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Replace your complex stack of tools with one elegant solution.
          Join the future of personal branding.
        </Subtitle>
      </Hero>

      <Section>
        <PricingComparison />
      </Section>

      <Section>
        <SavingsCalculator />
      </Section>
    </PageContainer>
  );
};

export default PricingPage;