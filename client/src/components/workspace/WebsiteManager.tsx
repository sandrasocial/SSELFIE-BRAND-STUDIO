import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { VictoriaEditorialBuilder } from '../victoria/VictoriaEditorialBuilder';
import { WebsitePreview } from '../victoria/WebsitePreview';
import { apiRequest } from './lib/queryClient';

interface WebsiteManagerProps {
  onComplete?: () => void;
}

export function WebsiteManager({ onComplete }: WebsiteManagerProps) {
  const [currentStep, setCurrentStep] = useState<'create' | 'preview' | 'deploy'>('create');
  const [websiteData, setWebsiteData] = useState<any>(null);

  // Fetch user's existing websites
  const { data: websites = [], isLoading } = useQuery({
    queryKey: ['/api/websites'],
    retry: false,
  });

  const handleWebsiteGenerated = (website: any) => {
    setWebsiteData(website);
    setCurrentStep('preview');
  };

  const handleCustomize = () => {
    setCurrentStep('create');
  };

  const handleDeploy = () => {
    setCurrentStep('deploy');
    if (onComplete) {
      onComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">
          <div className="text-2xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
            Loading Website Manager...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
          Website Builder
        </h1>
        <p className="text-gray-600 mb-6">
          Create your professional website using Victoria AI and your editorial images.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4 mb-8">
          {[
            { key: 'create', label: 'Create' },
            { key: 'preview', label: 'Preview' },
            { key: 'deploy', label: 'Deploy' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.key
                    ? 'bg-black text-white'
                    : step.key === 'preview' && websiteData
                    ? 'bg-gray-800 text-white'
                    : step.key === 'deploy' && currentStep === 'deploy'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className={`ml-2 ${
                currentStep === step.key ? 'text-black font-medium' : 'text-gray-600'
              }`}>
                {step.label}
              </span>
              {index < 2 && (
                <div className="w-8 h-px bg-gray-300 ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Existing Websites */}
      {websites.length > 0 && currentStep === 'create' && (
        <div className="mb-8">
          <h2 className="text-2xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
            Your Websites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websites.map((website: any) => (
              <Card key={website.id} className="p-4">
                <h3 className="font-medium mb-2">{website.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{website.description}</p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/preview/${website.slug}`, '_blank')}
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setWebsiteData(website);
                      setCurrentStep('preview');
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      {currentStep === 'create' && (
        <VictoriaEditorialBuilder onWebsiteGenerated={handleWebsiteGenerated} />
      )}

      {currentStep === 'preview' && websiteData && (
        <WebsitePreview
          website={websiteData}
          onCustomize={handleCustomize}
          onDeploy={handleDeploy}
        />
      )}

      {currentStep === 'deploy' && (
        <div className="text-center py-12">
          <div className="text-3xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
            Website Deployed Successfully!
          </div>
          <p className="text-gray-600 mb-6">
            Your website is now live and ready to share with the world.
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => window.open(websiteData?.previewUrl, '_blank')}
              className="px-6"
            >
              View Live Site
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentStep('create')}
              className="px-6"
            >
              Create Another Website
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}