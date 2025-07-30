import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWebsiteBuilder } from '@/hooks/useWebsiteBuilder';

interface WebsitePreviewProps {
  website: any;
  onCustomize: () => void;
  onDeploy: () => void;
}

export function WebsitePreview({ website, onCustomize, onDeploy }: WebsitePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { deployWebsite, isDeploying } = useWebsiteBuilder();

  const handleDeploy = async () => {
    try {
      await deployWebsite.mutateAsync({
        siteId: website.id,
        domainPreferences: {}
      });
      onDeploy();
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  const viewportStyles = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px', margin: '0 auto' },
    mobile: { width: '375px', height: '600px', margin: '0 auto' }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-normal mb-4" style={{ fontFamily: 'Times New Roman' }}>
          Website Preview
        </h1>
        <p className="text-gray-600">
          Review your generated website and make any adjustments before deployment.
        </p>
      </div>

      <div className="bg-white border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Preview Mode:</span>
            <div className="flex border border-gray-300 rounded">
              {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-xs rounded-none ${
                    viewMode === mode 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCustomize}
              className="px-6"
            >
              Customize Design
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-6 bg-black text-white hover:bg-gray-800"
            >
              {isDeploying ? 'Deploying...' : 'Deploy Website'}
            </Button>
          </div>
        </div>

        <div className="border border-gray-300 bg-gray-50 p-4">
          <div 
            className="bg-white border border-gray-200 shadow-sm overflow-hidden"
            style={viewportStyles[viewMode]}
          >
            <iframe
              src={`data:text/html;charset=utf-8,${encodeURIComponent(website.preview)}`}
              className="w-full h-full border-0"
              title="Website Preview"
            />
          </div>
        </div>
      </div>

      {website.status === 'deployed' && website.deploymentUrl && (
        <div className="bg-green-50 border border-green-200 p-6 rounded">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Website Successfully Deployed
          </h3>
          <p className="text-green-700 mb-4">
            Your website is now live and accessible to visitors.
          </p>
          <div className="flex items-center space-x-4">
            <a
              href={website.deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Visit Your Website
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(website.deploymentUrl)}
            >
              Copy URL
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-6">
          <h4 className="font-medium mb-2">Template</h4>
          <p className="text-sm text-gray-600">
            {website.template?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </p>
        </div>
        <div className="bg-gray-50 p-6">
          <h4 className="font-medium mb-2">Generation Time</h4>
          <p className="text-sm text-gray-600">
            {website.estimatedGenerationTime || 25} seconds
          </p>
        </div>
        <div className="bg-gray-50 p-6">
          <h4 className="font-medium mb-2">Status</h4>
          <p className="text-sm text-gray-600 capitalize">
            {website.status}
          </p>
        </div>
      </div>
    </div>
  );
}