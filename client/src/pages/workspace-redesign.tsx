import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MemberNavigation } from '../components/member-navigation';
import { GlobalFooter } from '../components/global-footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Upload, 
  Sparkles, 
  Image, 
  Globe, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Camera,
  Palette,
  Layout,
  MessageCircle
} from 'lucide-react';

/**
 * SSELFIE STUDIO REDESIGNED MEMBER WORKSPACE
 * 4-Step Personal Brand Journey: Train → Style → Gallery → Build
 * Powered by Sandra's 15-Agent AI Ecosystem
 */

interface WorkspaceStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  agent: string;
  estimatedTime: string;
  features: string[];
}

export default function WorkspaceRedesign() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Fetch user data with proper typing
  const { data: userModel } = useQuery({
    queryKey: ['/api/user-model'],
    enabled: isAuthenticated
  });

  const { data: aiImages = [] } = useQuery({
    queryKey: ['/api/ai-images'],
    enabled: isAuthenticated
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated
  });

  // Calculate step statuses based on user progress
  const getStepStatus = (stepId: string): 'locked' | 'available' | 'in-progress' | 'completed' => {
    const modelData = userModel as any;
    const imagesArray = Array.isArray(aiImages) ? aiImages : [];
    
    switch (stepId) {
      case 'train':
        if (!modelData) return 'available';
        if (modelData.trainingStatus === 'training' || modelData.trainingStatus === 'starting') return 'in-progress';
        if (modelData.trainingStatus === 'completed') return 'completed';
        return 'available';
      
      case 'style':
        if (modelData?.trainingStatus !== 'completed') return 'locked';
        if (imagesArray.length > 0) return 'completed';
        return 'available';
      
      case 'gallery':
        if (imagesArray.length === 0) return 'locked';
        return 'available';
      
      case 'build':
        if (imagesArray.length < 5) return 'locked';
        return 'available';
      
      default:
        return 'locked';
    }
  };

  const workspaceSteps: WorkspaceStep[] = [
    {
      id: 'train',
      title: 'Train Your AI Model',
      description: 'Upload your selfies to create a custom FLUX model that captures your unique features and style.',
      icon: <Upload className="h-8 w-8" />,
      status: getStepStatus('train'),
      agent: 'FLUX + Maya',
      estimatedTime: '2-4 hours',
      features: [
        'Custom FLUX 1.1 Pro model training',
        'AI-guided photo quality analysis',
        'Real-time training progress',
        'Automatic style optimization'
      ]
    },
    {
      id: 'style',
      title: 'Style Your Photoshoot',
      description: 'Chat with Maya to create stunning personal brand photos tailored to your professional goals.',
      icon: <Sparkles className="h-8 w-8" />,
      status: getStepStatus('style'),
      agent: 'Maya + Aria',
      estimatedTime: '15-30 minutes',
      features: [
        'AI style consultation with Maya',
        'Professional photoshoot themes',
        'Luxury brand aesthetic',
        'Instant generation and previews'
      ]
    },
    {
      id: 'gallery',
      title: 'Curate Your Gallery',
      description: 'Organize and manage your personal brand photo collection with smart categorization and optimization.',
      icon: <Image className="h-8 w-8" />,
      status: getStepStatus('gallery'),
      agent: 'Victoria + Rachel',
      estimatedTime: '10-20 minutes',
      features: [
        'Smart photo categorization',
        'Social media format optimization',
        'Caption suggestions by Rachel',
        'Multi-format downloads'
      ]
    },
    {
      id: 'build',
      title: 'Build Your Website',
      description: 'Create a professional personal brand website with Victoria using your curated photo gallery.',
      icon: <Globe className="h-8 w-8" />,
      status: getStepStatus('build'),
      agent: 'Victoria + Zara',
      estimatedTime: '20-40 minutes',
      features: [
        'Chat-based website design',
        'Professional brand templates',
        'Auto-populated with your photos',
        'Custom domain deployment'
      ]
    }
  ];

  const getProgressPercentage = (): number => {
    const completedSteps = workspaceSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / workspaceSteps.length) * 100;
  };

  const getCurrentStep = (): WorkspaceStep | null => {
    return workspaceSteps.find(step => 
      step.status === 'available' || step.status === 'in-progress'
    ) || null;
  };

  const renderStepCard = (step: WorkspaceStep, index: number) => {
    const isLocked = step.status === 'locked';
    const isCompleted = step.status === 'completed';
    const isInProgress = step.status === 'in-progress';
    const isAvailable = step.status === 'available';

    const getStepRoute = (stepId: string) => {
      switch (stepId) {
        case 'train': return '/simple-training';
        case 'style': return '/maya';
        case 'gallery': return '/sselfie-gallery';
        case 'build': return '/victoria';
        default: return '#';
      }
    };

    return (
      <Card 
        key={step.id}
        className={`
          relative transition-all duration-300 hover:shadow-lg
          ${isLocked ? 'opacity-50 bg-gray-50' : ''}
          ${isCompleted ? 'border-green-200 bg-green-50' : ''}
          ${isInProgress ? 'border-amber-200 bg-amber-50' : ''}
          ${isAvailable ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' : ''}
        `}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                p-3 rounded-full
                ${isLocked ? 'bg-gray-200 text-gray-400' : ''}
                ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                ${isInProgress ? 'bg-amber-100 text-amber-600' : ''}
                ${isAvailable ? 'bg-blue-100 text-blue-600' : ''}
              `}>
                {step.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">
                    Step {index + 1}
                  </span>
                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {isInProgress && <Clock className="h-4 w-4 text-amber-600 animate-pulse" />}
                </div>
                <CardTitle className="text-xl mb-1">{step.title}</CardTitle>
              </div>
            </div>
            <Badge 
              variant={isCompleted ? "default" : isInProgress ? "secondary" : "outline"}
              className={`
                ${isCompleted ? 'bg-green-100 text-green-700' : ''}
                ${isInProgress ? 'bg-amber-100 text-amber-700' : ''}
              `}
            >
              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : isLocked ? 'Locked' : 'Ready'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <CardDescription className="text-gray-600 mb-4 leading-relaxed">
            {step.description}
          </CardDescription>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Powered by {step.agent}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{step.estimatedTime}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {step.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              {isLocked ? (
                <Button disabled className="w-full">
                  Complete Previous Steps First
                </Button>
              ) : isCompleted ? (
                <div className="flex space-x-2">
                  <Link href={getStepRoute(step.id)} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View & Edit
                    </Button>
                  </Link>
                  <div className="px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                    ✓ Done
                  </div>
                </div>
              ) : (
                <Link href={getStepRoute(step.id)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {isInProgress ? 'Continue' : 'Start'} {step.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberNavigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Personal Brand Journey
              </h1>
              <p className="text-gray-600 text-lg">
                Create professional brand photos and website in 4 simple steps
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Overall Progress</p>
              <div className="flex items-center space-x-2">
                <Progress value={getProgressPercentage()} className="w-32" />
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
            </div>
          </div>

          {/* Current Step Highlight */}
          {getCurrentStep() && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Next: {getCurrentStep()?.title}
                  </h3>
                  <p className="text-blue-100">
                    {getCurrentStep()?.description}
                  </p>
                </div>
                <Link href={`/simple-training`}>
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    Continue Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaceSteps.map((step, index) => renderStepCard(step, index))}
        </div>

        {/* Success Message */}
        {getProgressPercentage() === 100 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  Congratulations! Your Personal Brand Journey is Complete! 🎉
                </h3>
                <p className="text-green-700">
                  You now have a custom AI model, professional brand photos, curated gallery, and a personal website. 
                  Start sharing your professional brand with the world!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Agent Team Credit */}
        <div className="mt-12 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Powered by Sandra's AI Agent Team
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-900">FLUX + Maya</div>
              <div className="text-gray-600">Model Training & Style</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">Maya + Aria</div>
              <div className="text-gray-600">Photo Generation</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">Victoria + Rachel</div>
              <div className="text-gray-600">Gallery & Content</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">Victoria + Zara</div>
              <div className="text-gray-600">Website Building</div>
            </div>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}