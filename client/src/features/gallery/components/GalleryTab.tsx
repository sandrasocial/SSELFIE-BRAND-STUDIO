import React, { useMemo, useState } from 'react';
import { Grid, Search, Star, Filter, Plus, Heart, Camera } from '../../../components/icons/index.js';
import { Calendar, Check, SortDesc, SortAsc, Eye, Download, Trash2 } from 'lucide-react';
import CategoryFilter, { type Category } from './CategoryFilter.js';
import ImageGrid from './ImageGrid.js';
import type { GalleryImage } from './ImageDetailModal.js';

export interface GalleryTabProps {
  images: GalleryImage[];
  favorites: number[];
  viewMode: 'grid' | 'masonry';
  onChangeViewMode: (mode: 'grid' | 'masonry') => void;
  onToggleFavorite: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  onOpenModal: (img: GalleryImage) => void;
}

export default function GalleryTab({ images, favorites, viewMode, onChangeViewMode, onToggleFavorite, onDelete, onOpenModal }: GalleryTabProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string | number>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'favorites'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState<Category>('All');

  const filteredImages = useMemo(() => {
    let filtered = images;

    // Search
    if (searchQuery) {
      filtered = filtered.filter(img => (img.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Category filter (client-side by image.source or title heuristics; backend may add explicit category later)
    if (category !== 'All') {
      const key = category.toLowerCase();
      filtered = filtered.filter(img => (img.title || img.source || '').toLowerCase().includes(key));
    }

    // Favorites / recent
    if (filterBy === 'favorites') {
      filtered = filtered.filter(img => favorites.includes(typeof img.id === 'string' ? parseInt(img.id, 10) : img.id as number));
    } else if (filterBy === 'recent') {
      filtered = filtered.slice(0, 10);
    }

    // Sorting
    if (sortBy === 'newest') filtered = [...filtered].reverse();
    if (sortBy === 'favorites') {
      filtered = [...filtered].sort((a, b) => {
        const aFav = favorites.includes(typeof a.id === 'string' ? parseInt(a.id, 10) : a.id as number);
        const bFav = favorites.includes(typeof b.id === 'string' ? parseInt(b.id, 10) : b.id as number);
        return (bFav ? 1 : 0) - (aFav ? 1 : 0);
      });
    }

    return filtered;
  }, [images, favorites, searchQuery, filterBy, sortBy, category]);

  const stats = React.useMemo(() => ({
    total: images.length,
    favorites: favorites.length,
    selected: selectedImages.size
  }), [images.length, favorites.length, selectedImages.size]);

  const clearSelection = () => setSelectedImages(new Set());
  const onToggleSelect = (id: string | number) => setSelectedImages(prev => { const ns = new Set(prev); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });

  const downloadImage = (img: GalleryImage) => {
    const link = document.createElement('a') as HTMLAnchorElement;
    link.href = img.imageUrl || img.url || '';
    link.download = img.title || 'sselfie-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDownload = () => {
    selectedImages.forEach(id => {
      const img = filteredImages.find(i => i.id === id);
      if (img) downloadImage(img);
    });
  };

  const handleBulkDelete = () => {
    if (!selectedImages.size) return;
    if (window.confirm(`Delete ${selectedImages.size} photos?`)) {
      selectedImages.forEach(id => onDelete(id));
      clearSelection();
    }
  };

  return (
    <div className="space-y-8 py-8 sm:py-12">
      {/* Screen Header */}
      <div className="pt-3 sm:pt-4 md:pt-6 text-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-2 sm:mb-3">
          Gallery
        </h1>
        <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light text-stone-500">
          Professional Collection • {stats.total} Photos
        </p>
      </div>

      {/* Stats and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-stone-600 rounded-full" />
            <span className="text-xs text-stone-600 tracking-[0.2em] uppercase font-light">{stats.favorites} Favorites</span>
          </div>
          {stats.selected > 0 && (
            <div className="flex items-center gap-3">
              <Check size={12} className="text-stone-950" strokeWidth={1.5} />
              <span className="text-xs text-stone-950 tracking-[0.2em] uppercase font-light">{stats.selected} Selected</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" strokeWidth={1.5} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search photos..." className="pl-12 pr-4 py-3 bg-white border border-stone-200/60 rounded-2xl text-stone-950 text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-600/40 focus:border-stone-600/60 w-64 font-light" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-stone-950 border-stone-950 text-stone-50' : 'bg-white border-stone-200/60 hover:border-stone-300 text-stone-600'}`}>
            <Filter size={16} className={showFilters ? 'text-stone-50' : 'text-stone-600'} strokeWidth={1.5} />
          </button>
          <div className="flex bg-white rounded-2xl border border-stone-200/60 p-1">
            <button onClick={() => onChangeViewMode('grid')} className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-stone-100 text-stone-950' : 'hover:bg-stone-50 text-stone-600'}`}><Grid size={16} strokeWidth={1.5} /></button>
            <button onClick={() => onChangeViewMode('masonry')} className={`p-2 rounded-xl ${viewMode === 'masonry' ? 'bg-stone-100 text-stone-950' : 'hover:bg-stone-50 text-stone-600'}`}><Eye size={16} strokeWidth={1.5} /></button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'Total', value: images.length, icon: Grid },
          { label: 'Favorited', value: favorites.length, icon: Heart },
          { label: 'Close-Up', value: images.filter(i => (i.title || i.source || '').toLowerCase().includes('close')).length, icon: Camera },
          { label: 'Scenery', value: images.filter(i => (i.title || i.source || '').toLowerCase().includes('scenery')).length, icon: Camera }
        ].map((stat, i) => (
          <div key={i} className="group bg-white/50 backdrop-blur-2xl border border-white/60 rounded-[1.5rem] p-4 sm:p-5 text-center shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:scale-105 transition-all duration-300">
            <div className="w-11 h-11 bg-stone-950 rounded-[1rem] flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <stat.icon size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-950 mb-1">{stat.value}</div>
            <div className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-stone-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white backdrop-blur-sm rounded-3xl border border-stone-200/60 p-6 sm:p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <label className="text-xs text-stone-500 tracking-[0.2em] uppercase font-light">Sort By</label>
              <div className="flex flex-col space-y-3">
                {[{v:'newest',label:'Newest First',Icon:SortDesc},{v:'oldest',label:'Oldest First',Icon:SortAsc},{v:'favorites',label:'Favorites First',Icon:Star}].map(({v,label,Icon}) => (
                  <button key={v} onClick={() => setSortBy(v as any)} className={`flex items-center gap-4 p-4 rounded-2xl text-left ${sortBy===v?'bg-stone-100 border border-stone-200/60 text-stone-950':'hover:bg-stone-50 text-stone-600'}`}>
                    <Icon size={16} className={sortBy===v?'text-stone-950':'text-stone-500'} strokeWidth={1.5} />
                    <span className="text-sm font-light">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs text-stone-500 tracking-[0.2em] uppercase font-light">Filter By</label>
              <div className="flex flex-col space-y-3">
                {[{v:'all',label:'All Photos',Icon:Grid},{v:'favorites',label:'Favorites Only',Icon:Star},{v:'recent',label:'Recent (7 days)',Icon:Calendar}].map(({v,label,Icon}) => (
                  <button key={v} onClick={() => setFilterBy(v as any)} className={`flex items-center gap-4 p-4 rounded-2xl text-left ${filterBy===v?'bg-stone-100 border border-stone-200/60 text-stone-950':'hover:bg-stone-50 text-stone-600'}`}>
                    <Icon size={16} className={filterBy===v?'text-stone-950':'text-stone-500'} strokeWidth={1.5} />
                    <span className="text-sm font-light">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs text-stone-500 tracking-[0.2em] uppercase font-light">Category</label>
              <CategoryFilter value={category} onChange={setCategory} />
            </div>
          </div>

          {selectedImages.size > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={handleBulkDownload} className="flex items-center gap-2 px-6 py-3 bg-stone-100 rounded-2xl hover:bg-stone-200 transition-colors"><Download size={14} className="text-stone-600" strokeWidth={1.5} /><span className="text-xs text-stone-600 tracking-[0.1em] uppercase font-light">Download</span></button>
              <button onClick={handleBulkDelete} className="flex items-center gap-2 px-6 py-3 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 size={14} className="text-red-600" strokeWidth={1.5} /><span className="text-xs text-red-600 tracking-[0.1em] uppercase font-light">Delete</span></button>
              <button onClick={() => clearSelection()} className="flex items-center gap-2 px-6 py-3 bg-stone-100 rounded-2xl hover:bg-stone-200 transition-colors"><XIcon /><span className="text-xs text-stone-600 tracking-[0.1em] uppercase font-light">Clear</span></button>
            </div>
          )}
        </div>
      )}

      {/* Grid or Empty State */}
      {filteredImages.length === 0 ? (
        filterBy === 'favorites' ? (
          <div className="bg-white/50 backdrop-blur-2xl rounded-xl sm:rounded-[1.75rem] p-12 text-center border border-white/60 shadow-xl shadow-stone-900/10">
            <Heart size={48} className="mx-auto mb-6 text-stone-400" strokeWidth={1.5} />
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-950 mb-3">
              No Favorites Yet
            </h3>
            <p className="text-xs sm:text-sm md:text-base font-medium text-stone-600 mb-6">
              Heart your favorite images in the All Images view to build your Instagram feed
            </p>
            <button
              onClick={() => setFilterBy('all')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-stone-950 text-stone-50 rounded-2xl font-light tracking-[0.15em] uppercase text-xs sm:text-sm transition-all duration-200 hover:bg-stone-800 min-h-[48px] sm:min-h-[52px]"
            >
              Browse All Images
            </button>
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-2xl rounded-xl sm:rounded-[1.75rem] p-12 text-center border border-white/60 shadow-xl shadow-stone-900/10">
            <Heart size={48} className="mx-auto mb-6 text-stone-400" strokeWidth={1.5} />
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-950 mb-3">
              No Photos Found
            </h3>
            <p className="text-xs sm:text-sm md:text-base font-medium text-stone-600 mb-6">
              Try adjusting your search or filters to find more photos
            </p>
          </div>
        )
      ) : (
        <>
          <ImageGrid
            images={filteredImages}
            favorites={favorites}
            selected={selectedImages}
            viewMode={viewMode}
            onOpen={onOpenModal}
            onToggleFavorite={onToggleFavorite}
            onToggleSelect={onToggleSelect}
            onDownload={downloadImage}
            onDelete={onDelete}
          />

          {/* Load More Button */}
          <div className="text-center pt-12">
            <button className="text-stone-600 text-sm tracking-[0.15em] uppercase font-light hover:text-stone-950 transition-colors px-8 py-4 rounded-2xl hover:bg-stone-100">
              Load More Photos
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function XIcon(){return (<svg width="14" height="14" viewBox="0 0 24 24" className="text-stone-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>)}

