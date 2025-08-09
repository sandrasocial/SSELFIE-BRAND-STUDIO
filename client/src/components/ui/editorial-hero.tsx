import React from 'react';

const EditorialHero: React.FC = () => {
  return (
    <section className="editorial-hero relative h-screen w-full bg-[#0a0a0a] text-[#fefefe]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] z-10"></div>
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <h1 className="font-serif text-6xl md:text-8xl mb-6" style={{ fontFamily: 'Times New Roman' }}>
          SSELFIE ATELIER
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Times New Roman' }}>
          Where every selfie transforms into an editorial masterpiece. Your personal luxury photo studio awaits.
        </p>
        <button className="mt-8 px-8 py-3 bg-[#fefefe] text-[#0a0a0a] text-lg transition-all hover:bg-[#f5f5f5]" style={{ fontFamily: 'Times New Roman' }}>
          Begin Your Editorial Journey
        </button>
      </div>
    </section>
  );
};

export default EditorialHero;