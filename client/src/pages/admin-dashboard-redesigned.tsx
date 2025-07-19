import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
  path: string;
  icon: string;
  completedCount?: number;
  totalCount?: number;
}

interface ProgressData {
  hasUploadedPhotos: boolean;
  hasGeneratedImages: boolean;
  hasCompletedOnboarding: boolean;
  uploadedPhotosCount: number;
  generatedImagesCount: number;
}

function getJourneySteps(progressData: ProgressData | null): JourneyStep[] {
  const hasUploadedPhotos = progressData?.hasUploadedPhotos || false;
  const hasGeneratedImages = progressData?.hasGeneratedImages || false;
  const hasCompletedOnboarding = progressData?.hasCompletedOnboarding || false;
  const uploadedPhotosCount = progressData?.uploadedPhotosCount || 0;
  const generatedImagesCount = progressData?.generatedImagesCount || 0;

  return [
    {
      id: 'upload',
      title: 'UPLOAD YOUR SELFIES',
      description: 'Share 10-15 photos to train your AI model',
      status: hasUploadedPhotos ? 'completed' : 'active',
      path: '/upload',
      icon: '↑',
      completedCount: uploadedPhotosCount,
      totalCount: 15,
    },
    {
      id: 'generate',
      title: 'GENERATE YOUR BRAND PHOTOS',
      description: 'Create stunning editorial images with AI magic',
      status: hasUploadedPhotos 
        ? (hasGeneratedImages ? 'completed' : 'active')
        : 'locked',
      path: '/visual-editor',
      icon: '✨',
      completedCount: generatedImagesCount,
      totalCount: null,
    },
    {
      id: 'refine',
      title: 'REFINE YOUR AESTHETIC',
      description: 'Perfect your visual style and brand voice',
      status: hasGeneratedImages
        ? (hasCompletedOnboarding ? 'completed' : 'active')
        : 'locked',
      path: '/refine',
      icon: '⚡',
    },
    {
      id: 'build',
      title: 'BUILD YOUR EMPIRE',
      description: 'Launch your complete business ecosystem in minutes',
      status: hasCompletedOnboarding ? 'active' : 'locked',
      path: '/build',
      icon: '👑',
    },
  ];
}

export default function Workspace() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ['/api/user/progress'],
    enabled: !!user,
  });

  const journeySteps = getJourneySteps(progressData);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-4xl font-serif text-black uppercase tracking-wide"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                Your Transformation Journey
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                From selfies to empire, one step at a time
              </p>
            </div>
            <Link href="/admin">
              <Button className="border-black text-black hover:bg-black hover:text-white">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Journey Steps */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {journeySteps.map((step, index) => (
            <div
              key={step.id}
              className={`relative overflow-hidden border ${
                step.status === 'active'
                  ? 'border-black bg-white'
                  : step.status === 'completed'
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              {/* Step Number */}
              <div className="absolute left-4 top-4">
                <div
                  className={`flex h-8 w-8 items-center justify-center text-sm font-medium ${
                    step.status === 'active'
                      ? 'bg-black text-white'
                      : step.status === 'completed'
                      ? 'bg-gray-400 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
              </div>

              {/* Step Icon */}
              <div className="flex h-32 items-center justify-center">
                <span className="text-4xl">{step.icon}</span>
              </div>

              {/* Step Content */}
              <div className="p-6 pt-2">
                <h3 
                  className="text-xl font-serif text-black uppercase tracking-wide mb-2"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {step.description}
                </p>

                {/* Progress Indicator */}
                {step.completedCount !== undefined && step.totalCount && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{step.completedCount}/{step.totalCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2">
                      <div 
                        className="bg-black h-2 transition-all duration-300"
                        style={{ 
                          width: `${Math.min((step.completedCount / step.totalCount) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Step-specific progress for Generate */}
                {step.id === 'generate' && step.completedCount !== undefined && !step.totalCount && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">
                      {step.completedCount} images generated
                    </div>
                    <div className="w-full bg-gray-200 h-2">
                      <div className="bg-black h-2 w-full" />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {step.status !== 'locked' && (
                  <Link href={step.path}>
                    <Button 
                      className={`w-full ${
                        step.status === 'active'
                          ? 'border-black text-black hover:bg-black hover:text-white'
                          : 'border-gray-400 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {step.status === 'completed' ? 'Revisit' : 'Continue'}
                    </Button>
                  </Link>
                )}

                {step.status === 'locked' && (
                  <Button 
                    disabled
                    className="w-full border-gray-300 text-gray-400 cursor-not-allowed"
                  >
                    Locked
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Journey Progress Overview */}
        <div className="mt-16 text-center">
          <h2 
            className="text-3xl font-serif text-black uppercase tracking-wide mb-4"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Your Empire Awaits
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every step brings you closer to the confident, magnetic, unapologetic version of yourself. 
            Your transformation is already beginning.
          </p>
        </div>
      </div>
    </div>
  );
}