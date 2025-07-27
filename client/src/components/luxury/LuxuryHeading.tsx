import { cn } from "@/lib/utils";

interface LuxuryHeadingProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  as?: "h1" | "h2" | "h3" | "h4";
}

export const LuxuryHeading = ({
  children,
  className,
  size = "lg",
  as: Component = "h2",
}: LuxuryHeadingProps) => {
  const sizeClasses = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl"
  };

  return (
    <Component
      className={cn(
        "font-serif tracking-tight", // Times New Roman
        "leading-tight",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Component>
  );
}