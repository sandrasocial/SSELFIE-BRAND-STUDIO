import React from "react";
import { cn } from "@/lib/utils";

export interface EditorialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'white' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const EditorialButton = React.forwardRef<HTMLButtonElement, EditorialButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    // Base editorial styles - always sharp corners, no fills, minimal design
    const baseClasses = [
      "uppercase",
      "cursor-pointer",
      "transition-all",
      "duration-300",
      "ease-out",
      "outline-none",
      "inline-block",
      "bg-transparent",
      "border-0",
      "border-b",
      "border-transparent",
      "disabled:opacity-50",
      "disabled:cursor-not-allowed",
      "focus:outline-none",
      "focus:ring-0",
      fullWidth ? "w-full block text-center" : ""
    ];

    const fontStyle = { fontFamily: 'Inter, system-ui, sans-serif' };

    // Size variations
    const sizeClasses = {
      'sm': ["text-[11px]", "tracking-[0.3em]", "px-4", "py-3"],
      'md': ["text-[12px]", "tracking-[0.35em]", "px-6", "py-4"],
      'lg': ["text-[13px]", "tracking-[0.4em]", "px-8", "py-5"]
    };

    // Variant styles - minimal, editorial, no fills
    const variantClasses = {
      'primary': [
        "text-[#0a0a0a]",
        "border-b-[#0a0a0a]",
        "hover:border-b-[#666]",
        "hover:text-[#666]"
      ],
      'secondary': [
        "text-[#0a0a0a]",
        "border-b-transparent",
        "hover:border-b-[#0a0a0a]"
      ],
      'tertiary': [
        "text-[#666]",
        "border-b-transparent",
        "hover:text-[#0a0a0a]",
        "hover:border-b-[#0a0a0a]"
      ],
      'white': [
        "text-white",
        "border-b-white",
        "hover:border-b-[#666]",
        "hover:text-[#f5f5f5]"
      ],
      'ghost': [
        "text-[#0a0a0a]",
        "border-b-transparent",
        "hover:text-[#666]"
      ]
    };

    return (
      <button
        ref={ref}
        className={cn(
          ...baseClasses,
          ...sizeClasses[size],
          ...variantClasses[variant],
          className
        )}
        style={fontStyle}
        {...props}
      >
        {typeof children === "string" ? children.toUpperCase() : children}
      </button>
    );
  }
);

EditorialButton.displayName = "EditorialButton";

export { EditorialButton };