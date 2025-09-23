import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { apiFetch } from '../lib/api';
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
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-stone-600">Loading studio...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-12 w-12 text-stone-400 mx-auto mb-4" />
          <h2 className="text-xl font-light text-stone-900 mb-2">Authentication Required</h2>
          <p className="text-stone-600">Please sign in to access your studio</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-light text-stone-900 mb-2">Unable to Load Studio</h2>
          <p className="text-stone-600 mb-4">We're having trouble connecting to your studio data.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
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
        return <CheckCircle className="h-6 w-6 text-green-500" />;
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

        {/* Features Grid */}
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
              onClick={userModel?.trainingStatus === 'completed' ? handleStartGenerating : handleTrainModel}
              disabled={userModel?.trainingStatus === 'training' || userModel?.trainingStatus === 'pending'}
              className="w-full px-4 py-2 text-sm font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              {userModel?.trainingStatus === 'completed' ? 'Generate Photos' : 'Train Model First'}
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
      </div>
    </div>
  );
};

export default StudioScreen;
