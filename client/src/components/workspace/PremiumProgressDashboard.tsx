import React from 'react';

interface ProgressMetrics {
  aiModelStatus: 'none' | 'training' | 'completed';
  photosGenerated: number;
  stylingSessionsCompleted: number;
  websitesBuilt: number;
  overallProgress: number;
}

interface PremiumProgressDashboardProps {
  metrics: ProgressMetrics;
  isPremium: boolean;
  userName?: string;
}

export function PremiumProgressDashboard({ 
  metrics, 
  isPremium, 
  userName = 'Creator' 
}: PremiumProgressDashboardProps) {
  
  const getProgressPhase = () => {
    if (metrics.overallProgress >= 100) return 'Empire Built';
    if (metrics.overallProgress >= 75) return 'Brand Building';
    if (metrics.overallProgress >= 50) return 'Content Creation';
    if (metrics.overallProgress >= 25) return 'AI Training';
    return 'Getting Started';
  };

  return (
    <div className="bg-white border border-gray-200 p-8 mb-8">
      {/* Dashboard Header */}
      <div className="text-center mb-8">
        <h2 
          className="text-3xl font-light tracking-[0.1em] text-black mb-2"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          {userName}'s Creative Dashboard
        </h2>
        <p className="text-sm text-gray-600 tracking-[0.2em] uppercase">
          {getProgressPhase()} • {metrics.overallProgress}% Complete
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-black h-1 transition-all duration-1000"
            style={{ width: `${metrics.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* AI Model Status */}
        <div className="text-center">
          <div 
            className="text-2xl font-light text-black mb-2"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {metrics.aiModelStatus === 'completed' ? '✓' : 
             metrics.aiModelStatus === 'training' ? '⏳' : '○'}
          </div>
          <div className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-1">
            AI Model
          </div>
          <div className="text-sm text-black">
            {metrics.aiModelStatus === 'completed' ? 'Ready' :
             metrics.aiModelStatus === 'training' ? 'Training' : 'Pending'}
          </div>
        </div>

        {/* Photos Generated */}
        <div className="text-center">
          <div 
            className="text-2xl font-light text-black mb-2"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {metrics.photosGenerated}
          </div>
          <div className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-1">
            Photos
          </div>
          <div className="text-sm text-black">
            Generated
          </div>
        </div>

        {/* Styling Sessions */}
        <div className="text-center">
          <div 
            className="text-2xl font-light text-black mb-2"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {metrics.stylingSessionsCompleted}
          </div>
          <div className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-1">
            Maya Sessions
          </div>
          <div className="text-sm text-black">
            Completed
          </div>
        </div>

        {/* Websites Built */}
        <div className="text-center">
          <div 
            className="text-2xl font-light text-black mb-2"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {metrics.websitesBuilt}
          </div>
          <div className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-1">
            Websites
          </div>
          <div className="text-sm text-black">
            Built
          </div>
        </div>

      </div>

      {/* Premium Features Indicator */}
      {isPremium && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-black text-white text-xs tracking-[0.2em] uppercase">
            ✦ Studio Member ✦
          </div>
        </div>
      )}
    </div>
  );
}