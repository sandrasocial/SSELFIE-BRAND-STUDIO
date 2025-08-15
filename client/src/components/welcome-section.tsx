import React from 'react';
import { SandraImages } from '../lib/sandra-images';

export default function WelcomeSection() {
  return (
    <section className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2 bg-[#f5f5f5]">
      {/* Image Section */}
      <div className="bg-[#0a0a0a] relative overflow-hidden min-h-[320px] lg:min-h-[80vh]">
        <img
          src={SandraImages.editorial.laptop1}
          alt="Sandra's SSELFIE editorial workspace"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content Section */}
      <div className="py-16 lg:py-20 px-8 lg:px-12 xl:px-16 flex flex-col justify-center">
        
        {/* Editorial Tagline */}
        <p className="text-[10px] tracking-[0.5em] uppercase text-[#666666] mb-8 font-light">
          Welcome to SSELFIE Studio
        </p>
        
        {/* Main Editorial Headline */}
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] text-[#0a0a0a] mb-12 tracking-[-0.02em]"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          The digital studio where your face is the brand.
        </h1>
        
        {/* Editorial Pullquote */}
        <blockquote className="relative mb-12">
          <div className="absolute left-0 top-0 w-1 h-16 bg-[#0a0a0a]"></div>
          <p 
            className="text-2xl md:text-3xl font-light italic text-[#0a0a0a] pl-8 leading-tight"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            "One year ago my marriage ended. Single mom, three kids, zero plan. But I had a phone."
          </p>
        </blockquote>
        
        {/* Body Text - Editorial Typography */}
        <div className="space-y-6 text-[#0a0a0a]/80 leading-relaxed mb-12">
          <p className="text-lg font-light">
            I figured out that was all I needed.
          </p>
          
          <p className="text-base font-light">
            SSELFIE STUDIO is for women who are done waiting for perfect. Upload your actual selfies. 
            No fancy camera, no design degree, no pretending. My AI just brings out what's already there.
          </p>
          
          <p className="text-base font-light">
            Your face. Your story. Your brand, all done in minutes.
          </p>
        </div>
        
        {/* Editorial Divider */}
        <div className="w-24 h-px bg-[#0a0a0a] mb-12"></div>
        
        {/* Secondary Headline */}
        <h2 
          className="text-3xl md:text-4xl font-light leading-tight text-[#0a0a0a] mb-8 tracking-[-0.01em]"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          This didn't start as a business. It started as survival.
        </h2>
        
        {/* Supporting Body Text */}
        <div className="space-y-4 text-[#0a0a0a]/70 leading-relaxed mb-12">
          <p className="text-base font-light">
            One year ago, I hit rock bottom. Divorced. Three kids. No backup plan. I was heartbroken, 
            exhausted, and completely disconnected from the woman I used to be.
          </p>
          
          <p className="text-base font-light">
            And one day, in the middle of all that mess—I picked up my phone. Took a selfie. Posted something honest. 
            Not perfect. Just true.
          </p>
        </div>
        
        {/* Editorial CTA */}
        <button className="group inline-flex items-center text-[10px] tracking-[0.4em] uppercase text-[#0a0a0a] hover:text-[#666666] transition-all duration-300 self-start">
          <span className="border-b border-[#0a0a0a] group-hover:border-[#666666] pb-1">
            Read My Full Story
          </span>
          <span className="ml-4 transform group-hover:translate-x-1 transition-transform duration-300">
            →
          </span>
        </button>
        
      </div>
    </section>
  );
}