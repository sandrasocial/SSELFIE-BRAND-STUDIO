import React from 'react';
import { cn } from '../../lib/utils';
import { UI } from '../../styles/ui';

interface CTACardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  buttonText: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function CTACard({
  className,
  title,
  description,
  buttonText,
  onAction,
  icon,
  ...rest
}: CTACardProps) {
  return (
    <div
      className={cn(UI.cards.glassStrong, UI.radii.xl, UI.effects.shadowSoft, 'p-6 sm:p-8 flex items-start gap-4', className)}
      {...rest}
    >
      {icon && (
        <div className="w-12 h-12 rounded-[1rem] bg-white/60 backdrop-blur-xl border border-white/70 flex items-center justify-center text-stone-700">
          {icon}
        </div>
      )}

      <div className="flex-1">
        <div className="font-serif font-extralight uppercase tracking-[0.2em] text-stone-950 leading-none text-2xl mb-2">
          {title}
        </div>
        {description && (
          <div className="text-stone-600 text-sm mb-4">{description}</div>
        )}

        <button
          type="button"
          onClick={onAction}
          className={cn(
            UI.buttons.primary,
            UI.buttons.roundedXl,
            'px-6 py-3 text-xs uppercase tracking-[0.15em]'
          )}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

