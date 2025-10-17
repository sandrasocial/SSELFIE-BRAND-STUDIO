import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import { apiFetch } from '../lib/api.js';
import { WelcomeHeader } from '../components/WelcomeHeader.js';
import QuickAccessPanel from '../components/QuickAccessPanel.js';
import GeneratedImagePreview from '../components/GeneratedImagePreview.js';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  RefreshCw,
  Camera,
  Plus,
  ChevronDown
} from 'lucide-react';

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
}

// @ts-ignore - FC type compatibility with JSX.Element
const StudioScreen: React.FC<StudioScreenProps> = ({ onTabChange }) => {
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

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-stone-900" strokeWidth={1.5} />;
      case 'training':
        return <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" strokeWidth={1.5} />;
      case 'pending':
        return <Clock className="w-5 h-5 text-stone-500" strokeWidth={1.5} />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={1.5} />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-stone-300" />;
    }
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
  const needsTraining = trainingStatus === 'not_started' || trainingStatus === 'failed';

  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <div className="pt-4 sm:pt-6 text-center">
        <h1 className="text-3xl sm:text-5xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase leading-none mb-3">
          STUDIO
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase font-light text-stone-500">
          Your Creative Hub
        </p>
      </div>

      {/* Welcome Component - Works with or without props */}
      <WelcomeHeader onTabChange={onTabChange} />

      {/* Status Overview Cards - ENHANCED HIERARCHY */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Training Status - PRIMARY EMPHASIS */}
        <div className="col-span-3 sm:col-span-1 bg-gradient-to-br from-stone-100/80 to-stone-100/40 border border-stone-200/60 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-stone-300/80 transition-all duration-300 shadow-sm hover:shadow-md min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs tracking-[0.15em] uppercase font-light text-stone-500">Status</div>
            {getStatusIcon(trainingStatus)}
          </div>
          <div>
            <div className={`text-3xl sm:text-4xl font-serif font-extralight mb-2 ${getStatusColor(trainingStatus)}`}>
              {getStatusText(trainingStatus)}
            </div>
            <div className="text-xs font-light text-stone-600">
              {trainingStatus === 'completed' ? 'Model Active' : 'Training Required'}
            </div>
          </div>
        </div>

        {/* Used This Month */}
        <div className="bg-stone-100/50 border border-stone-200/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:bg-stone-100/70 hover:border-stone-200/60 transition-all duration-200 min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
          <div className="text-xs tracking-[0.15em] uppercase font-light mb-4 text-stone-500">Used</div>
          <div>
            <div className="text-3xl sm:text-4xl font-serif font-extralight text-stone-950 mb-2">
              {user.generationsUsedThisMonth || 0}
            </div>
            <div className="text-xs font-light text-stone-600">This Month</div>
          </div>
        </div>

        {/* Monthly Limit */}
        <div className="bg-stone-100/50 border border-stone-200/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:bg-stone-100/70 hover:border-stone-200/60 transition-all duration-200 min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
          <div className="text-xs tracking-[0.15em] uppercase font-light mb-4 text-stone-500">Limit</div>
          <div>
            <div className="text-3xl sm:text-4xl font-serif font-extralight text-stone-950 mb-2">
              {user.monthlyGenerationLimit === -1 ? '∞' : user.monthlyGenerationLimit || 100}
            </div>
            <div className="text-xs font-light text-stone-600">Per Month</div>
          </div>
        </div>
      </div>

      {/* Primary CTA Section - CLEAR HIERARCHY */}
      {needsTraining ? (
        <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border border-stone-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg">
          <div className="mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-stone-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-50 uppercase mb-3">
              Start Your Journey
            </h3>
            <p className="text-sm font-light text-stone-300 max-w-md mx-auto">
              Train your AI model with 15 selfies to unlock professional photos
            </p>
          </div>
          <button
            onClick={() => setLocation('/training')}
            className="w-full sm:w-auto bg-stone-50 hover:bg-stone-100 text-stone-950 px-8 py-4 rounded-xl font-light tracking-[0.2em] uppercase text-sm transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg min-h-[56px]"
          >
            Begin Training
          </button>
        </div>
      ) : (
        <QuickAccessPanel onTabChange={onTabChange} />
      )}

      {/* Expandable Details Section - IMPROVED AFFORDANCE */}
      <div className="bg-stone-100/50 border border-stone-200/40 rounded-2xl sm:rounded-3xl overflow-hidden">
        <button
          onClick={() => setDetailsExpanded(!detailsExpanded)}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-stone-100/70 transition-colors duration-200 min-h-[64px]"
          aria-expanded={detailsExpanded}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-stone-600" strokeWidth={1.5} />
            <span className="text-base font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">
              Model Details
            </span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-stone-600 transition-transform duration-300 ${
              detailsExpanded ? 'rotate-180' : ''
            }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Expanded Content */}
        {detailsExpanded && (
          <div className="px-6 pb-6 space-y-6 border-t border-stone-200/30">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-6">
              <div className="text-center p-4 bg-stone-200/30 rounded-xl border border-stone-300/30">
                <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Status</div>
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon(trainingStatus)}
                </div>
                <div className="text-xs font-light text-stone-600">{getStatusText(trainingStatus)}</div>
              </div>
              <div className="text-center p-4 bg-stone-200/30 rounded-xl border border-stone-300/30">
                <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Used</div>
                <div className="text-2xl font-serif font-extralight text-stone-950 mb-1">
                  {user.generationsUsedThisMonth || 0}
                </div>
                <div className="text-xs font-light text-stone-600">This Month</div>
              </div>
              <div className="text-center p-4 bg-stone-200/30 rounded-xl border border-stone-300/30">
                <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Limit</div>
                <div className="text-2xl font-serif font-extralight text-stone-950 mb-1">
                  {user.monthlyGenerationLimit === -1 ? '∞' : user.monthlyGenerationLimit || 100}
                </div>
                <div className="text-xs font-light text-stone-600">Per Month</div>
              </div>
            </div>

            {/* Model Information */}
            <div>
              <h4 className="text-base font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-4">
                Model Information
              </h4>
              <div className="space-y-1">
                {userModel && (
                  <>
                    <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0 min-h-[56px]">
                      <span className="text-sm font-light text-stone-950">Training Status</span>
                      <span className={`text-xs tracking-[0.1em] uppercase font-light ${getStatusColor(trainingStatus)}`}>
                        {getStatusText(userModel.trainingStatus)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0 min-h-[56px]">
                      <span className="text-sm font-light text-stone-950">Model Type</span>
                      <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500">
                        {userModel.modelType || 'Standard'}
                      </span>
                    </div>
                    {userModel.createdAt && (
                      <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0 min-h-[56px]">
                        <span className="text-sm font-light text-stone-950">Created</span>
                        <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500">
                          {new Date(userModel.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Images Section */}
      {generatedImages.length > 0 && (
        <div className="bg-stone-100/50 border border-stone-200/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase">
              Generated Images
            </h3>
            <span className="text-xs tracking-[0.15em] uppercase font-light text-stone-500">
              {generatedImages.length} {generatedImages.length === 1 ? 'Image' : 'Images'}
            </span>
          </div>
          <GeneratedImagePreview
            imageUrls={generatedImages}
            isLoading={false}
            concept={{
              title: "Studio Generated Images",
              description: "Images generated through the studio interface"
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StudioScreen;