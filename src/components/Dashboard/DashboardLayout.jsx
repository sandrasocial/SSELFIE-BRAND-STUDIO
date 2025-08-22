import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  font-family: "Times New Roman", serif;
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
  background: #fafafa;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  border-bottom: 1px solid #000;
  padding-bottom: 1rem;
`;

const WorkflowSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const DashboardLayout = ({ children }) => {
  return (
    <DashboardContainer>
      <Header>
        <h1>SSELFIE STUDIO</h1>
        <nav>{/* Navigation components */}</nav>
      </Header>
      <WorkflowSection>
        {children}
      </WorkflowSection>
    </DashboardContainer>
  );
};

export default DashboardLayout;