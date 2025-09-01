import React from 'react';
import { SandraImages } from '../lib/sandra-images';

export default function WelcomeEditorial() {
  const handleGetStarted = () => {
    if (typeof window !== 'undefined' && (window as any).handleGetStarted) {
      (window as any).handleGetStarted();
    } else {
      window.location.href = '/maya';
    }
  };

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 bg-gray-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20">
        <div className="grid grid-cols-12 gap-8 lg:gap-16">
          {/* Left Side - Content */}
          <div className="col-span-12 lg:col-span-7 order-2 lg:order-1">
            <div className="max-w-2xl lg:pt-16">
              <p className="text-[8px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 mb-6 sm:mb-8">
                But Wait... AI Photos?
              </p>
              
              <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-extralight leading-[0.9] mb-6 sm:mb-8">
                I know what you're thinking.
              </h2>
              
              <div className="space-y-4 sm:space-y-6 text-sm sm:text-base lg:text-lg leading-relaxed text-gray-700 font-light">
                <p>
                  "Isn't that cheating?" "What if people can tell?" "I want to be authentic..."
                </p>
                
                <p>
                  Girl, I GET IT. I was skeptical too.
                </p>
                
                <p className="font-medium text-black">
                  But here's the thing: your competitors are already using AI. The women in your industry who seem to have endless professional photos? Half of them are using tools like this.
                </p>
                
                <p>
                  You can spend the next year debating whether AI photos are "authentic enough" while they're booking clients with their stunning feeds...
                </p>
                
                <p className="font-medium text-black italic">
                  Or you can get on board now and be three steps ahead.
                </p>
                
                <p>
                  My system doesn't just copy-paste your face. It studies YOUR expressions, YOUR energy, and creates photos that are authentically you. Just... better lighting, better styling, better everything.
                </p>
              </div>
              
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                <p className="text-[8px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-gray-400 mb-3 sm:mb-4">
                  The question isn't "Should I use AI?"
                </p>
                <p className="text-base sm:text-lg font-medium text-black mb-6">
                  The question is "Why wouldn't I use every tool available to build my dream business?"
                </p>
                <button
                  onClick={handleGetStarted}
                  className="text-[9px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-black border-b border-gray-300 pb-1 sm:pb-2 hover:border-black transition-all duration-300"
                >
                  Show Me How It Works
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side - Image */}
          <div className="col-span-12 lg:col-span-5 order-1 lg:order-2">
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
              <img
                src="https://sselfie-training-zips.s3.eu-north-1.amazonaws.com/generated-images/42585527/maya_rr4fnv2rb5rm80crzyd87jm48g_0_1756634973175.png"
                alt="AI vs Reality - Professional photos that look like you"
                className="w-full h-full object-cover object-top transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[8px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/80 mb-2">
                  Your future self
                </p>
                <p className="text-white text-sm sm:text-base font-light">
                  is waiting for you to stop overthinking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}