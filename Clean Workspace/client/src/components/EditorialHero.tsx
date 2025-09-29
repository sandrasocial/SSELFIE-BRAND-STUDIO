import { FC } from 'react';
export const EditorialHero: FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center bg-black text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <h1 className="font-times-new-roman text-6xl md:text-7xl lg:text-8xl tracking-tighter mb-8">
          SSELFIE Studio
        </h1>
        <p className="text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto">
          Where creativity meets editorial sophistication
        </p>
      </div>
    </section>
  );
};