import React from 'react';
import { Link } from 'wouter';

interface LuxuryPhaseCardProps {
  phase: {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    status: 'complete' | 'progress' | 'ready' | 'locked';
    statusMessage: string;
  };
  index: number;
}

export function LuxuryPhaseCard({ phase, index }: LuxuryPhaseCardProps) {
  return (
    <div className="group">
      <Link href={phase.link} className={phase.status === 'locked' ? 'pointer-events-none' : ''}>
        <div className="relative mb-8 overflow-hidden bg-gray-50" style={{ aspectRatio: '4/5' }}>
          <img 
            src={phase.image}
            alt={phase.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-black/30"></div>
          
          <div className="absolute top-4 left-4">
            <div className={`px-2 py-1 text-xs font-light flex items-center gap-2 ${
              phase.status === 'complete' ? 'bg-black/80 text-white' :
              phase.status === 'progress' ? 'bg-black/80 text-white' :
              phase.status === 'ready' ? 'bg-white/90 text-black' :
              'bg-white/70 text-gray-600'
            }`}>
              {phase.status === 'progress' && (
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
              )}
              {phase.statusMessage}
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="font-serif text-3xl md:text-4xl font-light tracking-[0.4em] uppercase">
                {index === 0 ? 'T R A I N' : index === 1 ? 'S T Y L E' : index === 2 ? 'P H O T O S H O O T' : 'B U I L D'}
              </div>
              <div className="text-xs tracking-[0.2em] uppercase opacity-80 mt-2">
                Step {index + 1}
              </div>
            </div>
          </div>
          
          {phase.status === 'locked' && (
            <div className="absolute inset-0 bg-black/50"></div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-light leading-tight text-black">
            {phase.title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed font-light">
            {phase.description}
          </p>
        </div>
      </Link>
    </div>
  );
}