import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';
import { Camera, Grid, Play, Plus, Star, Sparkles, Image as ImageIcon, MessageCircle } from 'lucide-react';

// Studio Screen Component - Following Demo App Style Guide
export function StudioScreen() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-8">
      {/* Editorial header - Following Styleguide */}
      <div className="text-center space-y-6 pt-8">
        <h1 className="text-4xl font-serif font-extralight tracking-[0.4em] text-white leading-none">
          STUDIO
        </h1>
        <p className="text-zinc-400 text-xs tracking-[0.3em] uppercase font-light">
          CREATE • CAPTURE • CURATE
        </p>
      </div>

      {/* Featured session card - Following Styleguide Design */}
      <div className="bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 rounded-2xl p-8 border border-zinc-700/20 transition-all duration-500 hover:border-zinc-600/30 hover:bg-gradient-to-br hover:from-zinc-800/30 hover:to-zinc-900/30">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-3">
            <h3 className="text-xl font-serif font-extralight tracking-[0.2em] text-white uppercase">Featured Session</h3>
            <p className="text-zinc-400 text-sm font-light">Professional Portrait Series</p>
          </div>
          <button className="p-3 bg-zinc-700/30 rounded-xl border border-zinc-600/20 hover:bg-zinc-700/50 transition-all duration-300 hover:scale-105 group">
            <Play size={18} className="text-zinc-300 group-hover:text-white transition-colors" fill="currentColor" />
          </button>
        </div>
        
        <div className="w-full h-32 bg-zinc-800/30 rounded-xl mb-8 relative overflow-hidden border border-zinc-700/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-600/10 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={32} className="text-zinc-600" strokeWidth={1} />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 text-sm font-light tracking-wide">45 minutes • 24 shots</span>
          <button className="text-white text-xs tracking-[0.2em] uppercase hover:text-zinc-300 transition-colors font-light">
            View Details
          </button>
        </div>
      </div>

      {/* Editorial action buttons - Following Styleguide */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setLocation('/maya')}
          className="group relative bg-white text-black px-8 py-6 rounded-xl font-light tracking-[0.2em] uppercase text-xs transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 bg-black transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          <div className="relative z-10 group-hover:text-white transition-colors duration-500 flex flex-col items-center space-y-3">
            <MessageCircle size={24} strokeWidth={1.2} />
            <span>Chat with Maya</span>
          </div>
        </button>
        
        <button 
          onClick={() => setLocation('/sselfie-gallery')}
          className="bg-zinc-800/30 text-white px-8 py-6 rounded-xl font-light tracking-[0.2em] uppercase text-xs border border-zinc-700/20 transition-all duration-500 hover:bg-zinc-800/50 hover:border-zinc-600/30 hover:scale-[1.02] flex flex-col items-center space-y-3"
        >
          <Grid size={24} strokeWidth={1.2} />
          <span>Browse Gallery</span>
        </button>
      </div>

      {/* Quick Actions Grid - Following Styleguide */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 rounded-2xl p-6 border border-zinc-700/20 transition-all duration-500 hover:border-zinc-600/30 hover:bg-gradient-to-br hover:from-zinc-800/30 hover:to-zinc-900/30 hover:scale-[1.02] text-center space-y-4">
          <div className="w-12 h-12 bg-zinc-700/30 rounded-xl mx-auto flex items-center justify-center">
            <ImageIcon size={20} className="text-zinc-400" strokeWidth={1.2} />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-serif font-extralight tracking-[0.1em] text-white uppercase">Quick Shot</h4>
            <p className="text-sm text-zinc-400 font-light">Fast professional photos</p>
          </div>
        </button>
        
        <button className="bg-gradient-to-br from-zinc-800/20 to-zinc-900/20 rounded-2xl p-6 border border-zinc-700/20 transition-all duration-500 hover:border-zinc-600/30 hover:bg-gradient-to-br hover:from-zinc-800/30 hover:to-zinc-900/30 hover:scale-[1.02] text-center space-y-4">
          <div className="w-12 h-12 bg-zinc-700/30 rounded-xl mx-auto flex items-center justify-center">
            <Star size={20} className="text-zinc-400" strokeWidth={1.2} />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-serif font-extralight tracking-[0.1em] text-white uppercase">Premium</h4>
            <p className="text-sm text-zinc-400 font-light">High-end styling session</p>
          </div>
        </button>
      </div>

      {/* Editorial activity list - Following Styleguide */}
      <div className="space-y-6">
        <h3 className="text-lg font-serif font-extralight tracking-[0.2em] text-white uppercase">Recent Activity</h3>
        <div className="space-y-1">
          {[
            { action: 'Portrait session completed', time: '2h ago', status: 'Processed' },
            { action: 'Gallery updated', time: '1d ago', status: 'Published' },
            { action: 'Profile enhanced', time: '3d ago', status: 'Archived' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-6 border-b border-zinc-800/20 last:border-b-0 hover:bg-zinc-800/10 transition-colors duration-300 px-4 -mx-4 rounded-lg">
              <div className="space-y-2">
                <p className="text-white font-light text-base">{item.action}</p>
                <p className="text-zinc-500 text-xs tracking-[0.1em] uppercase font-light">{item.time}</p>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 text-xs tracking-[0.1em] uppercase font-light">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}