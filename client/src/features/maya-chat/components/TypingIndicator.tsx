import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-white/50 backdrop-blur-xl border border-white/70 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] max-w-[85%] shadow-lg shadow-stone-900/5 sm:shadow-xl sm:shadow-stone-900/10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-bounce bg-stone-700"></div>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-bounce bg-stone-700" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-bounce bg-stone-700" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-sm font-light text-stone-600">Maya is creating your photos...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

