import React from 'react';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

interface ImageSelectionProps {
  aiGallery: {
    userGeneratedPhotos: string[];
    styledVariations: string[];
    editorialVersions: string[];
  };
  flatlayLibrary: {
    luxuryBrands: string[];
    editorialLayouts: string[];
    businessAssets: string[];
  };
  onImageSelect: (images: string[]) => void;
}

export const ImageSelector: React.FC<ImageSelectionProps> = ({
  aiGallery,
  flatlayLibrary,
  onImageSelect
}) => {
  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);

  const handleImageSelect = (imagePath: string) => {
    const newSelection = selectedImages.includes(imagePath)
      ? selectedImages.filter(img => img !== imagePath)
      : [...selectedImages, imagePath];
    
    setSelectedImages(newSelection);
    onImageSelect(newSelection);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="editorial-headline mb-4">Curate Your Visual Story</h2>
        <p className="editorial-subheadline mb-8">Select images that reflect your brand's editorial essence</p>
      </div>

      {/* AI Generated Photos Section */}
      <section className="space-y-4">
        <h3 className="eyebrow-text">Your AI Portfolio</h3>
        <ScrollArea className="h-[400px] w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {aiGallery.editorialVersions.map((photo, index) => (
              <Card 
                key={index}
                className={`aspect-[3/4] cursor-pointer transition-all duration-300 ${
                  selectedImages.includes(photo) ? 'ring-2 ring-luxury-black' : ''
                }`}
                onClick={() => handleImageSelect(photo)}
              >
                <img 
                  src={photo} 
                  alt={`AI Editorial ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </Card>
            ))}
          </div>
        </ScrollArea>
      </section>

      {/* Flatlay Library Section */}
      <section className="space-y-4">
        <h3 className="eyebrow-text">Luxury Flatlay Collection</h3>
        <ScrollArea className="h-[400px] w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {flatlayLibrary.editorialLayouts.map((layout, index) => (
              <Card 
                key={index}
                className={`aspect-square cursor-pointer transition-all duration-300 ${
                  selectedImages.includes(layout) ? 'ring-2 ring-luxury-black' : ''
                }`}
                onClick={() => handleImageSelect(layout)}
              >
                <img 
                  src={layout} 
                  alt={`Flatlay ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </Card>
            ))}
          </div>
        </ScrollArea>
      </section>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <section className="space-y-4">
          <h3 className="eyebrow-text">Selected Images</h3>
          <div className="flex gap-4 overflow-x-auto py-4">
            {selectedImages.map((image, index) => (
              <img 
                key={index}
                src={image}
                alt={`Selected ${index + 1}`}
                className="h-24 w-auto object-cover"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};