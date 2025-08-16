import { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface LuxuryTextProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "base" | "lg";
  as?: "p" | "span";
}

export const LuxuryText = ({
  children,
  className,
  size = "base",
  as: Component = "p",
}: LuxuryTextProps) => {
  const sizeClasses = {
    sm: "text-sm md:text-base",
    base: "text-base md:text-lg",
    lg: "text-lg md:text-xl"
  };

  return (
    <Component
      className={cn(
        "font-serif", // Times New Roman
        "leading-relaxed",
        "text-neutral-800",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Component>
  );
}