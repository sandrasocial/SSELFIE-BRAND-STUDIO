import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-white/50 backdrop-blur-2xl border border-white/70 p-5 rounded-[1.5rem] max-w-[90%] shadow-xl shadow-stone-900/10">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-stone-600"></div>
            <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-stone-600" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-stone-600" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-stone-800">Maya is creating your photos...</span>
            <div className="text-xs text-stone-600 mt-1">Using your personal AI model • This takes 30-60 seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

