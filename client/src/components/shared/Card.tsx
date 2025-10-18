import React from 'react';
import { cn } from '../../lib/utils';
import { UI } from '../../styles/ui';

export type CardVariant = 'glass' | 'soft';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

const paddingMap: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4 sm:p-5',
  md: 'p-6 sm:p-8',
  lg: 'p-8 sm:p-10',
};

export function Card({
  className,
  children,
  variant = 'glass',
  padding = 'md',
  interactive = false,
  ...rest
}: CardProps) {
  const shell = variant === 'glass' ? UI.cards.glass : UI.cards.soft;
  return (
    <div
      className={cn(
        shell,
        UI.radii.xl,
        UI.effects.shadowSoft,
        interactive && UI.effects.scaleOnHover,
        paddingMap[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* Compact KPI tile used in Studio (exported here to keep total component files minimal) */
interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatTile({ label, value, hint, className }: StatTileProps) {
  return (
    <div className={cn('rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl p-4 sm:p-5', className)}>
      <div className="text-[10px] tracking-[0.15em] uppercase font-light text-stone-500 mb-2">{label}</div>
      <div className="text-2xl sm:text-3xl font-serif font-extralight text-stone-950 leading-none">{value}</div>
      {hint && (
        <div className="mt-1 text-xs text-stone-500">{hint}</div>
      )}
    </div>
  );
}

export default Card;

