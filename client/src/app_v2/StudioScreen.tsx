import React from 'react';
import { Camera, ChevronRight, Grid, Plus } from 'lucide-react';

export const StudioScreen = ({ user }: { user: any }) => (
  <div className="space-y-6 pb-6 sm:space-y-8">
    {/* Clean hub header */}
    <div className="pt-4 sm:pt-6">
      <h1 className="text-2xl sm:text-4xl font-serif font-thin tracking-[0.4em] text-stone-900 uppercase leading-tight mb-2">
        STUDIO
      </h1>
      <p className="text-xs tracking-[0.3em] uppercase font-light text-stone-500">
        Creative Control Center
      </p>
    </div>
    {/* Status overview cards */}
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-stone-200/50 border border-stone-300/60 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-stone-200/70 transition-all duration-300 min-h-[80px] sm:min-h-auto">
        <div className="text-xs tracking-[0.2em] uppercase font-light mb-2 text-stone-500">Active</div>
        <div className="text-xl sm:text-2xl font-serif font-thin text-stone-900 mb-1">12</div>
        <div className="text-xs font-light text-stone-600">Sessions</div>
      </div>
      <div className="bg-stone-200/50 border border-stone-300/60 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-stone-200/70 transition-all duration-300 min-h-[80px] sm:min-h-auto">
        <div className="text-xs tracking-[0.2em] uppercase font-light mb-2 text-stone-500">Ready</div>
        <div className="text-xl sm:text-2xl font-serif font-thin text-stone-900 mb-1">47</div>
        <div className="text-xs font-light text-stone-600">Photos</div>
      </div>
      <div className="bg-stone-200/50 border border-stone-300/60 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-stone-200/70 transition-all duration-300 min-h-[80px] sm:min-h-auto">
        <div className="text-xs tracking-[0.2em] uppercase font-light mb-2 text-stone-500">Queue</div>
        <div className="text-xl sm:text-2xl font-serif font-thin text-stone-900 mb-1">3</div>
        <div className="text-xs font-light text-stone-600">Pending</div>
      </div>
    </div>
    {/* Main control panel */}
    <div className="bg-stone-200/40 border border-stone-300/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <div className="text-xs tracking-[0.2em] uppercase font-light mb-2 text-stone-500">Current Session</div>
          <h3 className="text-lg sm:text-xl font-serif font-thin tracking-[0.1em] text-stone-900 uppercase truncate">Executive Portrait</h3>
          <p className="text-sm font-light mt-2 text-stone-600">Professional series • 5 shots remaining</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-2 h-2 bg-stone-800 rounded-full"></div>
          <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-600">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
        <div className="aspect-[4/3] sm:aspect-[4/3] bg-stone-300/40 rounded-lg sm:rounded-xl border border-stone-400/50 flex items-center justify-center group hover:bg-stone-300/60 transition-all duration-300 cursor-pointer">
          <Camera size={20} className="text-stone-500 group-hover:text-stone-700 transition-colors sm:w-6 sm:h-6" strokeWidth={1} />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="tracking-[0.1em] uppercase font-light text-stone-500">Progress</span>
            <span className="font-light text-stone-600">40%</span>
          </div>
          <div className="w-full h-1 bg-stone-300 rounded-full overflow-hidden">
            <div className="w-2/5 h-full bg-stone-700 rounded-full"></div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-light text-stone-600">Close-up headshot</span>
              <div className="w-1.5 h-1.5 bg-stone-800 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-light text-stone-600">Half body shot</span>
              <div className="w-1.5 h-1.5 bg-stone-800 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-light text-stone-500">Full scene</span>
              <div className="w-1.5 h-1.5 bg-stone-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      <button className="w-full bg-stone-950 text-stone-50 py-3 sm:py-4 rounded-lg sm:rounded-xl font-light tracking-[0.2em] uppercase text-sm transition-all duration-300 hover:bg-stone-800 hover:transform hover:translate-y-[-1px] min-h-[48px]">
        Continue Session
      </button>
    </div>
    {/* Quick actions grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button className="bg-stone-200/40 border border-stone-300/50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-left hover:bg-stone-200/60 hover:border-stone-400/60 transition-all duration-300 group min-h-[100px] sm:min-h-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-500/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-stone-400/20">
            <Plus size={16} className="text-stone-600 sm:w-5 sm:h-5" strokeWidth={1} />
          </div>
          <ChevronRight size={14} className="text-stone-500 group-hover:text-stone-700 transition-colors sm:w-4 sm:h-4" strokeWidth={1} />
        </div>
        <h4 className="text-sm sm:text-base font-light text-stone-900 mb-1 sm:mb-2">New Session</h4>
        <p className="text-xs font-light text-stone-500">Start fresh photo series</p>
      </button>
      <button className="bg-stone-200/40 border border-stone-300/50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-left hover:bg-stone-200/60 hover:border-stone-400/60 transition-all duration-300 group min-h-[100px] sm:min-h-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-500/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-stone-400/20">
            <Grid size={16} className="text-stone-600 sm:w-5 sm:h-5" strokeWidth={1} />
          </div>
          <ChevronRight size={14} className="text-stone-500 group-hover:text-stone-700 transition-colors sm:w-4 sm:h-4" strokeWidth={1} />
        </div>
        <h4 className="text-sm sm:text-base font-light text-stone-900 mb-1 sm:mb-2">Browse Gallery</h4>
        <p className="text-xs font-light text-stone-500">View completed work</p>
      </button>
    </div>
    {/* Recent activity - minimalist */}
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-serif font-thin tracking-[0.2em] text-stone-900 uppercase">Recent Activity</h3>
      <div className="space-y-1">
        {[
          { action: 'Executive session completed', time: '2h ago', type: 'completion' },
          { action: 'Brand photos exported', time: '1d ago', type: 'export' },
          { action: 'New session started', time: '3d ago', type: 'start' },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between py-3 sm:py-4 border-b border-stone-300/20 last:border-b-0 hover:bg-stone-200/20 transition-colors duration-300 px-3 sm:px-4 -mx-3 sm:-mx-4 rounded-lg sm:rounded-xl">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-1.5 h-1.5 rounded-full ${
                item.type === 'completion' ? 'bg-stone-800' : 
                item.type === 'export' ? 'bg-stone-600' : 'bg-stone-400'
              }`}></div>
              <span className="text-sm font-light text-stone-900 truncate">{item.action}</span>
            </div>
            <span className="text-xs tracking-[0.1em] uppercase font-light ml-2 text-stone-500">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);