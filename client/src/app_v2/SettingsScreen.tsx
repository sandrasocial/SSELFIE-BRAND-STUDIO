import React from 'react';
import { Bell, Camera, User, ChevronRight } from 'lucide-react';

export const SettingsScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="space-y-4 pb-6 sm:space-y-6">
    <div className="flex items-center gap-3 sm:gap-4 pt-4">
      <button 
        onClick={onBack}
        className="p-3 sm:p-4 bg-stone-200/50 rounded-lg sm:rounded-2xl border border-stone-300/60 hover:bg-stone-200/70 hover:border-stone-400/60 transition-all duration-300"
      >
        <ChevronRight size={16} className="text-stone-600 transform rotate-180 sm:w-5 sm:h-5" strokeWidth={1.2} />
      </button>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl sm:text-3xl font-serif font-thin tracking-[0.4em] text-stone-900 uppercase">Settings</h2>
        <p className="text-xs sm:text-sm tracking-[0.2em] uppercase font-light mt-1 sm:mt-2 text-stone-500">Your Preferences</p>
      </div>
    </div>
    <div className="space-y-4 sm:space-y-6">
      {[
        { 
          title: 'Notifications', 
          icon: Bell, 
          items: [
            { name: 'Photo completion alerts', status: 'On', type: 'toggle' },
            { name: 'Maya updates', status: 'Weekly', type: 'select' },
            { name: 'Tips & inspiration', status: 'On', type: 'toggle' }
          ] 
        },
        { 
          title: 'Photo Quality', 
          icon: Camera, 
          items: [
            { name: 'Image resolution', status: 'High', type: 'select' },
            { name: 'Auto-enhance', status: 'On', type: 'toggle' },
            { name: 'Background removal', status: 'Auto', type: 'select' }
          ] 
        },
        { 
          title: 'Account', 
          icon: User, 
          items: [
            { name: 'Profile visibility', status: 'Public', type: 'select' },
            { name: 'Data backup', status: 'Cloud', type: 'select' },
            { name: 'Photo sharing', status: 'On', type: 'toggle' }
          ] 
        },
      ].map((group, index) => (
        <div key={index} className="bg-stone-200/30 rounded-lg sm:rounded-2xl p-4 sm:p-8 border border-stone-300/50">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-8">
            <div className="p-2 sm:p-3 bg-stone-500/10 rounded-lg sm:rounded-2xl border border-stone-400/20">
              <group.icon size={18} className="text-stone-600 sm:w-[22px] sm:h-[22px]" strokeWidth={1.2} />
            </div>
            <h3 className="text-base sm:text-xl font-serif font-thin tracking-[0.2em] text-stone-900 uppercase">{group.title}</h3>
          </div>
          <div className="space-y-1 sm:space-y-2">
            {group.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center justify-between py-3 sm:py-5 hover:bg-stone-300/30 rounded-lg sm:rounded-2xl px-3 sm:px-6 -mx-3 sm:-mx-6 transition-all duration-300 cursor-pointer group min-h-[48px] sm:min-h-[56px]">
                <span className="text-sm sm:text-base text-stone-900 font-light flex-1 min-w-0 truncate">{item.name}</span>
                <div className="flex items-center space-x-3 sm:space-x-4 ml-4">
                  <span className="text-xs sm:text-sm font-light text-stone-600">{item.status}</span>
                  {item.type === 'toggle' ? (
                    <div className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full relative transition-colors duration-300 ${
                      item.status === 'On' ? 'bg-stone-600/30' : 'bg-stone-300'
                    }`}>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-stone-50 rounded-full absolute top-0.5 transition-transform duration-300 ${
                        item.status === 'On' ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
                      }`}></div>
                    </div>
                  ) : (
                    <ChevronRight size={14} className="text-stone-500 group-hover:text-stone-700 transition-colors sm:w-[18px] sm:h-[18px]" strokeWidth={1.2} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="pt-4 sm:pt-6 border-t border-stone-300/20">
      <button className="w-full text-sm tracking-[0.2em] uppercase font-light border rounded-lg sm:rounded-2xl py-4 sm:py-6 transition-colors hover:text-stone-900 hover:bg-stone-200/30 min-h-[52px] sm:min-h-auto text-stone-600 opacity-80 border-stone-400/30">
        Sign Out
      </button>
    </div>
  </div>
);