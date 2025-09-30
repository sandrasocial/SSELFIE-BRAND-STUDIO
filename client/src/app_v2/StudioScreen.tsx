import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth.js';
import { useToast } from '../hooks/use-toast.js';
import { apiFetch } from '../lib/api.js';
import { 
  Camera, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Settings,
  Sparkles,
  ArrowRight,
  RefreshCw
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

const StudioScreen: React.FC = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user model status
  const { data: userModel, isLoading: modelLoading, error } = useQuery<UserModel>({
    queryKey: ['/api/user-model'],
    enabled: !!user && isAuthenticated,
    retry: false,
    staleTime: 30 * 1000,
    queryFn: () => apiFetch('/user-model')
  });

  const handleTrainModel = () => {
    setLocation('/onboarding/simple-training');
  };

  const handleStartGenerating = () => {
    setLocation('/ai-generator');
  };

  if (authLoading || modelLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border border-stone-300 rounded-full animate-spin mx-auto mb-8 flex items-center justify-center">
            <div className="w-3 h-3 bg-stone-600 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-stone-900 text-4xl font-serif font-thin tracking-[0.5em] mb-6 leading-none">SSELFIE</h1>
          <p className="text-xs font-light tracking-[0.4em] uppercase text-stone-500 opacity-70">Loading Studio</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-16 w-16 text-stone-400 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-thin text-stone-900 mb-2 tracking-[0.3em] uppercase">Authentication Required</h2>
          <p className="text-stone-600 font-light">Please sign in to access your studio</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-serif font-thin text-stone-900 mb-2 tracking-[0.3em] uppercase">Unable to Load Studio</h2>
          <p className="text-stone-600 mb-4 font-light">We're having trouble connecting to your studio data.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
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
        return <CheckCircle className="h-6 w-6 text-green-500" strokeWidth={1} />;
      case 'training':
      case 'pending':
        return <Clock className="h-6 w-6 text-amber-500" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Settings className="h-6 w-6 text-stone-400" />;
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
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-stone-900 rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-stone-900">Creative Studio</h1>
              <p className="text-stone-600">Your personal AI photography studio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Model Status Card */}
        <div className="bg-white rounded-lg border border-stone-200 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            {getStatusIcon(userModel?.trainingStatus || 'not_started')}
            <div>
              <h2 className="text-lg font-medium text-stone-900">
                {getStatusText(userModel?.trainingStatus || 'not_started')}
              </h2>
              <p className="text-stone-600 text-sm">
                {getStatusDescription(userModel?.trainingStatus || 'not_started')}
              </p>
            </div>
          </div>

          {/* Progress indicator for training status */}
          {(userModel?.trainingStatus === 'training' || userModel?.trainingStatus === 'pending') && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
                <span className="text-sm font-medium text-stone-700">
                  {userModel.trainingStatus === 'training' ? 'Training...' : 'In Queue...'}
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {userModel?.needsTraining && (
              <button
                onClick={handleTrainModel}
                disabled={userModel.trainingStatus === 'training' || userModel.trainingStatus === 'pending'}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="h-4 w-4" />
                {userModel.trainingStatus === 'failed' ? 'Retry Training' : 'Train Your Model'}
              </button>
            )}

            {userModel?.trainingStatus === 'completed' && (
              <button
                onClick={handleStartGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <Play className="h-4 w-4" />
                Start Generating
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {userModel?.canRetrain && userModel?.trainingStatus === 'completed' && (
              <button
                onClick={handleTrainModel}
                className="flex items-center gap-2 px-4 py-3 text-stone-700 bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Retrain Model
              </button>
            )}
          </div>
        </div>

        {/* AI Generation Interface - Only show when model is ready */}
        {userModel?.trainingStatus === 'completed' ? (
          <StudioGenerationInterface />
        ) : (
          // Features Grid for training setup
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Studio */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900">Photo Studio</h3>
                <p className="text-sm text-stone-600">Professional headshots & lifestyle images</p>
              </div>
            </div>
            <button
              onClick={handleTrainModel}
              disabled={userModel?.trainingStatus === 'training' || userModel?.trainingStatus === 'pending'}
              className="w-full px-4 py-2 text-sm font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              Train Model First
            </button>
          </div>

          {/* Video Studio */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900">Video Studio</h3>
                <p className="text-sm text-stone-600">Cinematic video content (Coming Soon)</p>
              </div>
            </div>
            <button
              disabled
              className="w-full px-4 py-2 text-sm font-medium text-stone-400 bg-stone-50 border border-stone-200 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          {/* AI Coaching */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900">Maya AI</h3>
                <p className="text-sm text-stone-600">Personal brand strategist</p>
              </div>
            </div>
            <button
              onClick={() => setLocation('/maya')}
              className="w-full px-4 py-2 text-sm font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Chat with Maya
            </button>
          </div>

          {/* Account & Usage */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <h3 className="font-medium text-stone-900">Account</h3>
                <p className="text-sm text-stone-600">Usage: {user.generationsUsedThisMonth || 0}/{user.monthlyGenerationLimit === -1 ? '∞' : user.monthlyGenerationLimit || 100}</p>
              </div>
            </div>
            <button
              onClick={() => setLocation('/account-settings')}
              className="w-full px-4 py-2 text-sm font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Manage Account
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

// AI Generation Interface Component
const StudioGenerationInterface: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Sample prompts for AI generation
  const prompts = [
    { 
      id: 'professional', 
      title: 'Professional Headshot',
      description: 'Clean, business-ready portraits',
      prompt: 'professional corporate headshot, business attire, clean background'
    },
    { 
      id: 'editorial', 
      title: 'Editorial Style',
      description: 'Magazine-quality fashion shots',
      prompt: 'editorial fashion portrait, dramatic lighting, artistic composition'
    },
    { 
      id: 'lifestyle', 
      title: 'Lifestyle Portrait',
      description: 'Natural, authentic moments',
      prompt: 'lifestyle portrait, natural lighting, authentic expression'
    },
    { 
      id: 'creative', 
      title: 'Creative Portrait',
      description: 'Artistic and unique angles',
      prompt: 'creative portrait, artistic lighting, unique composition'
    }
  ];

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setSelectedPrompt(prompt);
    
    try {
      // Simulated API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated images
      const mockImages = [
        'https://picsum.photos/400/400?random=1',
        'https://picsum.photos/400/400?random=2',
        'https://picsum.photos/400/400?random=3',
        'https://picsum.photos/400/400?random=4'
      ];
      
      setGeneratedImages(mockImages);
      toast({
        title: "Images Generated",
        description: "Your AI photoshoot is complete!"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again later."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Style Selection */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="text-lg font-medium text-stone-900 mb-4">Choose Your Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prompts.map((promptOption) => (
            <button
              key={promptOption.id}
              onClick={() => handleGenerate(promptOption.prompt)}
              disabled={isGenerating}
              className="p-4 text-left border border-stone-200 rounded-lg hover:border-stone-400 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h4 className="font-medium text-stone-900 mb-1">{promptOption.title}</h4>
              <p className="text-sm text-stone-600">{promptOption.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="bg-white rounded-lg border border-stone-200 p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-stone-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">Generating Your Photos</h3>
          <p className="text-stone-600">Creating professional AI images with your selected style...</p>
          <div className="mt-4">
            <div className="w-full bg-stone-200 rounded-full h-2">
              <div className="bg-stone-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h3 className="text-lg font-medium text-stone-900 mb-4">Your Generated Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {generatedImages.map((imageUrl, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden border border-stone-200">
                <img 
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors">
              <ArrowRight className="h-4 w-4" />
              Save to Gallery
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-stone-700 bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Generate More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioScreen;
