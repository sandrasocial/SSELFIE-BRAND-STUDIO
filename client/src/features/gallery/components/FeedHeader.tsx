import React from 'react';

export default function FeedHeader() {
  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-stone-200/70 rounded-3xl p-6 sm:p-8 flex items-center justify-between">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="w-16 h-16 rounded-full bg-stone-200 border border-stone-300 overflow-hidden" />
        <div>
          <div className="text-stone-950 text-xl font-serif font-extralight tracking-[0.25em] uppercase">@your.brand</div>
          <div className="text-stone-600 text-xs tracking-[0.15em] uppercase font-light">Creative Director • Luxury Branding</div>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-6">
        <div className="text-center">
          <div className="text-stone-950 text-sm font-medium">1,274</div>
          <div className="text-stone-500 text-[10px] tracking-[0.2em] uppercase">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-stone-950 text-sm font-medium">22.4k</div>
          <div className="text-stone-500 text-[10px] tracking-[0.2em] uppercase">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-stone-950 text-sm font-medium">341</div>
          <div className="text-stone-500 text-[10px] tracking-[0.2em] uppercase">Following</div>
        </div>
      </div>
    </div>
  );
}

