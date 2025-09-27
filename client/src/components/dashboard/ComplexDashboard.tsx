import { FC } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData.js';
// import { DashboardMetrics, DashboardSection } from '../../../shared/types/dashboard.js';
import styled from 'styled-components';

// Note: styled-components has type resolution issues with Node16 module resolution
// Using @ts-expect-error to suppress these known TypeScript errors

// Known issue: styled-components has type resolution issues with Node16 module resolution
// @ts-expect-error TS2339: Property 'div' does not exist on styled-components type
// @ts-expect-error TS2339: Property 'div' does not exist on styled-components type
const DashboardContainer = styled.div`
  padding: 40px;
  background: #ffffff;
  min-height: 100vh;
`;

// @ts-expect-error TS2339: styled-components type resolution issue
const DashboardHeader = styled.h1`
  font-family: "Times New Roman", serif;
  font-size: 48px;
  color: #0a0a0a;
  margin-bottom: 40px;
  font-weight: normal;
  letter-spacing: -0.02em;
`;

// @ts-expect-error TS2339: styled-components type resolution issue
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 60px;
`;

// @ts-expect-error TS2339: styled-components type resolution issue
const MetricCard = styled.div`
  background: #f5f5f5;
  padding: 40px;
  
  h3 {
    font-family: "Times New Roman", serif;
    font-size: 24px;
    color: #0a0a0a;
    margin-bottom: 20px;
  }
  
  p {
    font-family: "Times New Roman", serif;
    font-size: 36px;
    color: #0a0a0a;
  }
`;

// @ts-expect-error TS2339: styled-components type resolution issue
const SectionContainer = styled.section`
  margin-bottom: 80px;
  
  h2 {
    font-family: "Times New Roman", serif;
    font-size: 32px;
    color: #0a0a0a;
    margin-bottom: 30px;
    font-weight: normal;
  }
`;

export const ComplexDashboard: FC = () => {
  const { metrics, sections, loading, error } = useDashboardData();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardContainer>
      <DashboardHeader>Executive Dashboard</DashboardHeader>
      
      <MetricsGrid>
        {metrics?.map((metric, index) => (
          <MetricCard key={index}>
            <h3>{metric.label}</h3>
            <p>{metric.value}</p>
          </MetricCard>
        ))}
      </MetricsGrid>

      {sections?.map((section, index) => (
        <SectionContainer key={index}>
          <h2>{section.title}</h2>
          {/* Custom section content rendering based on section.type */}
          <div>{section.content}</div>
        </SectionContainer>
      ))}
    </DashboardContainer>
  );
};

export default ComplexDashboard;