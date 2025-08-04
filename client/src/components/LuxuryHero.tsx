import React from 'react';
import styled from 'styled-components';

const HeroContainer = styled.section`
  height: 90vh;
  width: 100%;
  position: relative;
  background: #0a0a0a;
  overflow: hidden;
`;

const EditorialImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  transition: opacity 0.8s ease;
`;

const ContentOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
  width: 80%;
`;

const EditorialHeadline = styled.h1`
  font-family: "Times New Roman", serif;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  color: #ffffff;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
  font-weight: 300;
`;

const LuxuryDescription = styled.p`
  font-family: -apple-system, system-ui, sans-serif;
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  color: #f5f5f5;
  line-height: 1.6;
  max-width: 60ch;
  margin: 0 auto;
`;

interface LuxuryHeroProps {
  imageUrl: string;
  headline: string;
  description: string;
}

const LuxuryHero: React.FC<LuxuryHeroProps> = ({
  imageUrl,
  headline,
  description
}) => {
  return (
    <HeroContainer>
      <EditorialImage src={imageUrl} alt={headline} />
      <ContentOverlay>
        <EditorialHeadline>{headline}</EditorialHeadline>
        <LuxuryDescription>{description}</LuxuryDescription>
      </ContentOverlay>
    </HeroContainer>
  );
};

export default LuxuryHero;