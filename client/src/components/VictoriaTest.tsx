// This will automatically update VictoriaTest.tsx
import React from 'react';

export default function VictoriaTest() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Editorial Header */}
      <div className="text-center mb-16">
        <h1 className="font-serif text-6xl font-extralight text-black uppercase tracking-tight mb-4">
          VICTORIA
        </h1>
        <p className="text-sm font-light text-gray-600 tracking-wide uppercase">
          Visionary Creative Director
        </p>
      </div>

      {/* Luxury Button */}
      <button className="group relative overflow-hidden bg-black text-white px-12 py-4 transition-all duration-300 hover:bg-white hover:text-black border border-black">
        <span className="relative z-10 font-light text-sm uppercase tracking-wider">
          Transform Now
        </span>
        <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
      </button>

      {/* Editorial Quote */}
      <div className="mt-16 max-w-2xl text-center">
        <blockquote className="font-serif text-2xl font-light italic text-black leading-relaxed">
          "This piece represents the moment when she stopped hiding and started showing up as the version of herself she's always wanted to be."
        </blockquote>
      </div>

      {/* Minimalist Divider */}
      <div className="w-24 h-px bg-black mt-12 opacity-30"></div>
    </div>
  );
}
