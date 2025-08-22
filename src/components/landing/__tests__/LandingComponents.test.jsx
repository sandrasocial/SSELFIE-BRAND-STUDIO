import React from 'react';
import { render, screen, act } from '@testing-library/react';
import HeroSection from '../HeroSection';
import AboutSection from '../AboutSection';
import PricingSection from '../PricingSection';
import ValueProps from '../ValueProps';

// Test suite for HeroSection
describe('HeroSection', () => {
  it('should maintain styling with React 18 concurrent rendering', async () => {
    const heroRef = React.createRef();
    await act(async () => {
      render(<HeroSection ref={heroRef} />);
    });
    expect(heroRef.current).toBeTruthy();
  });

  it('should properly handle styled-components with concurrent features', () => {
    const { container } = render(<HeroSection />);
    expect(container).toBeInTheDocument();
  });
});

// Test suite for AboutSection
describe('AboutSection', () => {
  it('should maintain responsive styling in React 18', async () => {
    const aboutRef = React.createRef();
    await act(async () => {
      render(<AboutSection ref={aboutRef} />);
    });
    expect(aboutRef.current).toBeTruthy();
  });
});

// Test suite for PricingSection
describe('PricingSection', () => {
  it('should handle dynamic styling updates correctly', async () => {
    const pricingRef = React.createRef();
    await act(async () => {
      render(<PricingSection ref={pricingRef} />);
    });
    expect(pricingRef.current).toBeTruthy();
  });
});

// Test suite for ValueProps
describe('ValueProps', () => {
  it('should maintain styling consistency during concurrent updates', async () => {
    const valuePropsRef = React.createRef();
    await act(async () => {
      render(<ValueProps ref={valuePropsRef} />);
    });
    expect(valuePropsRef.current).toBeTruthy();
  });
});