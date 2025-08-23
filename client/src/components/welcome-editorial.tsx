import React from 'react';
import { SandraImages } from '../lib/sandra-images';

export default function WelcomeEditorial() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative h-96 lg:h-[600px] w-full lg:w-1/2 flex-shrink-0 overflow-hidden group cursor-pointer">
            <img
              src={SandraImages.journey.building}
              alt="Sandra's SSELFIE editorial example"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
          
          {/* Content */}
          <div className="space-y-8 w-full lg:w-1/2">
            {/* Main Headline */}
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight tracking-[-0.01em] text-[#171719]"
              style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}
            >
              Okay, here's what actually happened...
            </h2>
            
            {/* Story Content */}
            <div className="space-y-6 text-base md:text-lg leading-relaxed text-[#171719] font-light font-inter">
              <p>One year ago my marriage ended. Single mom, three kids, zero plan.</p>
              <p>But I had a phone. And I figured out that was all I needed.</p>
              <p>90 days later: 120K followers. Today: A business that actually works. Now: Teaching you exactly how I did it.</p>
              <p>No fancy equipment. No design degree. Just strategy that actually works.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}