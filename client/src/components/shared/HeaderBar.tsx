import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface HeaderBarProps extends React.HTMLAttributes<HTMLDivElement> {
  credits?: number | string;
  userType?: 'member' | 'pro';
  onToggleUserType?: () => void;
}

export default function HeaderBar({
  className,
  credits = 0,
  userType = 'member',
  onToggleUserType,
  ...rest
}: HeaderBarProps) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={cn(
        'flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-gradient-to-b from-white/40 to-transparent backdrop-blur-xl border-b border-white/20',
        className,
      )}
      {...rest}
    >
      {/* Left: time */}
      <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/80 backdrop-blur-xl rounded-full">
        <div className="text-white font-medium tracking-wide text-xs sm:text-sm">
          {time}
        </div>
      </div>

      {/* Center: user type toggle */}
      <button
        type="button"
        onClick={onToggleUserType}
        className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs tracking-wide font-medium bg-white/60 hover:bg-white/80 backdrop-blur-xl rounded-full transition-all duration-300 border border-white/40 shadow-lg shadow-stone-900/10"
      >
        {userType === 'pro' ? 'Pro User' : 'Member'}
      </button>

      {/* Right: credits */}
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 backdrop-blur-xl rounded-full border border-white/40">
        <div className="flex space-x-0.5 sm:space-x-1">
          <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-stone-900 rounded-full"></div>
          <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-stone-900 rounded-full"></div>
          <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-stone-900 rounded-full"></div>
          <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-stone-400 rounded-full"></div>
        </div>
        <div className="w-4 sm:w-5 h-4 sm:h-5 bg-stone-900 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold">
          {credits}
        </div>
      </div>
    </div>
  );
}

