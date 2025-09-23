import React, { useState } from 'react';
import { Camera, Settings } from 'lucide-react';
import { SettingsScreen } from './SettingsScreen';

export const ProfileScreen = ({ user }: { user: any }) => {
  const [activeSection, setActiveSection] = useState('profile');
  if (activeSection === 'settings') {
    return <SettingsScreen onBack={() => setActiveSection('profile')} />;
  }
  return (
    <div className="space-y-6 pb-6 sm:space-y-8">
      <div className="text-center space-y-6 sm:space-y-8 pt-4 sm:pt-6">
        <div className="relative inline-block">
          <img 
            src={user.avatar}
            alt={user.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-stone-300/60 shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-stone-50 rounded-full border-3 border-stone-200 flex items-center justify-center shadow-md">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-stone-800 rounded-full"></div>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-4xl font-serif font-thin tracking-[0.3em] text-stone-900 uppercase leading-tight">{user.name}</h2>
          <p className="text-xs sm:text-sm tracking-[0.4em] uppercase font-light bg-stone-500/10 px-3 py-2 sm:px-4 sm:py-2 rounded-full inline-block text-stone-600">
            {user.membershipTier} Member
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-2 sm:pt-4">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="text-2xl sm:text-4xl font-serif font-thin text-stone-900">{user.posts}</div>
            <div className="text-xs sm:text-sm tracking-[0.2em] uppercase font-light text-stone-500">Photos</div>
          </div>
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="text-2xl sm:text-4xl font-serif font-thin text-stone-900">{user.followers}</div>
            <div className="text-xs sm:text-sm tracking-[0.2em] uppercase font-light text-stone-500">Followers</div>
          </div>
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="text-2xl sm:text-4xl font-serif font-thin text-stone-900">{user.following}</div>
            <div className="text-xs sm:text-sm tracking-[0.2em] uppercase font-light text-stone-500">Following</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <button className="group relative bg-stone-950 text-stone-50 px-4 py-4 sm:px-6 sm:py-6 rounded-lg sm:rounded-2xl font-light tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:scale-[1.02] overflow-hidden shadow-md min-h-[52px] sm:min-h-auto">
          <div className="absolute inset-0 bg-stone-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
          <span className="relative z-10 group-hover:text-stone-50 transition-colors duration-700">Edit Profile</span>
        </button>
        <button 
          onClick={() => setActiveSection('settings')}
          className="bg-stone-200/40 text-stone-900 px-4 py-4 sm:px-6 sm:py-6 rounded-lg sm:rounded-2xl font-light tracking-[0.2em] uppercase text-sm border border-stone-300/50 transition-all duration-500 hover:bg-stone-200/60 hover:border-stone-400/60 hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3 min-h-[52px] sm:min-h-auto"
        >
          <Settings size={16} strokeWidth={1.2} className="sm:w-[18px] sm:h-[18px]" />
          Settings
        </button>
      </div>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-2xl font-serif font-thin tracking-[0.2em] text-stone-900 uppercase">Recent Work</h3>
          <button className="text-sm tracking-[0.2em] uppercase font-light transition-colors duration-300 text-stone-600 opacity-80">
            View All
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-stone-300/30 rounded-lg sm:rounded-2xl border border-stone-400/30 flex items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-105">
              <Camera size={20} strokeWidth={1} className="text-stone-500 group-hover:text-stone-700 transition-colors sm:w-7 sm:h-7" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};