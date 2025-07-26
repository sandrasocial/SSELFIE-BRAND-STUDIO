import React from 'react';
import styled from 'styled-components';

const LuxuryContainer = styled.div`
  background-color: #ffffff;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const EditorialHeadline = styled.h1`
  font-family: "Times New Roman", Times, serif;
  font-size: 3.5rem;
  font-weight: 400;
  color: #0a0a0a;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 2rem;
`;

const LuxuryText = styled.p`
  font-family: "Times New Roman", Times, serif;
  font-size: 1.25rem;
  line-height: 1.6;
  color: #0a0a0a;
  margin-bottom: 1.5rem;
`;

const EditorialCard = styled.div`
  background-color: #f5f5f5;
  padding: 3rem;
  margin: 2rem 0;
  border: 1px solid #0a0a0a;
`;

const AriaEditorialShowcase: React.FC = () => {
  return (
    <LuxuryContainer>
      <EditorialHeadline>The Art of Luxury Transformation</EditorialHeadline>
      
      <EditorialCard>
        <LuxuryText>
          From rock bottom to empire, every journey begins with a single step into transformation. 
          This is where ambition meets destiny, where your future self emerges from the shadows of doubt.
        </LuxuryText>
      </EditorialCard>

      <EditorialCard>
        <LuxuryText>
          Embrace the power of your narrative. Your story, crafted with intention, 
          becomes the foundation of your legacy. This is more than change – 
          this is metamorphosis.
        </LuxuryText>
      </EditorialCard>
    </LuxuryContainer>
  );
};

export default AriaEditorialShowcase;