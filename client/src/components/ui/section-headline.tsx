import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadlineProps {
  tagline?: string
  headline: string
  className?: string
}

export const SectionHeadline: React.FC<SectionHeadlineProps> = ({
  tagline,
  headline,
  className
}) => {
  return (
    <div className={cn("text-center", className)}>
      {tagline && (
        <p className="text-[11px] tracking-[0.4em] uppercase text-[#666666] mb-8 font-inter font-light">
          {tagline}
        </p>
      )}
      
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-[#0a0a0a] tracking-[-0.01em] mb-8" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
        {headline}
      </h2>
    </div>
  )
}