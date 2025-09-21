import React from 'react';
import { LuxuryChatInterface } from '../components/LuxuryChatInterface';
import { Camera, Grid, Play, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

// Luxury StudioPage - Matches Demo App Aesthetic
export function StudioPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Elegant welcome header */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-3xl font-light text-neutral-200 tracking-wide">
          STUDIO
        </h1>
        <p className="text-neutral-400 text-sm tracking-wide">
          CREATE • CAPTURE • CURATE
        </p>
      </div>

      {/* Featured session card matching demo */}
      <div className="bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 rounded-2xl p-8 border border-neutral-700/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-light text-neutral-200 tracking-wide mb-2">Featured Session</h3>
            <p className="text-neutral-400 text-sm">Professional Portrait Series</p>
          </div>
          <button className="p-2 bg-neutral-700/30 rounded-lg border border-neutral-600/30 hover:bg-neutral-700/50 transition-colors">
            <Play size={18} className="text-neutral-300" fill="currentColor" />
          </button>
        </div>
        
        <div className="w-full h-32 bg-neutral-800/50 rounded-xl mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent"></div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-neutral-400 text-sm">45 minutes • 24 shots</span>
          <button className="text-neutral-300 text-sm tracking-wide hover:text-neutral-200 transition-colors">
            VIEW DETAILS
          </button>
        </div>
      </div>

      {/* Action buttons - minimalist matching demo */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-neutral-200 text-black px-8 py-6 rounded-xl font-light tracking-wide transition-all duration-200 hover:bg-neutral-300 hover:scale-[1.02] active:scale-[0.98]">
          <Camera className="mx-auto mb-3" size={24} strokeWidth={1.5} />
          NEW SESSION
        </button>
        <button className="bg-neutral-800/40 text-neutral-200 px-8 py-6 rounded-xl font-light tracking-wide border border-neutral-700/30 transition-all duration-200 hover:bg-neutral-800/60">
          <Grid className="mx-auto mb-3" size={24} strokeWidth={1.5} />
          BROWSE
        </button>
      </div>

      {/* Recent activity - editorial style matching demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-light text-neutral-200 tracking-wide">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Portrait session completed', time: '2h ago', status: 'Processed' },
            { action: 'Gallery updated', time: '1d ago', status: 'Published' },
            { action: 'Profile enhanced', time: '3d ago', status: 'Archived' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-4 border-b border-neutral-800/30 last:border-b-0">
              <div className="space-y-1">
                <p className="text-neutral-200 font-light">{item.action}</p>
                <p className="text-neutral-500 text-xs tracking-wide">{item.time}</p>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 text-xs tracking-wide">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maya AI Chat Interface - Clean Integration */}
      <div className="bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 rounded-2xl p-6 border border-neutral-700/20">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800/30">
          <div className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-700/30">
            <Sparkles size={20} className="text-neutral-300" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-light text-neutral-200 tracking-wide">Maya AI Studio</h3>
            <p className="text-neutral-500 text-sm tracking-wide">Your creative AI assistant</p>
          </div>
        </div>
        <div className="min-h-[400px]">
          <LuxuryChatInterface />
        </div>
      </div>
    </div>
  );
}