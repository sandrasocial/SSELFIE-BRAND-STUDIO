import React from 'react';
import { LuxuryChatInterface } from '../components/LuxuryChatInterface';
import { Camera, Grid, Play, Sparkles, Crown, Palette } from 'lucide-react';

// Editorial Luxury StudioPage - Complete Redesign
export function StudioPage() {
  return (
    <div className="space-y-8">
      {/* Editorial Welcome Section */}
      <div className="editorial-profile-header">
        <h1 className="editorial-heading-1 text-center">STUDIO</h1>
        <p className="editorial-text-caption text-center">CREATE • CAPTURE • CURATE</p>
      </div>

      {/* Featured Session Card */}
      <div className="editorial-card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="editorial-heading-2 text-neutral-200 tracking-wide mb-2">Featured Session</h3>
            <p className="editorial-text-body text-neutral-400">Professional Portrait Series</p>
          </div>
          <button className="p-2 bg-neutral-700/30 rounded-lg border border-neutral-600/30 hover:bg-neutral-700/50 transition-colors">
            <Play size={18} className="text-neutral-300" fill="currentColor" />
          </button>
        </div>
        
        <div className="w-full h-32 bg-neutral-800/50 rounded-xl mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera size={32} className="text-neutral-400 mx-auto mb-2" strokeWidth={1.5} />
              <p className="editorial-text-caption text-neutral-500">Preview Session</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="editorial-text-caption text-neutral-400">45 minutes • 24 shots</span>
          <button className="editorial-text-caption text-neutral-300 hover:text-neutral-200 transition-colors">
            VIEW DETAILS
          </button>
        </div>
      </div>

      {/* Editorial Action Grid */}
      <div className="editorial-action-grid">
        <button className="editorial-button group-hover:scale-[1.02] transition-all duration-200">
          <Camera className="mx-auto mb-3" size={24} strokeWidth={1.5} />
          NEW SESSION
        </button>
        <button className="editorial-button-secondary group-hover:scale-[1.02] transition-all duration-200">
          <Grid className="mx-auto mb-3" size={24} strokeWidth={1.5} />
          BROWSE
        </button>
      </div>

      {/* Recent Activity - Editorial Style */}
      <div className="space-y-4">
        <h3 className="editorial-heading-3 text-neutral-200 tracking-wide">Recent Activity</h3>
        <div className="editorial-activity-list">
          {[
            { action: 'Portrait session completed', time: '2h ago', status: 'Processed' },
            { action: 'Gallery updated', time: '1d ago', status: 'Published' },
            { action: 'Profile enhanced', time: '3d ago', status: 'Archived' },
          ].map((item, index) => (
            <div key={index} className="editorial-activity-item">
              <div className="space-y-1">
                <p className="editorial-activity-action">{item.action}</p>
                <p className="editorial-activity-time">{item.time}</p>
              </div>
              <div className="text-right">
                <span className="editorial-activity-status">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maya AI Chat Interface */}
      <div className="editorial-card p-0 overflow-hidden">
        <div className="p-6 border-b border-neutral-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-800/40 rounded-lg">
              <Sparkles size={20} className="text-neutral-300" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="editorial-text-header text-neutral-200">Maya AI Studio</h3>
              <p className="editorial-text-caption text-neutral-500">Your creative AI assistant</p>
            </div>
          </div>
        </div>
        <div className="h-[600px]">
          <LuxuryChatInterface />
        </div>
      </div>

      {/* Creative Tools Section */}
      <div className="editorial-card p-6">
        <h3 className="editorial-heading-3 text-neutral-200 mb-4">Creative Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="editorial-button-secondary p-4 text-center group">
            <Crown className="mx-auto mb-2" size={24} strokeWidth={1.5} />
            <span className="editorial-text-caption block">Premium Styles</span>
          </button>
          <button className="editorial-button-secondary p-4 text-center group">
            <Palette className="mx-auto mb-2" size={24} strokeWidth={1.5} />
            <span className="editorial-text-caption block">Color Palette</span>
          </button>
        </div>
      </div>
    </div>
  );
}