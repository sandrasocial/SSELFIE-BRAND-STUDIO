import { FC } from 'react';
import { Hero } from '../components/editorial/Hero';
import { BrandStory } from '../components/editorial/BrandStory';
import { ServicesOverview } from '../components/editorial/ServicesOverview';
import { CallToAction } from '../components/editorial/CallToAction';

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