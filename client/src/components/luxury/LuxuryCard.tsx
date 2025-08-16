import { FC, ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface LuxuryCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "editorial" | "minimal";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  border?: boolean;
  background?: "white" | "gray" | "transparent";
}

export const LuxuryCard: FC<LuxuryCardProps> = ({
  children,
  className,
  variant = "default",
  padding = "md",
  border = true,
  background = "white",
  ...props
}) => {
  // Variant styling - pure editorial luxury
  const variantClasses = {
    default: "bg-white border border-black",
    elevated: "bg-white border border-black shadow-lg",
    editorial: "bg-gray-50 border border-black",
    minimal: "bg-transparent border-0"
  };

  // Padding scales - generous whitespace
  const paddingClasses = {
    none: "",
    sm: "p-4 md:p-6",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-12",
    xl: "p-12 md:p-16"
  };

  // Background variations
  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-gray-50", 
    transparent: "bg-transparent"
  };

  return (
    <div
      className={cn(
        // Base editorial styling
        "transition-all duration-300",
        "font-serif", // Times New Roman globally
        
        // Variant styling
        variant !== "minimal" && variantClasses[variant],
        variant === "minimal" && backgroundClasses[background],
        
        // Padding
        paddingClasses[padding],
        
        // Border override
        !border && "border-0",
        
        // Custom className
        className
      )}
      style={{ fontFamily: 'Times New Roman, serif' }}
      {...props}
    >
      {children}
    </div>
  );
};

// Editorial Card Header Component
interface LuxuryCardHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleSize?: "sm" | "md" | "lg" | "xl";
}

export const LuxuryCardHeader: FC<LuxuryCardHeaderProps> = ({
  title,
  subtitle,
  className,
  titleSize = "lg"
}) => {
  const titleSizes = {
    sm: "text-lg md:text-xl",
    md: "text-xl md:text-2xl", 
    lg: "text-2xl md:text-3xl",
    xl: "text-3xl md:text-4xl"
  };

  return (
    <header className={cn("mb-6", className)}>
      <h2 
        className={cn(
          "font-serif font-normal tracking-tight leading-tight text-black mb-2",
          titleSizes[titleSize]
        )}
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p 
          className="text-base md:text-lg text-gray-600 font-light leading-relaxed"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
};

// Editorial Card Content Component
interface LuxuryCardContentProps {
  children: ReactNode;
  className?: string;
}

export const LuxuryCardContent: FC<LuxuryCardContentProps> = ({
  children,
  className
}) => {
  return (
    <div 
      className={cn(
        "font-serif text-base md:text-lg leading-relaxed text-black",
        className
      )}
      style={{ fontFamily: 'Times New Roman, serif' }}
    >
      {children}
    </div>
  );
};

// Editorial Card Footer Component  
interface LuxuryCardFooterProps {
  children: ReactNode;
  className?: string;
}

export const LuxuryCardFooter: FC<LuxuryCardFooterProps> = ({
  children,
  className
}) => {
  return (
    <footer className={cn("mt-6 pt-4 border-t border-gray-200", className)}>
      {children}
    </footer>
  );
};