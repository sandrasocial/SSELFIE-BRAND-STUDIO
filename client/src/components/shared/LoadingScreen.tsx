import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-stone-50 via-stone-100/50 to-stone-50 flex items-center justify-center relative overflow-hidden">
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 -m-16 rounded-full border border-white/40 bg-white/20 backdrop-blur-xl animate-pulse" />
        {/* Inner ring */}
        <div className="absolute inset-0 -m-8 rounded-full border border-white/60 bg-white/30 backdrop-blur-xl" />
        {/* Brand wordmark */}
        <div className="relative z-10 px-8 py-6 rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/70 shadow-2xl shadow-stone-900/20">
          <span className="font-serif font-extralight uppercase headline-single-word text-stone-950 text-4xl sm:text-5xl leading-none">
            SSELFIE
          </span>
        </div>
      </div>
    </div>
  );
}

