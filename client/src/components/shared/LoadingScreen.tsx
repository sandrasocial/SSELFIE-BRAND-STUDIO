import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-stone-50 via-stone-100/50 to-stone-50 flex items-center justify-center relative overflow-hidden">
      <div className="relative z-10 text-center px-6 sm:px-8">
        {/* Rings and Logo Container */}
        <div className="mb-12 sm:mb-16 relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
          {/* Outer Spinning Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-transparent border-t-stone-950 animate-spin"
              style={{ animationDuration: '2s' }}
            />
          </div>

          {/* Inner Spinning Ring (Reverse Direction) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-transparent border-b-stone-400 animate-spin"
              style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
            />
          </div>

          {/* Logo Container (Center) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-stone-900/20 p-2.5 sm:p-3">
              <img
                src="https://i.postimg.cc/65NtYqMK/Black-transperent-logo.png"
                alt="SSELFIE Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-stone-950 text-4xl sm:text-5xl md:text-6xl font-serif font-extralight tracking-[0.5em] leading-none mb-2">
            SSELFIE
          </h1>

          {/* Bouncing Dots */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <div className="w-1 h-1 bg-stone-950 rounded-full animate-bounce" />
            <div
              className="w-1 h-1 bg-stone-950 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="w-1 h-1 bg-stone-950 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
          </div>

          {/* Subtitle */}
          <p className="text-[10px] sm:text-xs font-light tracking-[0.35em] uppercase text-stone-500 mt-3 sm:mt-4">
            Luxury AI Photography
          </p>
        </div>
      </div>
    </div>
  );
}

