import React from 'react';

interface ProgressItem {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
}

interface PremiumProgressDashboardProps {
  items: ProgressItem[];
}

export function PremiumProgressDashboard({ items }: PremiumProgressDashboardProps) {
  const completedCount = items.filter(item => item.completed).length;
  const totalProgress = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white p-8 border border-gray-200 mb-8">
      <div className="text-center mb-6">
        <h3 className="font-serif text-2xl font-light mb-2">Your Progress</h3>
        <div className="text-4xl font-light text-black">{totalProgress}%</div>
        <div className="text-sm text-gray-600">{completedCount} of {items.length} completed</div>
      </div>
      
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-black transition-all duration-500"
          style={{ width: `${totalProgress}%` }}
        />
      </div>
    </div>
  );
}