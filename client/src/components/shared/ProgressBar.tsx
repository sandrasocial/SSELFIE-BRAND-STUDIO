import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0..100
  label?: string;
}

export function ProgressBar({ value, label, className, ...rest }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className={cn('w-full', className)} {...rest}>
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm text-stone-700">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="w-full h-3 rounded-full bg-white/70 overflow-hidden border border-white/60">
        <div
          className="h-3 rounded-full bg-stone-900 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

