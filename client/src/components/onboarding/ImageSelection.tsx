import { FC, useState } from 'react';
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
    personalAssets: string[];
  };
  onSelectionComplete: (selected: string[]) => void;
}

const ImageSelection: FC<ImageSelectionProps> = ({ 
  aiGallery, 
  flatlayLibrary, 
  onSelectionComplete 
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageSelect = (image: string) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(selectedImages.filter(img => img !== image));
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  return (
    <div className="space-y-12 p-6 bg-pure-white">
      <div>
        <h2 className="editorial-headline mb-2">Choose Photos That Show the Real You</h2>
        <p className="system-text text-soft-gray mb-8">
          Pick images that capture your authentic style and personality. These will become the foundation of your personal brand.
        </p>
      </div>

      <ScrollArea className="h-[800px] pr-6">
        <div className="space-y-12">
          {/* Your AI Photos Section */}
          <div className="space-y-4">
            <h3 className="editorial-subheadline">Your AI-Generated Photos</h3>
            <p className="system-text text-soft-gray">Professional photos of you, styled to perfection</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {aiGallery.userGeneratedPhotos.map((photo, index) => (
                <Card 
                  key={index} 
                  className={`aspect-[3/4] cursor-pointer transition-all duration-300 ${
                    selectedImages.includes(photo) ? 'border-luxury-black shadow-lg' : 'border-accent-line hover:border-soft-gray'
                  }`}
                  onClick={() => handleImageSelect(photo)}
                >
                  <img 
                    src={photo} 
                    alt={`Your styled photo ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </Card>
              ))}
            </div>
          </div>

          {/* Editorial Versions */}
          <div className="space-y-4">
            <h3 className="editorial-subheadline">Editorial Style Variations</h3>
            <p className="system-text text-soft-gray">Magazine-worthy versions of your photos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {aiGallery.editorialVersions.map((photo, index) => (
                <Card 
                  key={index} 
                  className={`aspect-[3/4] cursor-pointer transition-all duration-300 ${
                    selectedImages.includes(photo) ? 'border-luxury-black shadow-lg' : 'border-accent-line hover:border-soft-gray'
                  }`}
                  onClick={() => handleImageSelect(photo)}
                >
                  <img 
                    src={photo} 
                    alt={`Editorial style ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </Card>
              ))}
            </div>
          </div>

          {/* Luxury Lifestyle Section */}
          <div className="space-y-4">
            <h3 className="editorial-subheadline">Luxury Lifestyle Assets</h3>
            <p className="system-text text-soft-gray">Curated luxury pieces that complement your aesthetic</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {flatlayLibrary.luxuryBrands.map((asset, index) => (
                <Card 
                  key={index} 
                  className={`aspect-[3/4] cursor-pointer transition-all duration-300 ${
                    selectedImages.includes(asset) ? 'border-luxury-black shadow-lg' : 'border-accent-line hover:border-soft-gray'
                  }`}
                  onClick={() => handleImageSelect(asset)}
                >
                  <img 
                    src={asset} 
                    alt={`Luxury asset ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Selected Preview */}
      <div className="mt-8 pt-6 border-t border-accent-line">
        <h4 className="eyebrow-text mb-4">Your Selected Images ({selectedImages.length})</h4>
        <div className="grid grid-cols-4 gap-4">
          {selectedImages.map((image, index) => (
            <img 
              key={index}
              src={image}
              alt={`Selected ${index + 1}`}
              className="aspect-square object-cover rounded border border-accent-line"
            />
          ))}
        </div>
        {selectedImages.length > 0 && (
          <button 
            onClick={() => onSelectionComplete(selectedImages)}
            className="mt-6 px-6 py-3 bg-luxury-black text-pure-white hover:bg-soft-gray transition-colors"
          >
            Continue with {selectedImages.length} Selected Photos
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageSelection;