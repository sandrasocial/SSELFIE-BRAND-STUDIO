import React from 'react';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

interface ImageSectionProps {
  title: string;
  images: string[];
  onSelect: (image: string) => void;
}

const ImageSection: React.FC<ImageSectionProps> = ({ title, images, onSelect }) => (
  <div className="space-y-4">
    <h3 className="editorial-subheadline">{title}</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
      {images.map((image, i) => (
        <Card 
          key={i}
          className="aspect-[3/4] cursor-pointer group relative overflow-hidden"
          onClick={() => onSelect(image)}
        >
          <div className="absolute inset-0 bg-luxury-black opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10" />
          <img 
            src={image} 
            alt={`Selection ${i}`}
            className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
          />
        </Card>
      ))}
    </div>
  </div>
);

export interface ImageSelection {
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
  selectedImages: string[];
}

interface ImageSelectorProps {
  imageSelection: ImageSelection;
  onImageSelect: (image: string) => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  imageSelection,
  onImageSelect
}) => {
  return (
    <div className="space-y-16 p-8 md:p-12 bg-pure-white">
      <div className="max-w-2xl">
        <h2 className="editorial-headline mb-4">Show Your True Self</h2>
        <p className="system-text text-soft-gray text-lg leading-relaxed">
          Pick photos that capture the real you - your style, personality, and what makes you unique
        </p>
      </div>

      <ScrollArea className="h-[800px] pr-6">
        <div className="space-y-12">
          <ImageSection
            title="Your AI-Generated Photos"
            images={imageSelection.aiGallery.userGeneratedPhotos}
            onSelect={onImageSelect}
          />
          
          <ImageSection
            title="Editorial Versions"
            images={imageSelection.aiGallery.editorialVersions}
            onSelect={onImageSelect}
          />

          <ImageSection
            title="Luxury Brand Assets"
            images={imageSelection.flatlayLibrary.luxuryBrands}
            onSelect={onImageSelect}
          />

          <ImageSection
            title="Editorial Layouts"
            images={imageSelection.flatlayLibrary.editorialLayouts}
            onSelect={onImageSelect}
          />
        </div>
      </ScrollArea>

      <div className="mt-8 pt-6 border-t border-accent-line">
        <h4 className="eyebrow-text mb-4">Selected Images</h4>
        <div className="grid grid-cols-4 gap-4">
          {imageSelection.selectedImages.map((image, i) => (
            <img 
              key={i}
              src={image}
              alt={`Selected ${i}`}
              className="aspect-square object-cover"
            />
          ))}
        </div>
      </div>
    </div>
  );
};