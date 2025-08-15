import React from 'react';
import { Card } from '../ui/card';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Laptop, Smartphone } from 'lucide-react';

interface PreviewWindowProps {
  previewUrl: string;
  isLoading?: boolean;
}

export const PreviewWindow: React.FC<PreviewWindowProps> = ({
  previewUrl,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="editorial-subheadline">Preview</h3>
        <ToggleGroup 
          type="single" 
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'desktop' | 'mobile')}
          className="border border-accent-line"
        >
          <ToggleGroupItem value="desktop" aria-label="Desktop view">
            <Laptop className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="mobile" aria-label="Mobile view">
            <Smartphone className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Card className="overflow-hidden bg-white">
        <div 
          className={`transition-all duration-300 ${
            viewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
          } mx-auto`}
        >
          {isLoading ? (
            <div className="animate-luxuryFade w-full aspect-[16/9] bg-editorial-gray" />
          ) : (
            <iframe
              src={previewUrl}
              className="w-full aspect-[16/9] border-0"
              title="Website Preview"
            />
          )}
        </div>
      </Card>
    </div>
  );
};