import React from 'react';
import styled from 'styled-components';

const WorkflowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StepCard = styled.div`
  background: white;
  padding: 2rem;
  border: 1px solid #000;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: #f8f8f8;
  }

  h3 {
    font-family: "Times New Roman", serif;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .status {
    font-size: 0.875rem;
    color: #666;
    margin-top: 1rem;
  }
`;

const StepIndicator = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active ? '#000' : '#fff'};
  border: 1px solid #000;
  margin-right: 1rem;
`;

const WorkflowSteps = () => {
  const steps = [
    {
      id: 'train',
      title: 'TRAIN',
      description: 'Train your personal AI model',
      status: 'Not started'
    },
    {
      id: 'style',
      title: 'STYLE',
      description: 'Define your unique style profile',
      status: 'In progress'
    },
    {
      id: 'shoot',
      title: 'SHOOT',
      description: 'Generate professional photoshoot prompts',
      status: 'Not started'
    },
    {
      id: 'build',
      title: 'BUILD',
      description: 'Create your personal brand website',
      status: 'Not started'
    }
  ];

  return (
    <WorkflowContainer>
      {steps.map((step) => (
        <StepCard key={step.id}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <StepIndicator active={step.status === 'In progress'} />
            <h3>{step.title}</h3>
          </div>
          <p>{step.description}</p>
          <div className="status">Status: {step.status}</div>
        </StepCard>
      ))}
    </WorkflowContainer>
  );
};

export default WorkflowSteps;