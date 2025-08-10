import React from 'react';
import { BrandStory } from '../components/editorial/BrandStory';
import { Credentials } from '../components/editorial/Credentials';
import { BehindTheScenes } from '../components/editorial/BehindTheScenes';
import { TrustElements } from '../components/editorial/TrustElements';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page luxury-layout">
      <BrandStory extended={true} />
      <Credentials />
      <BehindTheScenes />
      <TrustElements style="editorial" />
    </div>
  );
};

export default AboutPage;