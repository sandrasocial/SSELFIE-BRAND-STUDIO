// @/components/admin/AdminHeroSection.tsx
import React from 'react';

interface AdminHeroSectionProps {
  userName?: string;
}

export const AdminHeroSection: React.FC<AdminHeroSectionProps> = ({ userName = "Sandra" }) => {
  return (
    <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Full-bleed background with luxury pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Luxury gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

      {/* Editorial content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          {/* Editorial headline */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight tracking-tight mb-6">
            Welcome back,
            <br />
            <span className="italic font-medium bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>

          {/* Editorial subtitle */}
          <p className="font-serif text-xl md:text-2xl text-gray-300 font-light leading-relaxed mb-8 max-w-2xl">
            Your empire of AI agents awaits. Every decision shapes the future of SSELFIE Studio.
          </p>

          {/* Luxury stats bar */}
          <div className="flex flex-wrap gap-8 text-white/80">
            <div className="flex flex-col">
              <span className="font-serif text-3xl font-light">13</span>
              <span className="font-sans text-sm uppercase tracking-widest opacity-70">Active Agents</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-3xl font-light">∞</span>
              <span className="font-sans text-sm uppercase tracking-widest opacity-70">Possibilities</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-3xl font-light">24/7</span>
              <span className="font-sans text-sm uppercase tracking-widest opacity-70">AI Power</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent opacity-10"></div>
    </div>
  );
};