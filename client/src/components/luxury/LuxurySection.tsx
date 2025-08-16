import { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface LuxurySectionProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  dark?: boolean;
}

export const LuxurySection = ({
  children,
  className,
  fullWidth = false,
  dark = false,
}: LuxurySectionProps) => {
  return (
    <section 
      className={cn(
        "py-16 px-8",
        dark ? "bg-black text-white" : "bg-white text-black",
        fullWidth ? "w-full" : "max-w-7xl mx-auto",
        "font-serif", // Times New Roman
        className
      )}
    >
      {children}
    </section>
  );
}