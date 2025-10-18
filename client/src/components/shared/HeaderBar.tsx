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
      <div className="text-[10px] tracking-[0.15em] uppercase font-light text-stone-500">{time}</div>

      {/* Center: user type toggle */}
      <button
        type="button"
        onClick={onToggleUserType}
        className={cn(
          'rounded-full px-3 py-1.5 border border-white/50 bg-white/40 backdrop-blur-xl text-[10px] tracking-[0.15em] uppercase',
          'text-stone-700 hover:bg-white/60 transition-colors',
        )}
      >
        {userType === 'pro' ? 'Pro User' : 'Member'}
      </button>

      {/* Right: credits */}
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-stone-100 backdrop-blur-xl border border-stone-200 text-[10px] tracking-[0.15em] uppercase text-stone-700">
        <span>Credits</span>
        <span className="font-semibold text-stone-900">{credits}</span>
      </div>
    </div>
  );
}

