import React from 'react';
import { Link, useLocation } from 'wouter';

interface PhaseNavigationProps {
  currentPhase: 'train' | 'style' | 'photoshoot' | 'build';
  phases: Array<{
    id: string;
    title: string;
    status: 'complete' | 'current' | 'ready' | 'locked';
    link: string;
  }>;
}

export function ElenaPhaseNavigation({ currentPhase, phases }: PhaseNavigationProps) {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Phase Progress Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-2xl font-light tracking-[0.2em] uppercase text-black mb-2"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Your Creative Journey
          </h2>
          <p className="text-sm text-gray-600 tracking-[0.1em] uppercase">
            4-Phase Brand Building System
          </p>
        </div>

        {/* Phase Navigation */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-8">
            {phases.map((phase, index) => {
              const isActive = location.includes(phase.link);
              const isComplete = phase.status === 'complete';
              const isLocked = phase.status === 'locked';

              return (
                <div key={phase.id} className="flex items-center">
                  <Link href={isLocked ? '#' : phase.link}>
                    <div className={`
                      px-6 py-3 border transition-all duration-300 cursor-pointer
                      ${isActive 
                        ? 'border-black bg-black text-white' 
                        : isComplete 
                        ? 'border-black text-black hover:bg-gray-50'
                        : isLocked
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                      }
                    `}>
                      <div 
                        className="text-xs tracking-[0.3em] uppercase"
                        style={{ fontFamily: 'Times New Roman, serif' }}
                      >
                        {phase.title}
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        Phase {index + 1}
                      </div>
                    </div>
                  </Link>
                  
                  {index < phases.length - 1 && (
                    <div className="mx-4 text-gray-300">→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}