import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  number: string;
  title: string;
  price: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  ctaText: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  badge?: string;
  className?: string;
}

const OfferCard: React.FC<OfferCardProps> = ({
  number,
  title,
  price,
  description,
  imageSrc,
  imageAlt,
  ctaText,
  ctaHref,
  onCtaClick,
  badge,
  className,
}) => {
  const handleClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (ctaHref) {
      window.location.href = ctaHref;
    }
  };

  return (
    <div className={cn("bg-white border border-[#e5e5e5] group transition-all duration-300 hover:shadow-lg", className)}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {badge && (
          <div className="absolute top-4 left-4 bg-[#0a0a0a] text-white px-3 py-1">
            <span className="text-[10px] tracking-[0.3em] uppercase font-inter font-light">
              {badge}
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4 w-8 h-8 border border-white flex items-center justify-center">
          <span className="text-white text-sm font-light" style={{ fontFamily: 'Times New Roman, serif' }}>
            {number}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-8">
        <h3 className="text-2xl font-light text-[#0a0a0a] mb-2 tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif' }}>
          {title}
        </h3>
        <p className="text-lg font-light text-[#0a0a0a] mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
          {price}
        </p>
        <p className="text-sm text-[#666] leading-relaxed mb-8 font-inter">
          {description}
        </p>
        
        <button
          onClick={handleClick}
          className="w-full text-center py-4 border-b border-[#0a0a0a] text-[12px] tracking-[0.35em] uppercase text-[#0a0a0a] hover:text-[#666] hover:border-[#666] transition-all duration-300 font-inter font-light"
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
};

export { OfferCard };