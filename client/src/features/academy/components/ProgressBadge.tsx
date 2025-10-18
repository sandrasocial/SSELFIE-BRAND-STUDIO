import React from 'react';

export default function ProgressBadge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="text-[10px] px-2 py-1 rounded-full bg-stone-900 text-white">
      {pct}%
    </div>
  );
}

