import React from 'react';
import { EditorialImage } from './sandra-image-library';

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  onCtaClick?: () => void;
  isPopular?: boolean;
  badge?: string;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  description,
  imageUrl,
  ctaText,
  onCtaClick,
  isPopular = false,
  badge,
  className = ""
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick();
    }
  };

  return (
    <div className={`relative bg-white p-8 border ${isPopular ? 'border-2 border-[var(--luxury-black)]' : 'border-[var(--accent-line)]'} ${className}`}>
      {badge && (
        <div className="absolute -top-4 left-8">
          <span className="bg-[var(--luxury-black)] text-white px-4 py-2 eyebrow-text system-text">
            {badge}
          </span>
        </div>
      )}
      
      <div className={`mb-8 ${badge ? 'pt-4' : ''}`}>
        <p className="eyebrow-text text-[var(--soft-gray)] mb-4 system-text">
          {title}
        </p>
        <h3 className="editorial-headline text-3xl font-light text-[var(--luxury-black)] mb-4">
          {title}
        </h3>
        <p className="text-4xl font-light text-[var(--luxury-black)] mb-6 system-text">
          {price}
        </p>
        <p className="text-sm text-[var(--soft-gray)] system-text font-light">
          {period}
        </p>
      </div>
      
      <div className="aspect-square mb-8 overflow-hidden">
        <img 
          src={imageUrl}
          alt={`${title} preview`}
          className="w-full h-full object-cover editorial-hover"
        />
      </div>
      
      <p className="text-[var(--soft-gray)] mb-8 system-text font-light leading-relaxed">
        {description}
      </p>
      
      <button 
        onClick={handleClick}
        className={`luxury-button w-full text-center ${
          isPopular 
            ? 'text-[var(--luxury-black)] border-[var(--luxury-black)] hover:border-[var(--luxury-black)]/60' 
            : 'text-[var(--luxury-black)] border-[var(--accent-line)] hover:border-[var(--luxury-black)]'
        } system-text block`}
      >
        {ctaText}
      </button>
    </div>
  );
};
