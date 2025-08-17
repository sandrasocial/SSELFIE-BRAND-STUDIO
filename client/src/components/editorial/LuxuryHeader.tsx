import React from 'react';

interface LuxuryHeaderProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
}

export const LuxuryHeader: React.FC<LuxuryHeaderProps> = ({
  title,
  subtitle,
  alignment = 'left'
}) => {
  return (
    <header className={`mb-12 ${alignment === 'center' ? 'text-center' : ''}`}>
      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-zinc-900 tracking-tight leading-none mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="font-serif text-lg md:text-xl text-zinc-600 italic leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="w-16 h-0.5 bg-zinc-900 mt-6 mb-8" 
           style={{marginLeft: alignment === 'center' ? 'auto' : '0', marginRight: alignment === 'center' ? 'auto' : '0'}} />
    </header>
  );
}