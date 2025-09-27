import { FC } from 'react';

// Placeholder components to avoid import errors
const Hero: FC<{ 
  fullBleedImage?: boolean; 
  overlayText?: boolean; 
  ctaPlacement?: string; 
}> = ({ fullBleedImage, overlayText, ctaPlacement }) => (
  <div className="placeholder-component">
    <h1>Hero Section (Placeholder)</h1>
    <p>Full bleed: {fullBleedImage ? 'yes' : 'no'}</p>
    <p>Overlay text: {overlayText ? 'yes' : 'no'}</p>
    <p>CTA placement: {ctaPlacement}</p>
  </div>
);

const BrandStory: FC = () => (
  <div className="placeholder-component">
    <h2>Brand Story (Placeholder)</h2>
  </div>
);

const ServicesOverview: FC = () => (
  <div className="placeholder-component">
    <h2>Services Overview (Placeholder)</h2>
  </div>
);

const CallToAction: FC<{ type?: string; style?: string }> = ({ type, style }) => (
  <div className="placeholder-component">
    <h2>Call to Action (Placeholder)</h2>
    <p>Type: {type}, Style: {style}</p>
  </div>
);

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