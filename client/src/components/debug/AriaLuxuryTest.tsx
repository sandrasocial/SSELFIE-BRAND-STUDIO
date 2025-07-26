import React from 'react';
import styled from 'styled-components';

const LuxuryContainer = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  padding: 4rem 2rem;
`;

const EditorialHeadline = styled.h1`
  font-family: "Times New Roman", Times, serif;
  font-size: 3.5rem;
  font-weight: normal;
  color: #0a0a0a;
  margin-bottom: 2.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const EditorialText = styled.p`
  font-family: "Times New Roman", Times, serif;
  font-size: 1.25rem;
  line-height: 1.6;
  color: #0a0a0a;
  margin-bottom: 1.5rem;
  max-width: 720px;
`;

const LuxuryCard = styled.div`
  background-color: #f5f5f5;
  padding: 3rem;
  margin: 4rem 0;
  max-width: 920px;
`;

const AriaLuxuryTest: React.FC = () => {
  return (
    <LuxuryContainer>
      <EditorialHeadline>
        The Art of Transformation
      </EditorialHeadline>
      
      <EditorialText>
        From the depths of adversity to the heights of empire, every journey begins with a single, decisive moment.
      </EditorialText>

      <LuxuryCard>
        <EditorialHeadline style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
          Editorial Excellence
        </EditorialHeadline>
        <EditorialText>
          Crafted with precision, our editorial aesthetic speaks the language of luxury through considered typography and sophisticated spatial composition.
        </EditorialText>
      </LuxuryCard>
    </LuxuryContainer>
  );
};

export default AriaLuxuryTest;