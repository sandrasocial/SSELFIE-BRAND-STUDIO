import React from 'react';
import { CoreMessaging, MessageSets } from '../../content/core-messaging';
import styled from '@emotion/styled';

const Container = styled.div`
  font-family: 'Times New Roman', serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
`;

const MainHeadline = styled.h1`
  font-size: 4rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
`;

const Subheadline = styled.h2`
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 3rem;
  color: #333;
`;

const ValueProp = styled.div`
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 4rem;
  font-style: italic;
`;

const BenefitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
`;

const Benefit = styled.div`
  padding: 2rem;
  background: #f8f8f8;
  border: 1px solid #eaeaea;
`;

const CTAButton = styled.button`
  background: #1a1a1a;
  color: white;
  padding: 1rem 3rem;
  border: none;
  font-family: 'Times New Roman', serif;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #333;
  }
`;

export const ValueProposition: React.FC = () => {
  return (
    <Container>
      <MainHeadline>{MessageSets.hero.headline}</MainHeadline>
      <Subheadline>{MessageSets.hero.subheadline}</Subheadline>
      
      <ValueProp>
        {MessageSets.hero.valueProposition}
      </ValueProp>

      <BenefitGrid>
        {MessageSets.features.benefits.map((benefit, index) => (
          <Benefit key={index}>
            {benefit}
          </Benefit>
        ))}
      </BenefitGrid>

      <CTAButton>
        {CoreMessaging.cta.primary}
      </CTAButton>
    </Container>
  );
};