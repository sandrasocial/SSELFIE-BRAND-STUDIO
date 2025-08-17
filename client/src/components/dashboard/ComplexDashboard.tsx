import { FC } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
// import { DashboardMetrics, DashboardSection } from '../../../shared/types/dashboard';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 40px;
  background: #ffffff;
  min-height: 100vh;
`;

const DashboardHeader = styled.h1`
  font-family: "Times New Roman", serif;
  font-size: 48px;
  color: #0a0a0a;
  margin-bottom: 40px;
  font-weight: normal;
  letter-spacing: -0.02em;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 60px;
`;

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