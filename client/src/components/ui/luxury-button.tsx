import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from "../../lib/utils.js";
import { VariantProps, cva } from "class-variance-authority";

const luxuryButtonVariants = cva(
  "inline-flex items-center justify-center font-serif font-light tracking-wide uppercase transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: [
          "bg-neutral-900 text-neutral-50 border border-neutral-900",
          "hover:bg-neutral-800 hover:border-neutral-800 hover:shadow-luxury hover:scale-105 hover:-translate-y-0.5",
          "active:scale-95 active:translate-y-0"
        ],
        secondary: [
          "bg-transparent text-neutral-900 border border-neutral-900",
          "hover:bg-neutral-900 hover:text-neutral-50 hover:shadow-luxury hover:scale-105 hover:-translate-y-0.5",
          "active:scale-95 active:translate-y-0"
        ],
        ghost: [
          "bg-transparent text-neutral-700 border-transparent",
          "hover:bg-neutral-100 hover:text-neutral-900 hover:scale-105",
          "active:scale-95"
        ],
        luxury: [
          "bg-gradient-to-r from-neutral-900 to-neutral-800 text-neutral-50 border border-neutral-700",
          "hover:from-neutral-800 hover:to-neutral-700 hover:shadow-luxury-lg hover:scale-[1.02] hover:-translate-y-1",
          "active:scale-95 active:translate-y-0",
          "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        ],
        premium: [
          "bg-neutral-50 text-neutral-900 border border-neutral-200 shadow-luxury",
          "hover:bg-white hover:shadow-luxury-lg hover:scale-105 hover:-translate-y-0.5",
          "active:scale-95 active:translate-y-0",
          "relative after:absolute after:inset-0 after:rounded-inherit after:bg-gradient-to-r after:from-transparent after:via-neutral-200/20 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300"
        ]
      },
      size: {
        sm: "px-luxury-xs py-2 text-sm min-h-[48px] tracking-widest",
        md: "px-luxury-sm py-3 text-base min-h-[56px] tracking-wide",
        lg: "px-luxury-md py-4 text-lg min-h-[64px] tracking-wide",
        xl: "px-luxury-lg py-5 text-xl min-h-[72px] tracking-extra-wide"
      },
      spacing: {
        tight: "letter-spacing: 0.1em",
        normal: "letter-spacing: 0.2em",
        wide: "letter-spacing: 0.3em",
        extraWide: "letter-spacing: 0.4em"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      spacing: "normal"
    }
  }
);

interface LuxuryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof luxuryButtonVariants> {
  loading?: boolean;
  loadingText?: string;
  shimmer?: boolean;
}

const LuxuryButton = forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    spacing, 
    loading = false, 
    loadingText = "Loading...", 
    shimmer = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(luxuryButtonVariants({ variant, size, spacing, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-luxury-spin border-2 border-current border-t-transparent rounded-full" />
        )}
        
        {loading ? loadingText : children}
        
        {shimmer && !loading && (
          <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-luxury-shimmer" />
        )}
      </button>
    );
  }
);

LuxuryButton.displayName = "LuxuryButton";

export { LuxuryButton, luxuryButtonVariants };