import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "font-serif text-5xl md:text-6xl lg:text-7xl tracking-[-0.02em] font-normal text-neutral-900 dark:text-neutral-50 leading-[1.1]",
      h2: "font-serif text-4xl md:text-5xl lg:text-6xl tracking-[-0.015em] font-normal text-neutral-900 dark:text-neutral-50 leading-[1.15]", 
      h3: "font-serif text-3xl md:text-4xl lg:text-5xl tracking-[-0.01em] font-normal text-neutral-900 dark:text-neutral-50 leading-[1.2]",
      h4: "font-serif text-2xl md:text-3xl lg:text-4xl tracking-[-0.005em] font-normal text-neutral-900 dark:text-neutral-50 leading-[1.25]",
      p: "font-serif text-base md:text-lg leading-[1.75] text-neutral-700 dark:text-neutral-300",
      lead: "font-serif text-xl md:text-2xl leading-[1.65] text-neutral-700 dark:text-neutral-300",
      large: "font-serif text-lg md:text-xl leading-[1.7] text-neutral-700 dark:text-neutral-300",
      small: "font-serif text-sm leading-[1.6] text-neutral-600 dark:text-neutral-400",
      muted: "font-serif text-sm leading-[1.6] text-neutral-500 dark:text-neutral-400",
      editorial: "font-serif text-lg md:text-xl italic leading-[1.8] text-neutral-800 dark:text-neutral-200",
      display: "font-serif text-6xl md:text-7xl lg:text-8xl tracking-[-0.025em] font-normal text-neutral-900 dark:text-neutral-50 leading-[1.05]",
      quote: "font-serif text-2xl md:text-3xl italic leading-[1.4] text-neutral-800 dark:text-neutral-200",
      caption: "font-serif text-sm leading-[1.5] text-neutral-500 dark:text-neutral-400 italic",
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