import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '../../../hooks/use-auth.js';
import { apiFetch } from '../../../lib/api.js';
import {
  Camera,
  Plus,
  Star,
  Grid,
  ChevronRight
} from 'lucide-react';
import { StatTile } from '../../../components/shared/Card';

interface UserModel {
  id: string | null;
  userId: string;
  trainingStatus: 'not_started' | 'pending' | 'training' | 'completed' | 'failed';
  needsTraining: boolean;
  canRetrain: boolean;
  modelType: string;
  createdAt: string | null;
  updatedAt: string | null;
  userPlan: string;
  hasActiveSubscription: boolean;
  onboardingSource: string;
}

interface StyleOption {
  id: string;
  title: string;
  description: string;
}

interface StudioScreenProps {
  onTabChange?: (tabId: string) => void;
  hasTrainedModel?: boolean;
}

// @ts-ignore - FC type compatibility with JSX.Element
const StudioScreen: React.FC<StudioScreenProps> = ({ onTabChange, hasTrainedModel }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const { data: userModel, isLoading: modelLoading, error } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: !!user && isAuthenticated,
    retry: false,
    staleTime: 30 * 1000,
    queryFn: () => apiFetch('/user-model')
  });
  // Gallery and Favorites stats for Studio KPIs (real endpoints)
  const { data: galleryImagesData } = useQuery({
    queryKey: ['/api/gallery-images'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const data = await apiFetch('/gallery-images');
      return Array.isArray(data) ? data : (data?.images || []);
    }
  });
  const galleryImages = Array.isArray(galleryImagesData) ? galleryImagesData : [];

  const { data: favoritesData } = useQuery({
    queryKey: ['/api/images/favorites'],
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const favoritesCount = (favoritesData && typeof favoritesData === 'object' && 'favorites' in favoritesData)
    ? (favoritesData as any).favorites.length
    : 0;

  // Studio KPIs (live via serverless endpoint)
  const { data: kpis } = useQuery({
    queryKey: ['/api/studio/kpis'],
    enabled: isAuthenticated && !!user,
    staleTime: 30 * 1000,
    refetchInterval: 15 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => apiFetch('/studio/kpis')
  });
  const activeSessions = (kpis as any)?.activeSessions ?? 0;
  const queueCount = (kpis as any)?.queueCount ?? 0;

  // Recent Activity (live)
  const { data: activityData } = useQuery({
    queryKey: ['/api/studio/recent-activity'],
    enabled: isAuthenticated && !!user,
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => apiFetch('/studio/recent-activity')
  });
  const activities: Array<{ id: string; action: string; createdAt: string | Date }> = (activityData as any)?.activities ?? [];

  const formatRelative = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };


  // Helper functions
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'not_started': 'Not Started',
      'pending': 'Pending',
      'training': 'Training',
      'completed': 'Ready',
      'failed': 'Failed'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'completed': 'text-stone-900',
      'training': 'text-amber-600',
      'pending': 'text-stone-500',
      'failed': 'text-red-600',
      'not_started': 'text-stone-400'
    };
    return colorMap[status] || 'text-stone-500';
  };


  // Loading State
  if (authLoading || modelLoading) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <div className="w-16 h-16 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-600 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-stone-950 text-4xl font-serif font-extralight tracking-[0.4em] mb-4 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-stone-500">Loading Studio</p>
        </div>
      </div>
    );
  }

  // Not Authenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <Camera className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase mb-4">
            Sign In Required
          </h2>
          <p className="text-sm font-light text-stone-600 mb-8">
            Please sign in to access your studio
          </p>
        </div>
      </div>
    );
  }

  const trainingStatus = userModel?.trainingStatus || 'not_started';
  const isTrainedByModel = trainingStatus === 'completed';
  const isTrained = (typeof hasTrainedModel === 'boolean') ? !!hasTrainedModel : isTrainedByModel;
  const needsTraining = !isTrained;

  // Pixel-accurate artifact two-state layout
  if (needsTraining) {
    return (
      <div className="space-y-8 pb-4">
        {/* Header */}
        <div className="pt-3 sm:pt-4 md:pt-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-2 sm:mb-3">
            Welcome to Studio
          </h1>
          <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light text-stone-500">
            Start Here • Train Your AI Model
          </p>
        </div>

        {/* Primary Train Card */}
        <div className="bg-stone-100/50 border border-stone-200/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-white/60 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-white/80 shadow-lg shadow-stone-900/5">
            <Star size={36} className="text-stone-700" strokeWidth={1.8} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase mb-4">
            Train Your AI First
          </h2>

          <p className="text-base font-light text-stone-600 mb-8 max-w-md mx-auto leading-relaxed">
            Before you can create stunning photos, you need to train your personal AI model with your selfies. This takes about 20 minutes.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
            {[
              { label: 'Accurate', desc: 'Photos that look like you' },
              { label: 'Fast', desc: '20 minute training' },
              { label: 'Professional', desc: 'Gallery-ready results' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/50 backdrop-blur-2xl rounded-[1.5rem] border border-white/60 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:scale-[1.02] transition-all duration-300">
                <div className="w-14 h-14 bg-stone-950 rounded-[1.125rem] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-stone-900/30">
                  <div className="text-lg font-bold text-white">{i + 1}</div>
                </div>
                <div className="text-sm font-semibold text-stone-950 mb-2">{item.label}</div>
                <div className="text-xs font-medium text-stone-600">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={() => (onTabChange ? onTabChange('training') : setLocation('/training'))}
            className="group relative bg-stone-950 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-[1.25rem] font-semibold tracking-wide text-xs sm:text-sm transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/40 hover:scale-[1.02] active:scale-[0.98] min-h-[52px] sm:min-h-[60px] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start Training Now
              <ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>

        {/* What You'll Need Checklist */}
        <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-6">
            What You'll Need
          </h3>

          <div className="space-y-4">
            {[
              { title: '10-20 Selfie Photos', desc: 'Clear, well-lit photos of yourself' },
              { title: 'Good Lighting', desc: 'Natural window light works best' },
              { title: 'Variety', desc: 'Different angles and expressions' },
              { title: '20 Minutes', desc: 'Time for AI training to complete' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/60 shadow-lg shadow-stone-900/5">
                <div className="w-8 h-8 bg-gradient-to-br from-stone-100/80 to-stone-200/60 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/60 shadow-inner shadow-stone-900/5">
                  <div className="w-1.5 h-1.5 bg-stone-700 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-light text-stone-950 mb-1">{item.title}</h4>
                  <p className="text-xs font-light text-stone-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Trained state
  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <div className="pt-4 sm:pt-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-3">
          STUDIO
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">Creative Control Center</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Active', value: String(activeSessions), hint: 'Sessions' },
          { label: 'Ready', value: String(galleryImages.length), hint: 'Photos' },
          { label: 'Queue', value: String(queueCount), hint: 'Pending' },
        ].map((k, i) => (
          <div key={i} className="group relative bg-white/40 backdrop-blur-2xl border border-white/50 rounded-xl sm:rounded-[1.5rem] p-3 sm:p-5 md:p-6 hover:bg-white/60 transition-all duration-500 min-h-[95px] sm:min-h-[110px] md:min-h-[130px] flex flex-col justify-center shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:scale-[1.02] active:scale-[0.98]">
            {/* Status Indicator */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-stone-900 shadow-lg"></div>

            {/* Label */}
            <span className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold mb-2 sm:mb-3 text-stone-600">{k.label}</span>

            {/* Value */}
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-950 mb-1 sm:mb-2">{k.value}</span>

            {/* Description */}
            <span className="text-[10px] sm:text-xs font-medium text-stone-500">{k.hint}</span>
          </div>
        ))}
      </div>

      {/* Current Session */}
      <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <div className="text-xs tracking-[0.15em] uppercase font-light mb-3 text-stone-500">Current Session</div>
            <h3 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase">Executive Portrait</h3>
            <p className="text-sm font-light mt-3 text-stone-600">Professional series • 5 shots remaining</p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <div className="w-2 h-2 bg-stone-900 rounded-full"></div>
            <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-600">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="aspect-[4/3] bg-stone-200/40 rounded-2xl border border-stone-300/30 flex items-center justify-center group hover:bg-stone-200/60 transition-all duration-200 cursor-pointer">
            <Camera size={24} className="text-stone-500 group-hover:text-stone-700 transition-colors" strokeWidth={1.5} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="tracking-[0.1em] uppercase font-light text-stone-500">Progress</span>
              <span className="font-light text-stone-600">40%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div className="w-2/5 h-full bg-stone-700 rounded-full"></div>
            </div>
            <div className="space-y-3 pt-2">
              {[
                { name: 'Close-up headshot', done: true },
                { name: 'Half body shot', done: true },
                { name: 'Full scene', done: false },
              ].map((shot, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-light text-stone-600">{shot.name}</span>
                  <div className={`w-2 h-2 rounded-full ${shot.done ? 'bg-stone-900' : 'bg-stone-300'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="w-full bg-stone-950 text-stone-50 py-4 sm:py-5 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800 hover:transform hover:translate-y-[-1px] min-h-[52px] focus:outline-none focus:ring-2 focus:ring-stone-600/40">
          Continue Session
        </button>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[
          { icon: Plus, title: 'New Session', desc: 'Start fresh photo series', action: 'maya' },
          { icon: Grid, title: 'Browse Gallery', desc: 'View completed work', action: 'gallery' }
        ].map((action, index) => (
          <button
            key={index}
            type="button"
            onClick={() => (onTabChange ? onTabChange(action.action) : setLocation(action.action === 'maya' ? '/maya' : '/gallery'))}
            className="group relative bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[1.75rem] p-6 text-left hover:bg-white/60 hover:border-white/80 transition-all duration-300 min-h-[130px] flex flex-col justify-between shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-stone-950 rounded-[1.125rem] flex items-center justify-center shadow-lg">
                <action.icon size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="w-8 h-8 bg-white/60 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:bg-white/80 transition-all duration-300">
                <ChevronRight size={16} className="text-stone-600 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-base font-semibold text-stone-950 mb-2">{action.title}</h4>
              <p className="text-xs font-medium text-stone-600">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">Recent Activity</h3>
        <div className="space-y-1">
          {activities.length === 0 ? (
            <div className="text-xs text-stone-500 py-4 px-4">No recent activity</div>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0 hover:bg-stone-100/30 transition-colors duration-200 px-4 -mx-4 rounded-xl">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 bg-stone-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-light text-stone-950 truncate">{item.action}</span>
                </div>
                <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500 ml-4 flex-shrink-0">{formatRelative(item.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioScreen;

