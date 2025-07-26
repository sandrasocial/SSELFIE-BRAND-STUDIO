import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { forwardRef } from "react"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "font-serif text-4xl md:text-5xl lg:text-6xl tracking-tighter font-normal text-neutral-900 dark:text-neutral-50",
      h2: "font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight font-normal text-neutral-900 dark:text-neutral-50", 
      h3: "font-serif text-2xl md:text-3xl lg:text-4xl tracking-tight font-normal text-neutral-900 dark:text-neutral-50",
      h4: "font-serif text-xl md:text-2xl lg:text-3xl tracking-tight font-normal text-neutral-900 dark:text-neutral-50",
      p: "font-serif text-base md:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300",
      lead: "font-serif text-xl md:text-2xl leading-relaxed text-neutral-700 dark:text-neutral-300",
      large: "font-serif text-lg md:text-xl leading-relaxed text-neutral-700 dark:text-neutral-300",
      small: "font-serif text-sm leading-normal text-neutral-600 dark:text-neutral-400",
      muted: "font-serif text-sm leading-normal text-neutral-500 dark:text-neutral-400",
      editorial: "font-serif text-lg md:text-xl italic leading-relaxed text-neutral-800 dark:text-neutral-200",
    }
  },
  defaultVariants: {
    variant: "p"
  }
})

interface TypographyProps
  extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement>,
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