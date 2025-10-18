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
        <div className="pt-4 sm:pt-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-3">
            Welcome to Studio
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">Start Here • Train Your AI Model</p>
        </div>

        {/* Primary Train Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/60 bg-white/60 backdrop-blur-2xl shadow-2xl shadow-stone-900/20 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[1rem] bg-white/60 backdrop-blur-xl border border-white/70 flex items-center justify-center text-stone-700">
              <Star className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="font-serif font-extralight uppercase tracking-[0.2em] text-stone-950 leading-none text-2xl mb-2">
                Train Your AI First
              </div>
              <div className="text-stone-600 text-sm mb-4">
                Upload 15–20 selfies to create your personal LoRA model. This unlocks professional photos tailored to you.
              </div>
              <button
                type="button"
                onClick={() => (onTabChange ? onTabChange('training') : setLocation('/training'))}
                className="group relative bg-stone-950 text-white font-semibold tracking-[0.15em] uppercase rounded-2xl px-6 py-3 text-xs hover:shadow-2xl hover:shadow-stone-900/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Start Training Now
                <ChevronRight className="inline w-4 h-4 ml-2 align-middle" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[{t:'Accurate',d:'Looks like you'},{t:'Fast',d:'Ready in minutes'},{t:'Professional',d:'Editorial quality'}].map((b,i)=> (
            <div key={i} className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl p-4 sm:p-5">
              <div className="text-[10px] tracking-[0.15em] uppercase font-light text-stone-500 mb-2">{String(i+1).padStart(2,'0')}</div>
              <div className="text-base font-serif font-extralight text-stone-950 mb-1">{b.t}</div>
              <div className="text-xs text-stone-600">{b.d}</div>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="rounded-2xl sm:rounded-3xl bg-stone-100/50 border border-stone-200/40 p-6 sm:p-8">
          <div className="text-xs tracking-[0.2em] uppercase font-light text-stone-500 mb-4">What You'll Need</div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[ '10–20 Selfie Photos', 'Good Lighting', 'Variety of Angles', 'About 20 Minutes' ].map((item,idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-stone-600 rounded-full"></div>
                <span className="text-sm font-light text-stone-950">{item}</span>
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
          <div key={i} className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-stone-600 rounded-full"></div>
                <span className="text-[10px] tracking-[0.15em] uppercase font-light text-stone-500">{k.label}</span>
              </div>
              <span className="text-2xl sm:text-3xl font-serif font-extralight text-stone-950 leading-none">{k.value}</span>
            </div>
            <div className="text-xs text-stone-500">{k.hint}</div>
          </div>
        ))}
      </div>

      {/* Current Session */}
      <div className="rounded-2xl sm:rounded-3xl bg-stone-100/50 border border-stone-200/40 overflow-hidden">
        <div className="flex items-start gap-4 p-6 sm:p-8">
          <div className="w-1.5 h-12 bg-stone-600 rounded-full mt-1"></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase truncate">Current Session</h3>
              <span className="text-[10px] tracking-[0.15em] uppercase font-light text-stone-500">Live</span>
            </div>
            <div className="text-sm text-stone-600 mb-4 truncate">Executive Portrait • Editorial • Natural Light</div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[ 'Mood', 'Frames', 'Looks' ].map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/50 border border-white/60">
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-stone-600 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm font-light text-stone-950 truncate">{s}</span>
                  <span className="text-[10px] sm:text-xs tracking-[0.1em] uppercase font-light text-stone-500 ml-auto flex-shrink-0">{['3/5','6/12','2/4'][idx]}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div className="h-full bg-stone-900 rounded-full" style={{ width: '40%' }} />
              </div>
              <div className="mt-2 text-xs text-stone-500">Progress • 40%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => (onTabChange ? onTabChange('maya') : setLocation('/maya'))}
          className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-2xl p-6 sm:p-8 text-left hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 bg-stone-600 rounded-full"></div>
            <span className="text-[10px] tracking-[0.15em] uppercase font-light text-stone-500">Action</span>
          </div>
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-stone-700" strokeWidth={1.5} />
            <span className="text-base font-serif font-extralight text-stone-950">New Session</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => (onTabChange ? onTabChange('gallery') : setLocation('/gallery'))}
          className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-2xl p-6 sm:p-8 text-left hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 bg-stone-600 rounded-full"></div>
            <span className="text-[10px] tracking-[0.15em] uppercase font-light text-stone-500">Browse</span>
          </div>
          <div className="flex items-center gap-3">
            <Grid className="w-5 h-5 text-stone-700" strokeWidth={1.5} />
            <span className="text-base font-serif font-extralight text-stone-950">Browse Gallery</span>
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl sm:rounded-3xl bg-stone-100/50 border border-stone-200/40 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase">Recent Activity</h3>
          <span className="text-[10px] tracking-[0.15em] uppercase font-light text-stone-500">Today</span>
        </div>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-xs text-stone-500">No recent activity</div>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-stone-600 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm font-light text-stone-950 truncate">{item.action}</span>
                </div>
                <span className="text-[10px] sm:text-xs tracking-[0.1em] uppercase font-light text-stone-500 ml-3 sm:ml-4 flex-shrink-0">{formatRelative(item.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioScreen;

