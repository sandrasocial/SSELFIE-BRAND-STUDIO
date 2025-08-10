import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface PreviewWindowProps {
  children: React.ReactNode;
}

export const PreviewWindow: React.FC<PreviewWindowProps> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="editorial-subheadline">Preview</h3>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            onClick={() => setViewMode('desktop')}
            className="eyebrow-text"
          >
            Desktop
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            onClick={() => setViewMode('mobile')}
            className="eyebrow-text"
          >
            Mobile
          </Button>
        </div>
      </div>

      <Card className="bg-pure-white border border-accent-line overflow-hidden">
        <div className="p-4 border-b border-accent-line bg-editorial-gray">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-soft-gray" />
            <div className="w-3 h-3 rounded-full bg-soft-gray" />
            <div className="w-3 h-3 rounded-full bg-soft-gray" />
          </div>
        </div>
        
        <div className={`transition-all duration-300 ${
          viewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
        } mx-auto`}>
          <div className="relative" style={{
            height: '800px',
            overflow: 'auto'
          }}>
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
};