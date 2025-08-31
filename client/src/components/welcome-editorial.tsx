import React from 'react';
import { SandraImages } from '../lib/sandra-images';

export default function WelcomeEditorial() {
  return (
    <section className="relative py-24 md:py-32 bg-white">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-12 gap-8 lg:gap-16">
          {/* Left Side - Image */}
          <div className="col-span-12 lg:col-span-5">
            <div className="relative h-[500px] lg:h-[700px] overflow-hidden">
              <img
                src={SandraImages.journey.building}
                alt="Sandra Sigurjónsdóttir - From single mom to 120K followers"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[10px] tracking-[0.5em] uppercase text-white/80">
                  The Real Story
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Story */}
          <div className="col-span-12 lg:col-span-7 lg:pt-12">
            <div className="max-w-2xl">
              {/* Opening */}
              <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-extralight leading-[0.9] mb-8">
                Okay, here's what<br/>
                <span className="italic text-gray-400">actually happened...</span>
              </h2>

              {/* The Journey */}
              <div className="space-y-6 text-base lg:text-lg leading-relaxed text-gray-700 font-light">
                <p>
                  One year ago my marriage ended. Single mom, three kids, zero plan. Just me, 
                  heartbroken and totally lost, trying to figure out how to build a life from literally nothing.
                </p>

                <p>
                  But I had a phone. And I figured out that was all I needed.
                </p>

                <p>
                  Started teaching selfie techniques on Instagram - you know, good angles, 
                  lighting tricks, all that. But then something clicked. Women didn't just need 
                  to know HOW to take photos. They needed the actual photos. Professional ones. 
                  Yesterday.
                </p>

                <p className="text-xl font-light italic border-l-2 border-gray-200 pl-6">
                  "90 days: 120K followers.<br/>
                  Today: Teaching AI to be your photographer."
                </p>

                <p>
                  Look, I get it. You're building something real but you can't drop €500 on a 
                  photoshoot every month. You hate being in front of cameras. You don't have 
                  time for this.
                </p>

                <p>
                  So I built Maya. She's the AI photographer I wished I had when I was crying 
                  in my bathroom at 2am, wondering how I'd ever look "professional" enough to 
                  build a business.
                </p>

                <p className="font-medium">
                  Now? Upload your selfies. Chat with Maya. Get photos that make you look like 
                  the CEO you're becoming. Not the exhausted mom you feel like today.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-12">
                <p className="text-[10px] tracking-[0.5em] uppercase text-gray-400 mb-4">
                  Your mess is your message
                </p>
                <button
                  onClick={() => window.handleGetStarted && window.handleGetStarted()}
                  className="text-[11px] tracking-[0.4em] uppercase text-black border-b border-gray-300 pb-2 hover:border-black transition-all duration-300"
                >
                  Let's build something real
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}