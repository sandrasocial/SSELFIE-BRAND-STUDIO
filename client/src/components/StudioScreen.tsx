import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';
import { Camera, Grid, Play, Plus, Star, Sparkles, Image as ImageIcon, MessageCircle } from 'lucide-react';

// Studio Screen Component - Following Demo App Style Guide
export function StudioScreen() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="luxury-tab-content">
      {/* Header */}
      <div className="luxury-tab-header">
        <div className="text-center">
          <h1 className="luxury-heading-1">STUDIO</h1>
          <p className="luxury-text-caption">CREATE • CAPTURE • CURATE</p>
        </div>
      </div>

      {/* Featured Session Card */}
      <div className="luxury-card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="luxury-heading-3 mb-2">Featured Session</h3>
            <p className="luxury-text-body text-zinc-400">Professional Portrait Series</p>
          </div>
          <button className="w-12 h-12 bg-zinc-800/30 rounded-xl border border-zinc-700/20 hover:bg-zinc-700/50 transition-all duration-300 hover:scale-105 group flex items-center justify-center">
            <Play size={18} className="text-zinc-300 group-hover:text-white transition-colors" fill="currentColor" />
          </button>
        </div>
        
        <div className="w-full h-32 bg-zinc-800/30 rounded-xl mb-6 relative overflow-hidden border border-zinc-700/20">
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

      {/* Action Buttons - Demo App Style */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => setLocation('/maya')}
          className="group relative bg-white text-black px-6 py-6 rounded-xl font-light tracking-wide transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <div className="relative z-10 group-hover:text-white transition-colors duration-500 flex flex-col items-center space-y-3">
            <MessageCircle size={24} strokeWidth={1.2} />
            <span className="text-xs tracking-wider uppercase">Chat with Maya</span>
          </div>
        </button>
        
        <button 
          onClick={() => setLocation('/sselfie-gallery')}
          className="bg-zinc-800/30 text-white px-6 py-6 rounded-xl font-light tracking-wide border border-zinc-700/20 transition-all duration-500 hover:bg-zinc-800/50 hover:border-zinc-600/30 hover:scale-[1.02] flex flex-col items-center space-y-3"
        >
          <Grid size={24} strokeWidth={1.2} />
          <span className="text-xs tracking-wider uppercase">Browse Gallery</span>
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button className="luxury-card text-center py-6 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 bg-zinc-800/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <ImageIcon size={20} className="text-zinc-400" />
          </div>
          <h4 className="luxury-heading-4 mb-1">Quick Shot</h4>
          <p className="luxury-text-caption">Fast professional photos</p>
        </button>
        
        <button className="luxury-card text-center py-6 hover:scale-[1.02] transition-transform">
          <div className="w-12 h-12 bg-zinc-800/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Star size={20} className="text-zinc-400" />
          </div>
          <h4 className="luxury-heading-4 mb-1">Premium</h4>
          <p className="luxury-text-caption">High-end styling session</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h3 className="luxury-heading-3">Recent Activity</h3>
        <div className="space-y-1">
          {[
            { action: 'Portrait session completed', time: '2h ago', status: 'Processed' },
            { action: 'Gallery updated', time: '1d ago', status: 'Published' },
            { action: 'Profile enhanced', time: '3d ago', status: 'Archived' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-4 border-b border-zinc-800/20 last:border-b-0 hover:bg-zinc-800/10 transition-colors duration-300 px-4 -mx-4 rounded-lg">
              <div className="space-y-1">
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
    </div>
  );
}