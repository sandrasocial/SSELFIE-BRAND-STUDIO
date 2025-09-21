import React, { useState, useEffect } from 'react';
import { Camera, Play, Grid, Plus, Search, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function LuxuryStudioScreen({ user }: { user?: any }) {
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real user data and recent activity
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: !!user,
    retry: false,
    staleTime: 30 * 1000
  });

  const { data: recentImages } = useQuery({
    queryKey: ['/api/user-images/recent'],
    enabled: !!user,
    retry: false,
    staleTime: 60 * 1000
  });

  useEffect(() => {
    // Simulate loading real data
    setTimeout(() => {
      if (recentImages?.length > 0) {
        setRecentActivity([
          { action: 'Photo session completed', time: '2h ago', status: 'Processed' },
          { action: 'Gallery updated', time: '1d ago', status: 'Published' },
          { action: 'Profile enhanced', time: '3d ago', status: 'Archived' },
        ]);
      } else {
        setRecentActivity([
          { action: 'Welcome to SSELFIE Studio', time: 'Just now', status: 'Ready' },
          { action: 'Training model prepared', time: '5min ago', status: 'Active' },
        ]);
      }
      setIsLoading(false);
    }, 1000);
  }, [recentImages]);

  if (isLoading) {
    return (
      <div className="luxury-loading-container">
        <div className="luxury-spinner" />
        <p className="luxury-loading-message">Loading Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Editorial header */}
      <div className="text-center space-y-6 pt-8">
        <h1 className="luxury-heading-1">STUDIO</h1>
        <p className="luxury-text-caption">CREATE • CAPTURE • CURATE</p>
      </div>

      {/* Featured session card with enhanced styling */}
      <div className="luxury-card">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-3">
            <h3 className="luxury-heading-3">Featured Session</h3>
            <p className="luxury-text-body">Professional Portrait Series</p>
          </div>
          <button className="luxury-button-secondary p-3">
            <Play size={18} fill="currentColor" />
          </button>
        </div>
        
        <div className="w-full h-32 bg-zinc-800/30 rounded-xl mb-8 relative overflow-hidden border border-zinc-700/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-600/10 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={32} className="text-zinc-600" strokeWidth={1} />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="luxury-text-caption">45 minutes • 24 shots</span>
          <button className="luxury-text-caption hover:text-white transition-colors">
            View Details
          </button>
        </div>
      </div>

      {/* Editorial action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button className="luxury-button-primary">
          <Camera size={24} strokeWidth={1.2} />
          <span>New Session</span>
        </button>
        <button className="luxury-button-secondary">
          <Grid size={24} strokeWidth={1.2} />
          <span>Browse</span>
        </button>
      </div>

      {/* Maya AI Integration Card */}
      <div className="luxury-card">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
            <Sparkles size={20} className="text-zinc-300" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h4 className="luxury-heading-3">Maya AI Studio</h4>
            <p className="luxury-text-body">
              Your personal brand strategist ready to create compelling photo concepts
            </p>
          </div>
        </div>
        
        <button className="luxury-button-primary w-full">
          <span>Start Creative Session</span>
        </button>
      </div>

      {/* Editorial activity list */}
      <div className="space-y-6">
        <h3 className="luxury-heading-3">Recent Activity</h3>
        <div className="space-y-1">
          {recentActivity.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between py-6 border-b border-zinc-800/20 last:border-b-0 hover:bg-zinc-800/10 transition-colors duration-300 px-4 -mx-4 rounded-lg"
            >
              <div className="space-y-2">
                <p className="luxury-text-body">{item.action}</p>
                <p className="luxury-text-caption">{item.time}</p>
              </div>
              <div className="text-right">
                <span className="luxury-text-caption">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="luxury-card">
        <h4 className="luxury-heading-3 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="luxury-button-secondary text-sm py-3">
            <Plus size={16} />
            <span>Upload Photos</span>
          </button>
          <button className="luxury-button-secondary text-sm py-3">
            <Search size={16} />
            <span>Browse Styles</span>
          </button>
        </div>
      </div>
    </div>
  );
}