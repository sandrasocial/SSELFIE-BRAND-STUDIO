import React from 'react';
import { SandraImages } from '../lib/sandra-images';

export default function WelcomeEditorial() {
  const handleGetStarted = () => {
    // Check if handleGetStarted is available on window (from parent)
    if (typeof window !== 'undefined' && (window as any).handleGetStarted) {
      (window as any).handleGetStarted();
    } else {
      // Fallback to Maya page
      window.location.href = '/maya';
    }
  };

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20">
        <div className="grid grid-cols-12 gap-6 lg:gap-16">
          {/* Left Side - Image */}
          <div className="col-span-12 lg:col-span-5">
            <div className="relative h-[400px] sm:h-[500px] lg:h-[700px] overflow-hidden">
              <img
                src={SandraImages.journey.building}
                alt="Sandra Sigurjónsdóttir - From single mom to 120K followers"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[8px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/80">
                  The Real Story
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Story */}
          <div className="col-span-12 lg:col-span-7 lg:pt-12">
            <div className="max-w-2xl">
              {/* Opening */}
              <p className="text-[8px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 mb-6 sm:mb-8 text-center lg:text-left">
                Welcome
              </p>
              <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-extralight leading-[0.9] mb-6 sm:mb-8 text-center lg:text-left">
                Professional brand photos. From your selfies.
              </h2>
              
              {/* The Journey - Shortened & Best Friend Style */}
              <div className="space-y-4 sm:space-y-6 text-sm sm:text-base lg:text-lg leading-relaxed text-gray-700 font-light">
                <p>
                  No studio. No awkward posing. No €1000 shoots.
                </p>
                
                <p>
                  Upload your selfies, chat with Maya (your AI stylist), and get photos that look like a pro shot them.
                </p>
                
                <p className="font-medium text-black">
                  Fresh images every month so your brand never looks stale.
                </p>
              </div>
              
              {/* CTA */}
              <div className="mt-8 sm:mt-12 text-center lg:text-left">
                <p className="text-[8px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 mb-3 sm:mb-4">
                  Your mess is your message
                </p>
                <button
                  onClick={handleGetStarted}
                  className="text-[9px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-black border-b border-gray-300 pb-1 sm:pb-2 hover:border-black transition-all duration-300"
                >
                  Start your studio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}