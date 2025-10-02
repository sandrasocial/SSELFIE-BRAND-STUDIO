import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import { apiFetch } from '../lib/api.js';
import { WelcomeHeader } from '../components/WelcomeHeader.js';
import { StyleSelector } from '../components/StyleSelector.js';
import QuickAccessPanel from '../components/QuickAccessPanel.js';
import GeneratedImagePreview from '../components/GeneratedImagePreview.js';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Settings,
  RefreshCw,
  Plus
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

interface StudioScreenProps {
  onTabChange?: (tabId: string) => void;
}

const StudioScreen: React.FC<StudioScreenProps> = ({ onTabChange }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showStyleSelector, setShowStyleSelector] = useState(false);

  const { data: userModel, isLoading: modelLoading, error } = useQuery<UserModel>({
    queryKey: ['/api/user-model'],
    enabled: !!user && isAuthenticated,
    retry: false,
    staleTime: 30 * 1000,
    queryFn: () => apiFetch('/user-model')
  });

  if (authLoading || modelLoading) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <div className="w-16 h-16 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-600 rounded-full"></div>
          </div>
          <h1 className="text-stone-950 text-4xl font-serif font-extralight tracking-[0.4em] mb-4 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-stone-500">Loading Studio</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <Camera className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase mb-2">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to access your studio</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-4 pt-4 sm:pt-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-extralight tracking-[0.3em] text-stone-950 uppercase mb-2">Unable to Load Studio</h2>
          <p className="text-stone-600 mb-4 font-light">We're having trouble connecting to your studio data.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-stone-950 text-stone-50 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-stone-900" strokeWidth={1.5} />;
      case 'training':
      case 'pending':
        return <Clock className="h-6 w-6 text-stone-600 animate-pulse" strokeWidth={1.5} />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" strokeWidth={1.5} />;
      default:
        return <Settings className="h-6 w-6 text-stone-400" strokeWidth={1.5} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Model Ready';
      case 'training':
        return 'Training in Progress';
      case 'pending':
        return 'Training Queued';
      case 'failed':
        return 'Training Failed';
      default:
        return 'Not Started';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Your AI model is trained and ready to generate beautiful images';
      case 'training':
        return 'Your AI model is currently training. This usually takes 15-20 minutes';
      case 'pending':
        return 'Your training request is in the queue and will begin shortly';
      case 'failed':
        return 'Training encountered an issue. Please try training again';
      default:
        return 'Train your personal AI model to start generating images';
    }
  };

  return (
    <div className="space-y-8 pb-4">
      {/* WelcomeHeader Component */}
      <div className="pt-4 sm:pt-6">
        <WelcomeHeader />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        <div className="relative overflow-hidden bg-stone-100/60 border border-stone-200/40 rounded-2xl p-4 sm:p-6 hover:bg-stone-100/80 transition-all duration-200 min-h-[90px] sm:min-h-[110px] flex flex-col justify-center">
          <div className="relative z-10">
            <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Status</div>
            <div className="text-2xl sm:text-3xl font-serif font-extralight text-stone-950 mb-1">
              {userModel?.trainingStatus === 'completed' ? '✓' : '○'}
            </div>
            <div className="text-xs font-light text-stone-600">{getStatusText(userModel?.trainingStatus || 'not_started')}</div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-stone-100/60 border border-stone-200/40 rounded-2xl p-4 sm:p-6 hover:bg-stone-100/80 transition-all duration-200 min-h-[90px] sm:min-h-[110px] flex flex-col justify-center">
          <div className="relative z-10">
            <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Used</div>
            <div className="text-2xl sm:text-3xl font-serif font-extralight text-stone-950 mb-1">
              {user.generationsUsedThisMonth || 0}
            </div>
            <div className="text-xs font-light text-stone-600">This Month</div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-stone-100/60 border border-stone-200/40 rounded-2xl p-4 sm:p-6 hover:bg-stone-100/80 transition-all duration-200 min-h-[90px] sm:min-h-[110px] flex flex-col justify-center">
          <div className="relative z-10">
            <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Limit</div>
            <div className="text-2xl sm:text-3xl font-serif font-extralight text-stone-950 mb-1">
              {user.monthlyGenerationLimit === -1 ? '∞' : user.monthlyGenerationLimit || 100}
            </div>
            <div className="text-xs font-light text-stone-600">Per Month</div>
          </div>
        </div>
      </div>

      {/* QuickAccessPanel Component */}
      <div>
        <QuickAccessPanel onTabChange={onTabChange} />
      </div>

      {/* Main Session Panel */}
      <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <div className="text-xs tracking-[0.15em] uppercase font-light mb-3 text-stone-500">Current Status</div>
            <h3 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase mb-3">
              {getStatusText(userModel?.trainingStatus || 'not_started')}
            </h3>
            <p className="text-sm font-light text-stone-600">{getStatusDescription(userModel?.trainingStatus || 'not_started')}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            {getStatusIcon(userModel?.trainingStatus || 'not_started')}
          </div>
        </div>

        {/* Progress indicator for training status */}
        {(userModel?.trainingStatus === 'training' || userModel?.trainingStatus === 'pending') && (
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="tracking-[0.1em] uppercase font-light text-stone-500">Progress</span>
              <span className="font-light text-stone-600">Processing...</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div className="w-3/5 h-full bg-stone-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {userModel?.needsTraining && (
          <button
            onClick={() => setLocation('/simple-training')}
            disabled={userModel.trainingStatus === 'training' || userModel.trainingStatus === 'pending'}
            className="w-full bg-stone-950 text-stone-50 py-4 sm:py-5 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800 hover:transform hover:translate-y-[-1px] min-h-[52px] focus:outline-none focus:ring-2 focus:ring-stone-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Zap size={18} strokeWidth={1.5} />
            {userModel.trainingStatus === 'failed' ? 'Retry Training' : 'Train Your Model'}
          </button>
        )}

        {userModel?.trainingStatus === 'completed' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowStyleSelector(true)}
              className="w-full bg-stone-950 text-stone-50 py-4 sm:py-5 rounded-2xl font-light tracking-[0.15em] uppercase text-sm transition-all duration-200 hover:bg-stone-800 hover:transform hover:translate-y-[-1px] min-h-[52px] focus:outline-none focus:ring-2 focus:ring-stone-600/40 flex items-center justify-center gap-2"
            >
              <Play size={18} strokeWidth={1.5} />
              Start Generating
            </button>

            {userModel?.canRetrain && (
              <button
                onClick={() => setLocation('/simple-training')}
                className="w-full bg-stone-100/50 text-stone-950 py-4 sm:py-5 rounded-2xl font-light tracking-[0.15em] uppercase text-sm border border-stone-200/40 transition-all duration-200 hover:bg-stone-100/70 hover:border-stone-300/50 min-h-[52px] flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} strokeWidth={1.5} />
                Retrain Model
              </button>
            )}
          </div>
        )}
      </div>



      {/* Activity Log */}
      <div className="space-y-6">
        <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">Model Information</h3>
        <div className="space-y-1">
          {userModel && (
            <>
              <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0 hover:bg-stone-100/30 transition-colors duration-200 px-4 -mx-4 rounded-xl">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 bg-stone-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-light text-stone-950 truncate">Training Status</span>
                </div>
                <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500 ml-4 flex-shrink-0">
                  {getStatusText(userModel.trainingStatus)}
                </span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0 hover:bg-stone-100/30 transition-colors duration-200 px-4 -mx-4 rounded-xl">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 bg-stone-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-light text-stone-950 truncate">Model Type</span>
                </div>
                <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500 ml-4 flex-shrink-0">
                  {userModel.modelType || 'Standard'}
                </span>
              </div>
              {userModel.createdAt && (
                <div className="flex items-center justify-between py-4 border-b border-stone-200/30 last:border-b-0 hover:bg-stone-100/30 transition-colors duration-200 px-4 -mx-4 rounded-xl">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-1.5 h-1.5 bg-stone-600 rounded-full flex-shrink-0"></div>
                    <span className="text-sm font-light text-stone-950 truncate">Created</span>
                  </div>
                  <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500 ml-4 flex-shrink-0">
                    {new Date(userModel.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Generated Images Section */}
      {generatedImages.length > 0 && (
        <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase">
              Generated Images
            </h3>
            <span className="text-xs tracking-[0.15em] uppercase font-light text-stone-500">
              {generatedImages.length} Images
            </span>
          </div>
          <GeneratedImagePreview
            imageUrls={generatedImages}
            isLoading={false}
            concept={{
              title: "Studio Generated Images",
              description: "Images generated through the studio interface"
            }}
            onSave={(urls) => console.log('Saving images:', urls)}
          />
        </div>
      )}

      {/* StyleSelector Modal */}
      {showStyleSelector && (
        <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-extralight tracking-[0.2em] uppercase text-stone-950 mb-2">
                  Choose Your Style
                </h2>
                <p className="text-stone-600 font-light">Select a photography style for your professional photos</p>
              </div>
              <button
                onClick={() => setShowStyleSelector(false)}
                className="p-3 hover:bg-stone-100 rounded-2xl transition-colors"
              >
                <Plus size={20} className="text-stone-600 rotate-45" strokeWidth={1.5} />
              </button>
            </div>
            
            <StyleSelector
              onStyleSelect={(style) => {
                setSelectedStyle(style);
                setShowStyleSelector(false);
                // Navigate to generation page with selected style
                setLocation(`/ai-generator?style=${style.id}`);
              }}
              selectedStyleId={selectedStyle?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioScreen;
