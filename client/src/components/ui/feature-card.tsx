import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  imageSrc,
  imageAlt,
  className,
}) => (
  <div className={cn("bg-white border border-[#e5e5e5] p-8", className)}>
    {imageSrc && (
      <div className="w-full h-48 mb-6 relative overflow-hidden">
        <img 
          src={imageSrc} 
          alt={imageAlt || title} 
          className="w-full h-full object-cover" 
        />
      </div>
    )}
    <h3 className="font-serif text-2xl font-light text-[#0a0a0a] mb-4 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
      {title}
    </h3>
    <p className="font-inter text-base text-[#666666] leading-relaxed">
      {description}
    </p>
  </div>
);

export { FeatureCard };