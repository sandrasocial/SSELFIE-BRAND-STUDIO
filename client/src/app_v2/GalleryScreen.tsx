import React from 'react';
import { Search, MoreHorizontal, Heart, Share2, Plus } from 'lucide-react';

export const GalleryScreen = ({ items }: { items: string[] }) => (
  <div className="space-y-6 pb-6 sm:space-y-8">
    {/* Gallery header */}
    <div className="flex justify-between items-start pt-4">
      <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
        <h2 className="text-2xl sm:text-4xl font-serif font-thin tracking-[0.4em] text-stone-900 uppercase leading-tight">Gallery</h2>
        <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">Your Beautiful Photos</p>
      </div>
      <div className="flex space-x-2 sm:space-x-3 ml-4">
        <button className="p-3 sm:p-4 bg-stone-200/40 rounded-lg sm:rounded-2xl border border-stone-300/50 transition-all duration-300 hover:scale-105">
          <Search size={16} strokeWidth={1.2} className="text-stone-600 sm:w-5 sm:h-5" />
        </button>
        <button className="p-3 sm:p-4 bg-stone-200/40 rounded-lg sm:rounded-2xl border border-stone-300/50 hover:bg-stone-200/60 hover:border-stone-400/60 transition-all duration-300 hover:scale-105">
          <MoreHorizontal size={16} className="text-stone-600 hover:text-stone-800 transition-colors sm:w-5 sm:h-5" strokeWidth={1.2} />
        </button>
      </div>
    </div>
    {/* Gallery grid */}
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {items.map((item, index) => (
        <div key={index} className="relative group cursor-pointer overflow-hidden rounded-lg sm:rounded-2xl">
          <div className="aspect-square relative">
            <img 
              src={item} 
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="flex justify-between items-end">
                <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                  <span className="text-stone-50 text-xs tracking-[0.2em] uppercase font-light block">Photo {String(index + 1).padStart(2, '0')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-stone-50 rounded-full"></div>
                    <span className="text-xs font-light truncate text-stone-200 opacity-80">Ready</span>
                  </div>
                </div>
                <div className="flex space-x-2 sm:space-x-3 ml-2">
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-50/20 backdrop-blur-sm rounded-lg sm:rounded-2xl flex items-center justify-center hover:bg-stone-50/30 transition-colors duration-300 hover:scale-110">
                    <Heart size={14} className="text-stone-50 sm:w-4 sm:h-4" strokeWidth={1.2} />
                  </button>
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-50/20 backdrop-blur-sm rounded-lg sm:rounded-2xl flex items-center justify-center hover:bg-stone-50/30 transition-colors duration-300 hover:scale-110">
                    <Share2 size={14} className="text-stone-50 sm:w-4 sm:h-4" strokeWidth={1.2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Load more */}
    <div className="text-center pt-4 sm:pt-6">
      <button className="text-sm tracking-[0.3em] uppercase font-light border-b pb-2 flex items-center gap-2 mx-auto transition-colors duration-300 text-stone-600 opacity-80 border-stone-400/20">
        <Plus size={14} className="sm:w-4 sm:h-4" />
        See More Photos
      </button>
    </div>
  </div>
);