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
      {/* Hero Section - WelcomeHeader + Status */}
      <div className="pt-4 sm:pt-6">
        <WelcomeHeader />
        
        {/* Status Indicator - Prominently displayed */}
        <div className="mt-6 bg-stone-100/50 border border-stone-200/40 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
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
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="tracking-[0.1em] uppercase font-light text-stone-500">Progress</span>
                <span className="font-light text-stone-600">Processing...</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="w-3/5 h-full bg-stone-700 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Guide - Numbered Steps */}
      <div>
        <QuickAccessPanel onTabChange={onTabChange} />
      </div>

      {/* Moodboard Inspiration Section */}
      {userModel?.trainingStatus === 'completed' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-extralight tracking-[0.2em] text-stone-950 uppercase mb-2">
              Get Inspired
            </h2>
            <p className="text-sm font-light text-stone-600">
              Explore styles and see what's possible with your AI model
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {(() => {
              // Maya's rotating daily tips - changes based on day of year
              const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
              const tipRotation = [
                { 
                  title: 'Golden Hour Glow', 
                  image: 'https://i.postimg.cc/Y9xDCmzs/Lovephotography.jpg',
                  tip: 'Create warm, golden hour portraits with soft natural lighting that makes your skin glow beautifully.'
                },
                { 
                  title: 'Bold Creative', 
                  image: 'https://i.postimg.cc/mD464SCd/42.jpg',
                  tip: 'Express your artistic side with dramatic angles, creative compositions, and unique perspectives.'
                },
                { 
                  title: 'Authentic Moments', 
                  image: 'https://i.postimg.cc/NMtPtxmS/45.jpg',
                  tip: 'Capture genuine, candid moments that show your true personality in natural settings.'
                },
                { 
                  title: 'Fashion Forward', 
                  image: 'https://i.postimg.cc/bJPFPRkM/47.jpg',
                  tip: 'Strike a pose with high-fashion editorial styling, dramatic lighting, and model-worthy compositions.'
                }
              ];
              
              // Rotate tips based on day, ensuring different combination each day
              const shuffledTips = [...tipRotation].sort(() => (dayOfYear % 7) - 3.5);
              
              return shuffledTips.map((inspiration, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    // Navigate to Maya chat with the daily tip
                    const tipPrompt = `Maya, I love your daily tip: "${inspiration.tip}" Can you help me create these kinds of photos?`;
                    onTabChange?.('maya');
                    setLocation(`/sselfie-app?tab=maya&prompt=${encodeURIComponent(tipPrompt)}`);
                  }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-stone-200/40 bg-stone-100/40 cursor-pointer hover:border-stone-300/60 transition-all duration-200 hover:scale-[1.02]"
                >
                  <img 
                    src={inspiration.image} 
                    alt={inspiration.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-950/20 to-stone-950/80"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-sm font-serif font-extralight tracking-[0.1em] text-stone-50 uppercase mb-1">
                      {inspiration.title}
                    </h4>
                    <p className="text-xs text-stone-200 font-light opacity-90 leading-tight">
                      Maya's Tip
                    </p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-stone-50/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Camera size={12} className="text-stone-50" strokeWidth={1.5} />
                    </div>
                  </div>
                </button>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Action Buttons Section */}
      <div className="bg-stone-100/50 border border-stone-200/40 rounded-3xl p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-2">
            Ready to Create
          </h3>
          <p className="text-sm font-light text-stone-600">
            {userModel?.trainingStatus === 'completed' ? 'Your AI model is ready to generate beautiful images' : 'Complete training to start generating'}
          </p>
        </div>

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
          <div className="space-y-6">
            {/* Inline Style Selector */}
            <div>
              <h4 className="text-base font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-4">
                Choose Your Style
              </h4>
              <div className="h-48 overflow-y-auto space-y-3 pr-2">
                {[
                  { id: 'professional', title: '1. Professional', description: 'Clean, business-ready' },
                  { id: 'creative', title: '2. Creative', description: 'Artistic, unique angles' },
                  { id: 'lifestyle', title: '3. Lifestyle', description: 'Natural, everyday moments' },
                  { id: 'editorial', title: '4. Editorial', description: 'Fashion-forward' },
                  { id: 'headshot', title: '5. Headshot', description: 'Classic portraits' },
                  { id: 'casual', title: '6. Casual', description: 'Relaxed, authentic' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSelectedStyle(style);
                      // Navigate to Maya chat with the selected style
                      const stylePrompt = `I'd like to create ${style.title.toLowerCase()} style images. ${style.description}. Can you help me generate some amazing photos in this style?`;
                      onTabChange?.('maya');
                      setLocation(`/sselfie-app?tab=maya&prompt=${encodeURIComponent(stylePrompt)}`);
                    }}
                    className={`w-full p-4 rounded-2xl border transition-all duration-200 text-left ${
                      selectedStyle?.id === style.id
                        ? 'bg-stone-200/60 border-stone-300/60'
                        : 'bg-stone-100/40 border-stone-200/40 hover:bg-stone-100/60 hover:border-stone-300/50'
                    }`}
                  >
                    <div className="text-sm font-serif font-extralight tracking-[0.1em] text-stone-950 uppercase mb-1">
                      {style.title}
                    </div>
                    <div className="text-xs font-light text-stone-600">
                      {style.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>



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



      {/* Collapsible Stats & Model Information */}
      <div className="bg-stone-100/40 border border-stone-200/40 rounded-2xl p-6">
        <details className="group">
          <summary className="cursor-pointer flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase">
                Statistics & Details
              </h3>
              <p className="text-sm font-light text-stone-600 mt-1">
                View usage stats and model information
              </p>
            </div>
            <div className="ml-4 transition-transform duration-200 group-open:rotate-180">
              <Plus size={20} className="text-stone-600" strokeWidth={1.5} />
            </div>
          </summary>
          
          <div className="mt-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-stone-100/60 rounded-2xl border border-stone-200/40">
                <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Status</div>
                <div className="text-2xl font-serif font-extralight text-stone-950 mb-1">
                  {userModel?.trainingStatus === 'completed' ? '✓' : '○'}
                </div>
                <div className="text-xs font-light text-stone-600">{getStatusText(userModel?.trainingStatus || 'not_started')}</div>
              </div>
              <div className="text-center p-4 bg-stone-100/60 rounded-2xl border border-stone-200/40">
                <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Used</div>
                <div className="text-2xl font-serif font-extralight text-stone-950 mb-1">
                  {user.generationsUsedThisMonth || 0}
                </div>
                <div className="text-xs font-light text-stone-600">This Month</div>
              </div>
              <div className="text-center p-4 bg-stone-100/60 rounded-2xl border border-stone-200/40">
                <div className="text-xs tracking-[0.15em] uppercase font-light mb-2 text-stone-500">Limit</div>
                <div className="text-2xl font-serif font-extralight text-stone-950 mb-1">
                  {user.monthlyGenerationLimit === -1 ? '∞' : user.monthlyGenerationLimit || 100}
                </div>
                <div className="text-xs font-light text-stone-600">Per Month</div>
              </div>
            </div>

            {/* Model Information */}
            <div>
              <h4 className="text-base font-serif font-extralight tracking-[0.15em] text-stone-950 uppercase mb-4">Model Information</h4>
              <div className="space-y-1">
                {userModel && (
                  <>
                    <div className="flex items-center justify-between py-3 border-b border-stone-200/30 last:border-b-0">
                      <span className="text-sm font-light text-stone-950">Training Status</span>
                      <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500">
                        {getStatusText(userModel.trainingStatus)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-stone-200/30 last:border-b-0">
                      <span className="text-sm font-light text-stone-950">Model Type</span>
                      <span className="text-xs tracking-[0.1em] uppercase font-light text-stone-500">
                        {userModel.modelType || 'Standard'}
                      </span>
                    </div>
                    {userModel.createdAt && (
                      <div className="flex items-center justify-between py-3 border-b border-stone-200/30 last:border-b-0">
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
        </details>
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


    </div>
  );
};

export default StudioScreen;
