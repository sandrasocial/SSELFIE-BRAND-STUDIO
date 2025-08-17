import { FC, MouseEvent } from 'react';
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

export const PricingCard: FC<PricingCardProps> = ({
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
  const handleClick = (e: MouseEvent) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick();
    }
  };

  return (
    <div className={`relative bg-white card-padding-responsive border ${isPopular ? 'border-2 border-[var(--luxury-black)]' : 'border-[var(--accent-line)]'} ${className}`}>
      {badge && (
        <div className="absolute -top-3 sm:-top-4 left-4 sm:left-8">
          <span className="bg-[var(--luxury-black)] text-white px-3 py-2 sm:px-4 eyebrow-responsive">
            {badge}
          </span>
        </div>
      )}
      
      <div className={`mb-6 lg:mb-8 ${badge ? 'pt-3 sm:pt-4' : ''}`}>
        <p className="eyebrow-responsive text-[var(--soft-gray)] mb-3 lg:mb-4">
          {title}
        </p>
        <h3 className="editorial-subhead-responsive text-[var(--luxury-black)] mb-3 lg:mb-4">
          {title}
        </h3>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-[var(--luxury-black)] mb-4 lg:mb-6">
          {price}
        </p>
        <p className="body-text-responsive text-[var(--soft-gray)] font-light">
          {period}
        </p>
      </div>
      
      <div className="aspect-editorial-responsive mb-6 lg:mb-8 overflow-hidden">
        <img 
          src={imageUrl}
          alt={`${title} preview`}
          className="w-full h-full object-cover editorial-hover"
        />
      </div>
      
      <p className="body-text-responsive text-[var(--soft-gray)] mb-6 lg:mb-8 font-light leading-relaxed">
        {description}
      </p>
      
      <button 
        onClick={handleClick}
        className={`cta-button-responsive w-full text-center border ${
          isPopular 
            ? 'text-[var(--luxury-black)] border-[var(--luxury-black)] hover:border-[var(--luxury-black)]/60' 
            : 'text-[var(--luxury-black)] border-[var(--accent-line)] hover:border-[var(--luxury-black)]'
        } bg-transparent block`}
      >
        {ctaText}
      </button>
    </div>
  );
};
