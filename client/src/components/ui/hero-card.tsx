import { FC } from "react";
import { cn } from "@/lib/utils";

export interface HeroCardProps {
  imageSrc: string;
  imageAlt: string;
  meta?: string;
  title: string;
  description?: string;
  className?: string;
}

export function HeroCard({
  imageSrc,
  imageAlt,
  meta,
  title,
  description,
  className,
}: HeroCardProps) {
  return (
    <div className={cn("bg-white", className)}>
      {/* Editorial image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden mb-6">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Content */}
      <div className="p-6">
        {meta && (
          <div className="text-[11px] uppercase tracking-[0.4em] text-[#666] mb-3">{meta}</div>
        )}
        <h3 className="font-['Times_New_Roman',serif] text-2xl font-light text-[#0a0a0a] mb-4 tracking-tight">{title}</h3>
        {description && (
          <p className="text-base text-[#666] leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}