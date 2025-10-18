import React from 'react';

const MayaHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between pt-3 sm:pt-4 pb-2">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-2 border-stone-200/60 overflow-hidden flex-shrink-0">
          <img
            src="https://i.postimg.cc/fTtCnzZv/out-1-22.png"
            alt="Maya"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-extralight tracking-[0.25em] text-stone-950 uppercase">Maya</h3>
          <p className="text-[10px] sm:text-xs tracking-[0.15em] uppercase font-light text-stone-500">Your Photo Stylist</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 ml-3 sm:ml-4 flex-shrink-0">
        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-stone-900 rounded-full"></div>
        <span className="text-[10px] sm:text-xs font-light text-stone-600">Online</span>
      </div>
    </div>
  );
};

export default MayaHeader;

