import { FC } from 'react';
import { Link, useLocation } from 'wouter';

interface Phase {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
}

interface WorkspacePhaseNavigationProps {
  phases: Phase[];
}

export const WorkspacePhaseNavigation: FC<WorkspacePhaseNavigationProps> = ({ phases }) => {
  const [location] = useLocation();

  const getPhaseNumber = (index: number) => {
    return ['01', '02', '03', '04'][index];
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="w-3 h-3 bg-black rounded-full" />;
      case 'in-progress':
        return <div className="w-3 h-3 bg-black rounded-full animate-pulse" />;
      case 'available':
        return <div className="w-3 h-3 border-2 border-black rounded-full" />;
      default:
        return <div className="w-3 h-3 border border-gray-400 rounded-full opacity-50" />;
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Editorial Brand Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-light tracking-[0.2em] uppercase text-black mb-2"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            SSELFIE STUDIO
          </h1>
          <p className="text-xs font-light tracking-[0.4em] uppercase text-gray-600">
            AI-Powered Personal Branding Platform
          </p>
        </div>

        {/* 4-Phase Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 max-w-6xl mx-auto">
          {phases.map((phase, index) => {
            const isActive = location === phase.path;
            const isClickable = phase.status !== 'locked';
            
            const content = (
              <div className={`
                p-8 border border-gray-200 text-center cursor-pointer transition-all duration-300
                ${isActive 
                  ? 'bg-black text-white' 
                  : phase.status === 'locked'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-white text-black hover:bg-gray-50'
                }
              `}>
                {/* Phase Number */}
                <div className={`text-xs font-light tracking-[0.4em] uppercase mb-3 ${
                  isActive ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Phase {getPhaseNumber(index)}
                </div>
                
                {/* Phase Title */}
                <div 
                  className={`text-lg font-light tracking-[0.1em] uppercase mb-2 ${
                    isActive ? 'text-white' : phase.status === 'locked' ? 'text-gray-400' : 'text-black'
                  }`}
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {phase.title}
                </div>
                
                {/* Phase Subtitle */}
                <div className={`text-xs font-light tracking-[0.05em] uppercase ${
                  isActive ? 'text-white/70' : phase.status === 'locked' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {phase.subtitle}
                </div>
                
                {/* Status Indicator */}
                <div className="flex justify-center mt-4">
                  {getStatusIndicator(phase.status)}
                </div>
              </div>
            );

            return isClickable ? (
              <Link key={phase.id} href={phase.path}>
                {content}
              </Link>
            ) : (
              <div key={phase.id}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};