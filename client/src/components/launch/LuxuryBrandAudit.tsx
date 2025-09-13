import { FC } from 'react';
import styled from 'styled-components';

const LuxuryContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'as'
})`
  background: #ffffff;
  color: #0a0a0a;
  padding: 4rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const LuxuryHeading = styled.h1.withConfig({
  shouldForwardProp: (prop) => prop !== 'as'
})`
  font-family: "Times New Roman", serif;
  font-size: 3.5rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin-bottom: 3rem;
  color: #0a0a0a;
`;

const AuditSection = styled.section.withConfig({
  shouldForwardProp: (prop) => prop !== 'as'
})`
  margin: 4rem 0;
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 3rem;
`;

const SectionTitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => prop !== 'as'
})`
  font-family: "Times New Roman", serif;
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 2rem;
  color: #0a0a0a;
`;

const AuditText = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== 'as'
})`
  font-family: "Times New Roman", serif;
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: #0a0a0a;
`;

const AuditGrid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['jsx', 'global'].includes(prop)
})`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  margin: 2rem 0;
`;

const AuditCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['jsx', 'global'].includes(prop)
})`
  background: #f5f5f5;
  padding: 2rem;
`;

const MetricValue = styled.div.withConfig({
  shouldForwardProp: (prop) => !['jsx', 'global'].includes(prop)
})`
  font-family: "Times New Roman", serif;
  font-size: 2.5rem;
  margin: 1rem 0;
  color: #0a0a0a;
`;

const LuxuryBrandAudit: FC = () => {
  return (
    <LuxuryContainer>
      <LuxuryHeading>Luxury Brand Performance Audit</LuxuryHeading>
      
      <AuditSection>
        <SectionTitle>Brand Positioning Analysis</SectionTitle>
        <AuditText>
          A comprehensive evaluation of your luxury market positioning, competitive advantage,
          and brand narrative effectiveness in the high-end segment.
        </AuditText>
        
        <AuditGrid>
          <AuditCard>
            <SectionTitle>Brand Recognition</SectionTitle>
            <MetricValue>94%</MetricValue>
            <AuditText>Premium market recognition score</AuditText>
          </AuditCard>
          
          <AuditCard>
            <SectionTitle>Luxury Perception</SectionTitle>
            <MetricValue>4.8/5</MetricValue>
            <AuditText>Consumer luxury rating</AuditText>
          </AuditCard>
        </AuditGrid>
      </AuditSection>

      <AuditSection>
        <SectionTitle>Visual Identity Assessment</SectionTitle>
        <AuditText>
          Detailed analysis of brand visual elements, consistency across touchpoints,
          and alignment with luxury market standards.
        </AuditText>
        
        <AuditGrid>
          <AuditCard>
            <SectionTitle>Design Consistency</SectionTitle>
            <MetricValue>98%</MetricValue>
            <AuditText>Cross-platform cohesion score</AuditText>
          </AuditCard>
          
          <AuditCard>
            <SectionTitle>Premium Appeal</SectionTitle>
            <MetricValue>4.9/5</MetricValue>
            <AuditText>Visual sophistication rating</AuditText>
          </AuditCard>
        </AuditGrid>
      </AuditSection>

      <AuditSection>
        <SectionTitle>Market Performance Metrics</SectionTitle>
        <AuditText>
          Key performance indicators measuring brand success, market penetration,
          and luxury segment growth metrics.
        </AuditText>
        
        <AuditGrid>
          <AuditCard>
            <SectionTitle>Market Share</SectionTitle>
            <MetricValue>32%</MetricValue>
            <AuditText>Luxury segment dominance</AuditText>
          </AuditCard>
          
          <AuditCard>
            <SectionTitle>Growth Rate</SectionTitle>
            <MetricValue>127%</MetricValue>
            <AuditText>Year-over-year expansion</AuditText>
          </AuditCard>
        </AuditGrid>
      </AuditSection>
    </LuxuryContainer>
  );
};

export default LuxuryBrandAudit;