import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from "../../lib/utils.js"
import { VariantProps, cva } from "class-variance-authority"

const typographyVariants = cva("", {
  variants: {
    variant: {
      // Enhanced luxury hierarchy with Times New Roman
      h1: "font-serif text-5xl md:text-6xl lg:text-7xl tracking-[-0.02em] font-extralight text-neutral-900 dark:text-neutral-50 leading-[1.1]",
      h2: "font-serif text-4xl md:text-5xl lg:text-6xl tracking-[-0.015em] font-extralight text-neutral-900 dark:text-neutral-50 leading-[1.15]", 
      h3: "font-serif text-3xl md:text-4xl lg:text-5xl tracking-[-0.01em] font-light text-neutral-900 dark:text-neutral-50 leading-[1.2]",
      h4: "font-serif text-2xl md:text-3xl lg:text-4xl tracking-[-0.005em] font-light text-neutral-900 dark:text-neutral-50 leading-[1.25]",
      
      // Enhanced body text for luxury perception
      p: "font-serif text-base md:text-lg leading-[1.75] font-light text-neutral-700 dark:text-neutral-300",
      lead: "font-serif text-xl md:text-2xl leading-[1.65] font-light text-neutral-700 dark:text-neutral-300",
      large: "font-serif text-lg md:text-xl leading-[1.7] font-light text-neutral-700 dark:text-neutral-300",
      small: "font-serif text-sm leading-[1.6] font-light text-neutral-600 dark:text-neutral-400",
      muted: "font-serif text-sm leading-[1.6] font-light text-neutral-500 dark:text-neutral-400",
      
      // Luxury-specific variants
      editorial: "font-serif text-lg md:text-xl italic leading-[1.8] font-light text-neutral-800 dark:text-neutral-200",
      display: "font-serif text-6xl md:text-7xl lg:text-8xl tracking-[-0.025em] font-extralight text-neutral-900 dark:text-neutral-50 leading-[1.05]",
      quote: "font-serif text-2xl md:text-3xl italic leading-[1.4] font-light text-neutral-800 dark:text-neutral-200",
      caption: "font-serif text-sm leading-[1.5] text-neutral-500 dark:text-neutral-400 italic font-light",
      
      // New luxury display variants
      "luxury-display": "font-serif text-7xl md:text-8xl lg:text-9xl tracking-[0.4em] font-extralight text-neutral-900 dark:text-neutral-50 leading-[0.85] uppercase",
      "luxury-title": "font-serif text-3xl md:text-4xl lg:text-5xl tracking-[0.3em] font-extralight text-neutral-900 dark:text-neutral-50 leading-[1.1] uppercase",
      "luxury-subtitle": "font-serif text-xl md:text-2xl tracking-[0.2em] font-light text-neutral-700 dark:text-neutral-300 leading-[1.3]",
      "luxury-body": "font-serif text-lg md:text-xl leading-[1.65] font-light text-neutral-700 dark:text-neutral-300",
      "luxury-eyebrow": "font-serif text-xs tracking-[0.5em] font-light text-neutral-500 dark:text-neutral-400 uppercase leading-[1.4]",
    }
  },
  defaultVariants: {
    variant: "p"
  }
})

interface TypographyProps
  extends HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement>,
    VariantProps<typeof typographyVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span"
}

const Typography = forwardRef<HTMLHeadingElement | HTMLParagraphElement, TypographyProps>(
  ({ className, variant, as = "p", ...props }, ref) => {
    const Comp = as
    return (
      <Comp
        className={cn(typographyVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Typography.displayName = "Typography"

export { Typography, typographyVariants }