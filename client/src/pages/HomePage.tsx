import { FC } from 'react';
import { Hero } from '../components/editorial/Hero.js';
import { BrandStory } from '../components/editorial/BrandStory.js';
import { ServicesOverview } from '../components/editorial/ServicesOverview.js';
import { CallToAction } from '../components/editorial/CallToAction.js';

const HomePage: FC = () => {
  return (
    <div className="homepage luxury-layout">
      <Hero 
        fullBleedImage={true}
        overlayText={true}
        ctaPlacement="center"
      />
      <BrandStory />
      <ServicesOverview />
      <CallToAction 
        type="booking"
        style="editorial"
      />
    </div>
  );
};

export default HomePage;